const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Create todos table if not exists
pool.query(`CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false
)`);

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Todo text is required' });
    }
    
    const result = await pool.query('INSERT INTO todos (text) VALUES ($1) RETURNING *', [text.trim()]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update todo (completed status and/or text)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, text } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }
    
    // Validate completed field if provided
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    
    // Validate text field if provided
    if (text !== undefined && (!text || !text.trim())) {
      return res.status(400).json({ error: 'Todo text cannot be empty' });
    }
    
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let valueIndex = 1;
    
    if (completed !== undefined) {
      updates.push(`completed = $${valueIndex}`);
      values.push(completed);
      valueIndex++;
    }
    
    if (text !== undefined) {
      updates.push(`text = $${valueIndex}`);
      values.push(text.trim());
      valueIndex++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Add the id parameter
    values.push(id);
    
    const query = `UPDATE todos SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id is a valid number
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }
    
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    
    // Check if any rows were affected (i.e., if the todo existed)
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
