const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeSampleData } = require('./mockDatabase');

const tasksRoutes = require('./routes/tasks');
const categoriesRoutes = require('./routes/categories');

const app = express();
const port = process.env['PORT'] || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/tasks', tasksRoutes);
app.use('/api/categories', categoriesRoutes);

initializeSampleData();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
