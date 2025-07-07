const { tasks, categories } = require('../mockDatabase');
const categoriesController = require('./categoriesController');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 5, 
      search = '',
      status,
      start,
      end
    } = req.query;

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const searchTerm = search.toLowerCase();
    const statuses = status ? status.split(',') : [];
    
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const filtered = tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm);

      const matchesStatus = statuses.length === 0 || 
        statuses.includes(task.status);

      let matchesDate = true;
      const taskDate = new Date(task.dueDate);
      if (startDate && endDate) {
        matchesDate = taskDate >= startDate && taskDate <= endDate;
      } else if (startDate) {
        matchesDate = taskDate >= startDate;
      } else if (endDate) {
        matchesDate = taskDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    const startIndex = (pageNum - 1) * pageSizeNum;
    const items = filtered.slice(startIndex, startIndex + pageSizeNum);

    res.json({
      items,
      total: filtered.length,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(filtered.length / pageSizeNum),
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.create = async (req, res) => {
  const { title, description, status, priority, dueDate, categoryId } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const now = new Date().toISOString();
  const newTask = {
    id: uuidv4(),
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate,
    categoryId,
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(newTask);
  
  if (categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      if (!category.tasks) {
        category.tasks = [];
      }
      category.tasks.push({ id: newTask.id, title: newTask.title });
    }
  }
  
  res.status(201).json(newTask);
};

exports.update = async (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  const oldTask = tasks[taskIndex];
  const updated = {
    ...oldTask,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updated;

  if (req.body.categoryId !== oldTask.categoryId) {
    if (oldTask.categoryId) {
      const oldCategory = categories.find(cat => cat.id === oldTask.categoryId);
      if (oldCategory?.tasks) {
        oldCategory.tasks = oldCategory.tasks.filter(t => t.id !== updated.id);
      }
    }

    const newCategory = categories.find(cat => cat.id === req.body.categoryId);
    if (newCategory) {
      if (!newCategory.tasks) {
        newCategory.tasks = [];
      }
      newCategory.tasks.push({ id: updated.id, title: updated.title });
    }
  }

  res.json(updated);
};

exports.remove = async (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  const task = tasks[index];
  
  if (task.categoryId) {
    const categoryReq = {
      params: { id: task.categoryId },
      body: { 
        removeTask: { 
          id: task.id 
        } 
      }
    };
    categoriesController.update(categoryReq, res);
  }
  
  tasks.splice(index, 1);
  res.status(204).send();
};
