'use client';
import { useState, useEffect } from 'react';

type Store = 'Hofer' | 'Lidl' | 'Spar' | 'Sonstige';

interface ShoppingItem {
  id: number;
  text: string;
  quantity: number;
  price: number; // NEU: Das Preisfeld
  store: Store;
  checked: boolean;
}

const STORES: Store[] = ['Hofer', 'Lidl', 'Spar', 'Sonstige'];

const STORE_COLORS: Record<Store, string> = {
  'Hofer': 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  'Lidl': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Spar': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Sonstige': 'bg-gray-600/30 text-gray-400 border-gray-600/40',
};

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState('');
  const [priceInput, setPriceInput] = useState(''); // NEU: State für das Preisfeld im Formular
  const [selectedStore, setSelectedStore] = useState<Store>('Sonstige');
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem('ultra_shopping_list_v2');
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  const saveItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem('ultra_shopping_list_v2', JSON.stringify(newItems));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let text = input.trim();
    let quantity = 1;

    // Smarte Mengenerkennung
    const match = text.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (match) {
      quantity = parseInt(match[1], 10);
      text = match[2];
    }

    // Preis parsen (Komma zu Punkt wandeln)
    const parsedPrice = parseFloat(priceInput.replace(',', '.')) || 0;

    const newItems = [
      ...items,
      { id: Date.now(), text, quantity, price: parsedPrice, store: selectedStore, checked: false }
    ];
    saveItems(newItems);
    setInput('');
    setPriceInput('');
  };

  const toggleItem = (id: number) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(newItems);
  };

  const changeQuantity = (id: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = items.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    });
    saveItems(newItems);
  };

  const cycleStore = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = items.map(item => {
      if (item.id === id) {
        const currentIndex = STORES.indexOf(item.store);
        const nextIndex = (currentIndex + 1) % STORES.length;
        return { ...item, store: STORES[nextIndex] };
      }
      return item;
    });
    saveItems(newItems);
  };

  const deleteItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = items.filter(item => item.id !== id);
    saveItems(newItems);
  };

  const clearChecked = () => {
    const newItems = items.filter(item => !item.checked);
    saveItems(newItems);
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    if (!a.checked) {
      return STORES.indexOf(a.store) - STORES.indexOf(b.store);
    }
    return 0;
  });

  // NEU: Berechnungen für die Gesamtsummen (nur offene Artikel)
  const totalSum = items
    .filter(item => !item.checked)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStoreSum = (store: Store) => {
    return items
      .filter(item => item.store === store && !item.checked)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-6 px-4 font-sans select-none">
      <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />
      <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />

      <div className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl p-5 border border-gray-700/60 flex flex-col min-h-[85vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">Meine Einkäufe</h1>
              {totalSum > 0 && (
                <p className="text-emerald-400 font-bold text-xs">Offen: {totalSum.toFixed(2)} €</p>
              )}
            </div>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isFocusMode 
                  ? 'bg-amber-500 border-amber-400 text-gray-900' 
                  : 'bg-gray-700/60 border-gray-600 text-gray-300'
              }`}
            >
              {isFocusMode ? '⚙️ Bearbeiten' : '🛒 Einkauf starten'}
            </button>
          )}
        </div>

        {/* EINGABEBEREICH (wird im Fokusmodus ausgeblendet) */}
        {!isFocusMode && (
          <form onSubmit={addItem} className="space-y-3 mb-5 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Z.B. 3 Milch, Brot..."
                className="flex-[2] bg-gray-700/80 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all text-base"
              />
              {/* NEU: Preiseingabefeld */}
              <input
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="€"
                className="w-16 bg-gray-700/80 border border-gray-600 rounded-2xl px-2 py-3 text-white text-center placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all text-base"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl px-5 font-black text-xl transition-all shadow-lg"
              >
                +
              </button>
            </div>

            <div className="flex gap-1 py-0.5 text-xs">
              {STORES.map(store => (
                <button
                  key={store}
                  type="button"
                  onClick={() => setSelectedStore(store)}
                  className={`flex-1 py-2 rounded-xl border transition-all font-bold text-center ${
                    selectedStore === store 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' 
                      : 'bg-gray-700/40 border-gray-600/50 text-gray-400'
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>
          </form>
        )}

        {/* LISTENBEREICH */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="text-sm">Keine Einkäufe geplant.</p>
            </div>
          ) : (
            sortedItems.map((item, index) => {
              // Zwischenüberschriften für Supermärkte einblenden (wenn es der erste Artikel des Marktes ist)
              const showStoreHeader = !item.checked && (index === 0 || sortedItems[index - 1].store !== item.store || sortedItems[index - 1].checked);
              const storeSum = getStoreSum(item.store);

              return (
                <div key={item.id} className="space-y-1">
                  {showStoreHeader && (
                    <div className="flex justify-between items-center px-1 pt-3 pb-1 text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-700/40">
                      <span>{item.store}</span>
                      {storeSum > 0 && <span className="text-gray-500 font-bold">{storeSum.toFixed(2)} €</span>}
                    </div>
                  )}
                  {item.checked && index > 0 && !sortedItems[index - 1].checked && (
                    <div className="px-1 pt-4 pb-1 text-xs font-black uppercase tracking-wider text-gray-500 border-b border-gray-700/20">
                      Erledigt
                    </div>
                  )}

                  <div
                    onClick={() => toggleItem(item.id)}
                    className={`flex justify-between items-center border rounded-2xl transition-all ${
                      isFocusMode ? 'p-4' : 'p-3'
                    } ${
                      item.checked 
                        ? 'bg-gray-800/10 border-gray-700/40 text-gray-500 line-through opacity-40' 
                        : 'bg-gray-700/30 border-gray-600/50 text-gray-100 shadow-sm'
                    }`}
                  >
                    {/* Links */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isFocusMode ? 'w-6 h-6' : 'w-5.5 h-5.5'
                      } ${
                        item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                      }`}>
                        {item.checked && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className={`font-semibold break-words leading-tight ${isFocusMode ? 'text-lg' : 'text-base'}`}>
                          {item.quantity > 1 && <span className="text-emerald-400 font-extrabold mr-1.5">{item.quantity}x</span>}
                          {item.text}
                        </span>
                        
                        {/* Preis-Anzeige und Supermarkt-Badge */}
                        <div className="flex items-center gap-2">
                          {!isFocusMode && (
                            <button
                              disabled={isFocusMode}
                              onClick={(e) => cycleStore(item.id, e)}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold uppercase tracking-wider transition-all ${
                                STORE_COLORS[item.store]
                              }`}
                            >
                              {item.store}
                            </button>
                          )}
                          {item.price > 0 && (
                            <span className="text-xs text-gray-400 font-medium">
                              {item.price.toFixed(2)} € {item.quantity > 1 && `(Gesamt: ${(item.price * item.quantity).toFixed(2)} €)`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rechts */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!item.checked && !isFocusMode && (
                        <div className="flex items-center bg-gray-800/80 rounded-xl border border-gray-600/50 overflow-hidden">
                          <button
                            onClick={(e) => changeQuantity(item.id, -1, e)}
                            className="px-2 py-1 text-gray-400 hover:text-white transition-colors font-bold"
                          >
                            -
                          </button>
                          <button
                            onClick={(e) => changeQuantity(item.id, 1, e)}
                            className="px-2 py-1 text-gray-400 hover:text-white transition-colors font-bold border-l border-gray-600/30"
                          >
                            +
                          </button>
                        </div>
                      )}
                      
                      {!isFocusMode && (
                        <button
                          onClick={(e) => deleteItem(item.id, e)}
                          className="text-gray-500 hover:text-red-400 p-1.5 transition-colors rounded-xl"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM REINIGEN BUTTON */}
        {items.some(item => item.checked) && !isFocusMode && (
          <button
            onClick={clearChecked}
            className="w-full mt-4 bg-gray-700/30 hover:bg-red-500/10 hover:text-red-400 text-gray-400 text-xs py-2.5 rounded-xl border border-gray-700 transition-all font-semibold uppercase tracking-wider shrink-0"
          >
            Einkaufswagen leeren
          </button>
        )}
      </div>
    </div>
  );
}