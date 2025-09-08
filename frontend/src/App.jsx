import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch('/api/todos');
        if (!res.ok) {
          throw new Error(`Failed to fetch todos: ${res.status}`);
        }
        const todos = await res.json();
        setTodos(todos);
      } catch (error) {
        console.error('Error fetching todos:', error);
        // You could set an error state here to display to the user
      }
    };
    
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo.trim() })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to add todo: ${res.status}`);
      }
      
      const todo = await res.json();
      setTodos([...todos, todo]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update todo: ${res.status}`);
      }
      
      const updated = await res.json();
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id, todoText) => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${todoText}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.status}`);
      }
      
      // Only update state if deletion was successful
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h1>Todo App</h1>
      <input
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
        placeholder="Add todo"
      />
      <button onClick={addTodo} disabled={!newTodo.trim()}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              {todo.text}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id, todo.text)} 
              style={{ 
                marginLeft: 8, 
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title={`Delete "${todo.text}"`}
              aria-label={`Delete todo: ${todo.text}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
