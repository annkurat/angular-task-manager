const { TASKS, CATEGORIES } = require('./utils/constants');
const { v4: uuidv4 } = require('uuid');

const tasks = [];
const categories = [];

const initializeSampleData = () => {
  tasks.length = 0;
  categories.length = 0;

  tasks.push(
    ...TASKS.map(task => ({
      ...task,
      id: uuidv4(),
    }))
  );

  categories.push(
    ...CATEGORIES.map(category => ({
      ...category,
      id: uuidv4(),
    }))
  );
};

module.exports = {
  tasks,
  categories,
  initializeSampleData,
};
