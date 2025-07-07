const { categories } = require('../mockDatabase');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  const { page = 1, pageSize = 5, search = '' } = req.query;
  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(pageSize);
  const searchTerm = search.toLowerCase();

  const filtered = searchTerm
    ? categories.filter(category => category.title.toLowerCase().includes(searchTerm))
    : categories;

  const start = (pageNum - 1) * pageSizeNum;
  const items = filtered.slice(start, start + pageSizeNum);

  res.json({
    items,
    total: filtered.length,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(filtered.length / pageSizeNum),
  });
};

exports.get = async (req, res) => {
  const category = categories.find(t => t.id === req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
};

exports.create = async (req, res) => {
  const { title, description, tasks } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const now = new Date().toISOString();
  const newCategory = {
    id: uuidv4(),
    title,
    description,
    tasks,
    createdAt: now,
    updatedAt: now,
  };

  categories.unshift(newCategory);
  res.status(201).json(newCategory);
};

exports.update = async (req, res) => {
  const index = categories.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  let updatedTasks = [...(categories[index].tasks || [])];

  if (req.body.removeTask) {
    updatedTasks = updatedTasks.filter(t => t.id !== req.body.removeTask.id);
  } else if (Array.isArray(req.body.tasks)) {
    for (const newTask of req.body.tasks) {
      const exists = updatedTasks.some(t => t.id === newTask.id);
      if (!exists) {
        updatedTasks.push({ id: newTask.id, title: newTask.title });
      }
    }
  }

  const updated = {
    ...categories[index],
    ...req.body,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString(),
  };

  categories[index] = updated;
  res.json(updated);
};

exports.remove = async (req, res) => {
  const index = categories.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  categories.splice(index, 1);
  res.status(204).send();
};
