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
    <div style={{ maxWidth: 500, margin: 'auto', padding: '20px' }}>
      <h1>Todo App</h1>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <input
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newTodo.trim()) {
              addTodo();
            }
          }}
        />
        <button 
          onClick={addTodo} 
          disabled={!newTodo.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: newTodo.trim() ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: newTodo.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px'
          }}
        >
          Add Todo
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: todo.completed ? '#f8f9fa' : 'transparent',
            borderRadius: '4px',
            border: '1px solid transparent'
          }}>
            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                flex: 1,
                userSelect: 'none'
              }}
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => {}} // Controlled by the label click
                style={{ 
                  marginRight: '8px',
                  cursor: 'pointer',
                  transform: 'scale(1.2)'
                }}
                aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
              />
              <span
                style={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  opacity: todo.completed ? 0.6 : 1,
                  color: todo.completed ? '#6c757d' : 'inherit'
                }}
              >
                {todo.text}
              </span>
            </label>
            <button 
              onClick={() => deleteTodo(todo.id, todo.text)} 
              style={{ 
                marginLeft: '8px', 
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
