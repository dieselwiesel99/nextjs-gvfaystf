'use client';
import { useState, useEffect } from 'react';

interface ShoppingItem {
  id: number;
  text: string;
  checked: boolean;
}

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const savedItems = localStorage.getItem('my_shopping_list');
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  const saveItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem('my_shopping_list', JSON.stringify(newItems));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newItems = [...items, { id: Date.now(), text: input, checked: false }];
    saveItems(newItems);
    setInput('');
  };

  const toggleItem = (id: number) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(newItems);
  };

  const deleteItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindert, dass das Häkchen gleichzeitig ausgelöst wird
    const newItems = items.filter(item => item.id !== id);
    saveItems(newItems);
  };

  const clearChecked = () => {
    const newItems = items.filter(item => !item.checked);
    saveItems(newItems);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-10 px-4">
      <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />
      <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />

      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-1 text-white">Einkaufsliste</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Tippen zum Abhaken</p>

        <form onSubmit={addItem} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Lebensmittel hinzufügen..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-5 font-bold text-xl transition-colors shadow-lg shadow-green-600/20"
          >
            +
          </button>
        </form>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">Der Kühlschrank ist voll! Keine Artikel.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex justify-between items-center border rounded-xl p-4 transition-all cursor-pointer ${
                  item.checked 
                    ? 'bg-gray-800/30 border-gray-700 text-gray-500 line-through select-none' 
                    : 'bg-gray-700/50 border-gray-600/60 text-gray-200 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 break-all pr-2">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-green-600 border-green-600' : 'border-gray-500'
                  }`}>
                    {item.checked && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span>{item.text}</span>
                </div>
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.some(item => item.checked) && (
          <button
            onClick={clearChecked}
            className="w-full mt-6 bg-gray-700/30 hover:bg-gray-700/60 text-gray-400 hover:text-gray-300 border border-gray-700 text-xs py-2 rounded-xl transition-colors"
          >
            Abgehakte Artikel entfernen
          </button>
        )}
      </div>
    </div>
  );
}