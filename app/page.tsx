'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState<{ id: number; text: string }[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const savedTasks = localStorage.getItem('my_private_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  const saveTasks = (newTasks: { id: number; text: string }[]) => {
    setTasks(newTasks);
    localStorage.setItem('my_private_tasks', JSON.stringify(newTasks));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTasks = [...tasks, { id: Date.now(), text: input }];
    saveTasks(newTasks);
    setInput('');
  };

  const deleteTask = (id: number) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    saveTasks(newTasks);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Meine Private App</h1>
        <p style={{ margin: '5px 0 0 0', color: '#86868b' }}>
          Direkt für mein iPhone
        </p>
      </header>

      <form onSubmit={addTask} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Neue Notiz..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          +
        </button>
      </form>

      <ul style={styles.list}>
        {tasks.map((task) => (
          <li key={task.id} style={styles.listItem}>
            <span style={{ color: '#1d1d1f' }}>{task.text}</span>
            <button
              onClick={() => deleteTask(task.id)}
              style={styles.deleteBtn}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '430px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    backgroundColor: '#f5f5f7',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1px solid #d2d2d7',
    fontSize: '16px',
    backgroundColor: '#fff',
  },
  button: {
    padding: '0 20px',
    backgroundColor: '#0071e3',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '20px',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ff3b30',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '5px',
  },
};
