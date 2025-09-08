const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes
let todos = [
  { id: 1, text: 'Learn React', completed: false },
  { id: 2, text: 'Build a todo app', completed: true },
  { id: 3, text: 'Deploy the app', completed: false }
];
let nextId = 4;

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  
  const todo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };
  
  todos.push(todo);
  res.json(todo);
});

// Update todo completion status
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }
  
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }
  
  const todoIndex = todos.findIndex(t => t.id === parseInt(id));
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos[todoIndex].completed = completed;
  res.json(todos[todoIndex]);
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }
  
  const todoIndex = todos.findIndex(t => t.id === parseInt(id));
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(todoIndex, 1);
  res.sendStatus(204);
});

const port = 5000;
app.listen(port, () => {
  console.log(`Mock server running on port ${port}`);
});