from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import os
import uuid

app = Flask(__name__)
app.secret_key = os.urandom(24)

# 初始化数据库
def init_db():
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 username TEXT NOT NULL,
                 password TEXT NOT NULL,
                 is_admin BOOLEAN NOT NULL,
                 nickname TEXT,
                 invite_code TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS works
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 user_id INTEGER NOT NULL,
                 title TEXT NOT NULL,
                 password TEXT,
                 file_path TEXT NOT NULL,
                 FOREIGN KEY (user_id) REFERENCES users(id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS archives
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 name TEXT NOT NULL,
                 parent_id INTEGER,
                 FOREIGN KEY (parent_id) REFERENCES archives(id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS work_archives
                 (work_id INTEGER,
                 archive_id INTEGER,
                 FOREIGN KEY (work_id) REFERENCES works(id),
                 FOREIGN KEY (archive_id) REFERENCES archives(id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS share_links
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 work_id INTEGER,
                 share_key TEXT NOT NULL,
                 FOREIGN KEY (work_id) REFERENCES works(id))''')
    # 插入预设管理员
    c.execute("SELECT * FROM users WHERE username = 'lqy'")
    if not c.fetchone():
        c.execute("INSERT INTO users (username, password, is_admin) VALUES ('lqy', 'lqy2291107', 1)")
    conn.commit()
    conn.close()

# 生成邀请码
def generate_invite_code():
    return str(uuid.uuid4())

# 首页
@app.route('/')
def index():
    if 'username' in session:
        return render_template('index.html', username=session['username'])
    return redirect(url_for('login'))

# 登录
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = sqlite3.connect('worksharing.db')
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username =? AND password =?", (username, password))
        user = c.fetchone()
        conn.close()
        if user:
            session['username'] = username
            session['is_admin'] = user[3]
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='用户名或密码错误')
    return render_template('login.html')

# 注册
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        invite_code = request.form['invite_code']
        conn = sqlite3.connect('worksharing.db')
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE invite_code =?", (invite_code,))
        valid_invite = c.fetchone()
        if valid_invite:
            c.execute("INSERT INTO users (username, password, is_admin, invite_code) VALUES (?,?, 0,?)",
                      (username, password, invite_code))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        else:
            conn.close()
            return render_template('register.html', error='邀请码无效')
    return render_template('register.html')

# 上传作品
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if 'username' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        title = request.form['title']
        password = request.form.get('password')
        file = request.files['file']
        if file:
            file_path = f'uploads/{file.filename}'
            file.save(file_path)
            conn = sqlite3.connect('worksharing.db')
            c = conn.cursor()
            c.execute("SELECT id FROM users WHERE username =?", (session['username'],))
            user_id = c.fetchone()[0]
            c.execute("INSERT INTO works (user_id, title, password, file_path) VALUES (?,?,?,?)",
                      (user_id, title, password, file_path))
            conn.commit()
            conn.close()
            return redirect(url_for('index'))
    return render_template('upload.html')

# 作品列表
@app.route('/works')
def works():
    if 'username' not in session:
        return redirect(url_for('login'))
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute("SELECT id, title FROM works")
    works = c.fetchall()
    conn.close()
    return render_template('works.html', works=works)

# 访问作品
@app.route('/work/<int:work_id>', methods=['GET', 'POST'])
def work(work_id):
    if 'username' not in session:
        return redirect(url_for('login'))
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute("SELECT * FROM works WHERE id =?", (work_id,))
    work = c.fetchone()
    if work[3] and not session.get('is_admin'):
        if request.method == 'POST':
            password = request.form['password']
            if password == work[3]:
                return render_template('work.html', work=work)
            else:
                return render_template('work_password.html', work_id=work_id, error='密码错误')
        return render_template('work_password.html', work_id=work_id)
    return render_template('work.html', work=work)

# 创建分享链接
@app.route('/share/<int:work_id>')
def share(work_id):
    if 'username' not in session:
        return redirect(url_for('login'))
    share_key = str(uuid.uuid4())
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute("INSERT INTO share_links (work_id, share_key) VALUES (?,?)", (work_id, share_key))
    conn.commit()
    share_url = url_for('shared_work', share_key=share_key, _external=True)
    conn.close()
    return render_template('share.html', share_url=share_url)

# 访问分享作品
@app.route('/shared/<share_key>')
def shared_work(share_key):
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute("SELECT works.* FROM share_links JOIN works ON share_links.work_id = works.id WHERE share_links.share_key =?", (share_key,))
    work = c.fetchone()
    conn.close()
    if work:
        if work[3]:
            return render_template('work_password.html', work_id=work[0])
        return render_template('work.html', work=work)
    return "分享链接无效"

# 归档管理
@app.route('/archives', methods=['GET', 'POST'])
def archives():
    if 'username' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        archive_name = request.form['archive_name']
        parent_id = request.form.get('parent_id')
        conn = sqlite3.connect('worksharing.db')
        c = conn.cursor()
        if parent_id:
            c.execute("INSERT INTO archives (name, parent_id) VALUES (?,?)", (archive_name, parent_id))
        else:
            c.execute("INSERT INTO archives (name) VALUES (?)", (archive_name,))
        conn.commit()
        conn.close()
        return redirect(url_for('archives'))
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute("SELECT * FROM archives")
    archives = c.fetchall()
    conn.close()
    return render_template('archives.html', archives=archives)

# 用户管理
@app.route('/user_management', methods=['GET', 'POST'])
def user_management():
    if 'username' not in session or not session.get('is_admin'):
        return redirect(url_for('index'))
    if request.method == 'POST':
        action = request.form['action']
        if action == 'create':
            username = request.form['username']
            password = request.form['password']
            invite_code = generate_invite_code()
            conn = sqlite3.connect('worksharing.db')
            c = conn.cursor()
            c.execute("INSERT INTO users (username, password, is_admin, invite_code) VALUES (?,?, 0,?)",
                      (username, password, invite_code))
            conn.commit()
            conn.close()
        elif action == 'delete':
            user_id = request.form['user_id']
            conn = sqlite3.connect('worksharing.db')
            c = conn.cursor()
            c.execute("DELETE FROM users WHERE id =?", (user_id,))
            conn.commit()
            conn.close()
    conn = sqlite3.connect('worksharing.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users")
    users = c.fetchall()
    conn.close()
    return render_template('user_management.html', users=users)

# 用户设置
@app.route('/user_settings', methods=['GET', 'POST'])
def user_settings():
    if 'username' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        action = request.form['action']
        if action == 'set_nickname':
            nickname = request.form['nickname']
            conn = sqlite3.connect('worksharing.db')
            c = conn.cursor()
            c.execute("UPDATE users SET nickname =? WHERE username =?", (nickname, session['username']))
            conn.commit()
            conn.close()
        elif action == 'change_password':
            old_password = request.form['old_password']
            new_password = request.form['new_password']
            conn = sqlite3.connect('worksharing.db')
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE username =? AND password =?", (session['username'], old_password))
            user = c.fetchone()
            if user:
                c.execute("UPDATE users SET password =? WHERE username =?", (new_password, session['username']))
                conn.commit()
                conn.close()
            else:
                return render_template('user_settings.html', error='旧密码错误')
        elif action == 'delete_account':
            conn = sqlite3.connect('worksharing.db')
            c = conn.cursor()
            c.execute("DELETE FROM users WHERE username =?", (session['username'],))
            conn.commit()
            conn.close()
            session.pop('username', None)
            return redirect(url_for('login'))
    return render_template('user_settings.html')

# 注销
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
    