'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-10 px-4">
      <Head>
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />
        <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />
      </Head>

      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-1 text-white">Meine Private App</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Direkt für mein iPhone</p>

        <form onSubmit={addTask} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Neue Notiz..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 font-bold text-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            +
          </button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">Noch keine Notizen vorhanden.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-between items-center bg-gray-700/50 border border-gray-600/40 rounded-xl p-4 transition-all hover:border-gray-500/50"
              >
                <span className="text-gray-200 break-all pr-2">{task.text}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}