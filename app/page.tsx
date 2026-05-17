'use client';
import { useState, useEffect } from 'react';

type Store = 'Hofer' | 'Lidl' | 'Spar' | 'Sonstige';

interface ShoppingItem {
  id: number;
  text: string;
  quantity: number;
  price: number;
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
  const [priceInput, setPriceInput] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store>('Sonstige');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch('/api/shopping');
        if (res.ok) {
          const data = await res.json();
          const currentItems = data || [];
          setItems(currentItems);
          
          {/* FIX: Wenn die Liste komplett leer ist (z.B. nach dem Leeren oder beim App-Start), 
              schalten wir den Fokus-Modus automatisch ab, damit das Eingabefeld sichtbar wird */}
          if (currentItems.length === 0) {
            setIsFocusMode(false);
          }
        }
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
    const interval = setInterval(loadItems, 10000);
    return () => clearInterval(interval);
  }, []);

  const saveToDatabase = async (newItems: ShoppingItem[]) => {
    setItems(newItems);
    try {
      await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems),
      });
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
    }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let text = input.trim();
    let quantity = 1;

    const match = text.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (match) {
      quantity = parseInt(match[1], 10);
      text = match[2];
    }

    const parsedPrice = parseFloat(priceInput.replace(',', '.')) || 0;

    const newItems = [
      ...items,
      { id: Date.now(), text, quantity, price: parsedPrice, store: selectedStore, checked: false }
    ];
    saveToDatabase(newItems);
    setInput('');
    setPriceInput('');
  };

  const toggleItem = (id: number) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveToDatabase(newItems);
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
    saveToDatabase(newItems);
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
    saveToDatabase(newItems);
  };

  const deleteItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = items.filter(item => item.id !== id);
    saveToDatabase(newItems);
  };

  const handleClearChecked = () => {
    const confirmClear = window.confirm("Wollen Sie den Wagen leeren?");
    if (confirmClear) {
      const newItems = items.filter(item => !item.checked);
      saveToDatabase(newItems);
      setIsFocusMode(false);
    }
  };

  const activeItems = items.filter(item => !item.checked).sort((a, b) => STORES.indexOf(a.store) - STORES.indexOf(b.store));
  const checkedItems = items.filter(item => item.checked);

  const totalSum = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStoreSum = (store: Store) => {
    return activeItems.filter(item => item.store === store).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-4 md:py-8 px-4 font-sans select-none">
      <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />
      <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" />

      <div className="w-full max-w-md md:max-w-4xl bg-gray-800 rounded-3xl shadow-2xl p-5 border border-gray-700/60 flex flex-col min-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 shrink-0 border-b border-gray-700/50 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">Meine Einkäufe</h1>
              {totalSum > 0 && (
                <p className="text-emerald-400 font-bold text-sm">Offene Prospekt-Angebote: {totalSum.toFixed(2)} €</p>
              )}
            </div>
          </div>
          
          {items.length > 0 && !isLoading && (
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                isFocusMode 
                  ? 'bg-amber-500 border-amber-400 text-gray-900' 
                  : 'bg-gray-700/60 border-gray-600 text-gray-300'
              }`}
            >
              {isFocusMode ? '⚙️ Bearbeiten' : '🛒 Einkauf starten'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Synchronisiere mit iPad/iPhone...</p>
          </div>
        ) : (
          <>
            {/* EINGABEBEREICH */}
            {!isFocusMode && (
              <form onSubmit={addItem} className="space-y-3 mb-5 shrink-0 w-full border-b border-gray-700/30 pb-4">
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Z.B. 3 Milch, Brot..."
                    className="flex-1 bg-gray-700/80 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-all text-base"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="€"
                    className="w-20 bg-gray-700/80 border border-gray-600 rounded-2xl px-2 py-3 text-white text-center placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all text-base"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl px-6 font-black text-xl transition-all shadow-lg"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-1.5 py-0.5 text-xs w-full">
                  {STORES.map(store => (
                    <button
                      key={store}
                      type="button"
                      onClick={() => setSelectedStore(store)}
                      className={`flex-1 py-2.5 rounded-xl border transition-all font-bold text-center ${
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
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
              
              {/* LINKE SPALTE: OFFENE ARTIKEL */}
              <div className="flex flex-col h-full overflow-y-auto pr-1">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-800 py-1 z-10">
                  Zu kaufen
                </h2>
                <div className="space-y-2.5">
                  {activeItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <span className="text-3xl block mb-1">🎉</span>
                      <p className="text-sm">Alles im Wagen!</p>
                    </div>
                  ) : (
                    activeItems.map((item, index) => {
                      const showStoreHeader = index === 0 || activeItems[index - 1].store !== item.store;
                      const storeSum = getStoreSum(item.store);

                      return (
                        <div key={item.id} className="space-y-1">
                          {showStoreHeader && (
                            <div className="flex justify-between items-center px-1 pt-2 pb-1 text-xs font-black uppercase tracking-wider text-emerald-400/90 border-b border-gray-700/40">
                              <span>{item.store}</span>
                              {storeSum > 0 && <span className="text-gray-400 font-bold">{storeSum.toFixed(2)} €</span>}
                            </div>
                          )}

                          <div
                            onClick={() => toggleItem(item.id)}
                            className={`flex justify-between items-center border rounded-2xl bg-gray-700/30 border-gray-600/50 text-gray-100 shadow-sm transition-all cursor-pointer ${
                              isFocusMode ? 'p-4' : 'p-3'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-5.5 h-5.5 rounded-lg border border-gray-500 flex items-center justify-center shrink-0" />
                              <div className="flex flex-col min-w-0 gap-0.5">
                                <span className={`font-semibold break-words leading-tight ${isFocusMode ? 'text-lg' : 'text-base'}`}>
                                  {item.quantity > 1 && <span className="text-emerald-400 font-extrabold mr-1.5">{item.quantity}x</span>}
                                  {item.text}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!isFocusMode && (
                                    <button
                                      onClick={(e) => cycleStore(item.id, e)}
                                      className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold uppercase ${STORE_COLORS[item.store]}`}
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

                            <div className="flex items-center gap-2 shrink-0">
                              {!isFocusMode && (
                                <div className="flex items-center bg-gray-800/80 rounded-xl border border-gray-600/50 overflow-hidden">
                                  <button onClick={(e) => changeQuantity(item.id, -1, e)} className="px-2.5 py-1 text-gray-400 hover:text-white font-bold">-</button>
                                  <button onClick={(e) => changeQuantity(item.id, 1, e)} className="px-2.5 py-1 text-gray-400 hover:text-white font-bold border-l border-gray-600/30">+</button>
                                </div>
                              )}
                              {!isFocusMode && (
                                <button onClick={(e) => deleteItem(item.id, e)} className="text-gray-500 hover:text-red-400 p-1.5">
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
              </div>

              {/* RECHTE SPALTE: ERLEDIGTE ARTIKEL */}
              <div className="flex flex-col h-full overflow-y-auto pr-1 border-t md:border-t-0 md:border-l border-gray-700/50 pt-4 md:pt-0 md:pl-4">
                <div className="flex justify-between items-center mb-2 sticky top-0 bg-gray-800 py-1 z-10">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Bereits im Wagen
                  </h2>
                  {checkedItems.length > 0 && (
                    <button onClick={handleClearChecked} className="text-xs text-red-400 hover:text-red-300 font-bold bg-gray-900/50 px-3 py-1.5 rounded-xl border border-red-500/30 active:scale-95 transition-all shadow-sm">
                      🏁 Einkauf fertig
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {checkedItems.length === 0 ? (
                    <p className="text-center py-8 text-gray-600 text-sm">Noch nichts abgehakt.</p>
                  ) : (
                    checkedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="flex justify-between items-center border rounded-2xl p-3 bg-gray-800/20 border-gray-700/40 text-gray-400 opacity-50 cursor-pointer hover:bg-gray-700/20 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-5.5 h-5.5 rounded-lg bg-emerald-500 border border-emerald-500 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-semibold break-words text-base tracking-wide">
                            {item.quantity > 1 && `${item.quantity}x `}
                            {item.text}
                          </span>
                        </div>
                        {!isFocusMode && (
                          <button onClick={(e) => deleteItem(item.id, e)} className="text-gray-600 hover:text-red-400 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}