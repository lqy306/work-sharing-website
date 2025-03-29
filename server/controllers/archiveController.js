const Archive = require('../models/Archive');
const Work = require('../models/Work');

// 创建归档
exports.createArchive = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    
    // 创建新归档
    const archive = new Archive({
      name,
      description,
      owner: req.user.id,
      parent: parentId || null
    });
    
    // 如果有父归档，更新路径
    if (parentId) {
      const parentArchive = await Archive.findById(parentId);
      if (!parentArchive) {
        return res.status(404).json({ message: '父归档不存在' });
      }
      
      // 检查父归档的所有者
      if (parentArchive.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权在此归档下创建子归档' });
      }
      
      // 设置路径
      const parentPath = await parentArchive.getFullPath();
      archive.path = parentPath;
    }
    
    await archive.save();
    
    res.status(201).json(archive);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取归档列表
exports.getArchives = async (req, res) => {
  try {
    const archives = await Archive.find({ owner: req.user.id })
      .populate('parent', 'name')
      .sort({ createdAt: -1 });
    
    res.json(archives);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取归档树
exports.getArchiveTree = async (req, res) => {
  try {
    // 获取所有归档
    const archives = await Archive.find({ owner: req.user.id });
    
    // 构建归档树
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => {
          return parentId === null 
            ? item.parent === null 
            : item.parent && item.parent.toString() === parentId.toString();
        })
        .map(item => ({
          key: item._id,
          title: item.name,
          children: buildTree(items, item._id)
        }));
    };
    
    const archiveTree = buildTree(archives);
    
    res.json(archiveTree);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取单个归档
exports.getArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id)
      .populate('parent', 'name');
    
    if (!archive) {
      return res.status(404).json({ message: '归档不存在' });
    }
    
    // 检查访问权限
    if (archive.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此归档' });
    }
    
    // 获取子归档
    const children = await Archive.find({ parent: archive._id });
    
    // 获取归档中的作品
    const works = await Work.find({ archive: archive._id });
    
    res.json({
      archive,
      children,
      works
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新归档
exports.updateArchive = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const archive = await Archive.findById(req.params.id);
    
    if (!archive) {
      return res.status(404).json({ message: '归档不存在' });
    }
    
    // 检查权限
    if (archive.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权更新此归档' });
    }
    
    // 更新字段
    if (name) archive.name = name;
    if (description !== undefined) archive.description = description;
    
    archive.updatedAt = Date.now();
    
    await archive.save();
    
    res.json(archive);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 删除归档
exports.deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    
    if (!archive) {
      return res.status(404).json({ message: '归档不存在' });
    }
    
    // 检查权限
    if (archive.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此归档' });
    }
    
    // 检查是否有子归档
    const childArchives = await Archive.find({ parent: archive._id });
    if (childArchives.length > 0) {
      return res.status(400).json({ message: '请先删除所有子归档' });
    }
    
    // 检查是否有作品
    const works = await Work.find({ archive: archive._id });
    if (works.length > 0) {
      return res.status(400).json({ message: '请先移除归档中的所有作品' });
    }
    
    await archive.remove();
    
    res.json({ message: '归档已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};
