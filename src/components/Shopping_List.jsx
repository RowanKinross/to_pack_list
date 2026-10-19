import React, { useEffect, useState } from 'react';

const CATEGORIES = ['Pantry', 'Fridge', 'Freezer', 'Bread', 'Fruit & Veg', 'Cleaning & Toiletries'];

const DEFAULT_ITEMS = {
  Pantry: ['Couscous', 'Pasta', 'Beans/Chickpeas', 'Tea', 'Coffee'],
  Fridge: ['Greek yoghurt', 'Butter', 'Tofu', 'Tempeh'],
  Freezer: [],
  Bread: ['Sliced bread', 'Wraps', 'Pittas'],
  'Fruit & Veg': ['Garlic'],
  'Cleaning & Toiletries': ['Bin bags', 'Washing up liquid', 'Shampoo', 'Mouthwash', 'Toothpaste', 'Antihistamine', 'Paracetamol', 'Ibuprofen']
};

// ensures each category's fixed/non-deletable default items are present without duplicating them
const mergeDefaultItems = (list) => {
  const result = { ...list };
  CATEGORIES.forEach(category => {
    const existing = result[category] || [];
    const existingFixedTexts = new Set(existing.filter(item => item.fixed).map(item => item.text));
    const missingDefaults = DEFAULT_ITEMS[category]
      .filter(text => !existingFixedTexts.has(text))
      .map(text => ({ id: `default-${category}-${text}`, text, complete: false, fixed: true }));
    result[category] = [...missingDefaults, ...existing];
  });
  return result;
};

const ShoppingList = () => {
  const [listByCategory, setListByCategory] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('shoppingListByCategory'));
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) return mergeDefaultItems(stored);
    return mergeDefaultItems({});
  });
  const [newItemInputs, setNewItemInputs] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('shoppingListByCategory', JSON.stringify(listByCategory));
  }, [listByCategory]);

  const updateCategory = (category, fn) => {
    setListByCategory(prev => ({ ...prev, [category]: fn(prev[category] || []) }));
  };

  const handleAddItem = (category) => {
    const text = (newItemInputs[category] || '').trim();
    if (text === '') return;
    updateCategory(category, items => [...items, { id: Date.now(), text, complete: false }]);
    setNewItemInputs(prev => ({ ...prev, [category]: '' }));
  };

  const handleDeleteItem = (category, id) => {
    updateCategory(category, items => items.filter(item => item.fixed || item.id !== id));
  };

  const handleEditItem = (category, id, text) => {
    updateCategory(category, items => items.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleToggleComplete = (category, id) => {
    updateCategory(category, items => items.map(item => item.id === id ? { ...item, complete: !item.complete } : item));
  };

  const getSortedItems = (category) => [...(listByCategory[category] || [])].sort((a, b) => {
    if (a.complete && !b.complete) return 1;
    if (!a.complete && b.complete) return -1;
    return 0;
  });

  const handleReset = () => {
    setListByCategory(prev => {
      const result = {};
      Object.keys(prev).forEach(category => {
        result[category] = prev[category]
          .filter(item => item.fixed)
          .map(item => ({ ...item, complete: false }));
      });
      return result;
    });
  };

  const renderCategory = (category) => (
    <div className='checklist-category' key={category}>
      <h2>{category}</h2>
      <div>
        {getSortedItems(category).map((item) => (
          <div
            key={item.id}
            className={`checklist-item ${item.complete ? 'complete' : ''}`}
          >
            <input
              type='checkbox'
              checked={item.complete}
              onChange={() => handleToggleComplete(category, item.id)}
            />
            <input
              type='text'
              value={item.text}
              onChange={(event) => handleEditItem(category, item.id, event.target.value)}
            />
            {deleteMode && !item.fixed && (
              <button onClick={() => handleDeleteItem(category, item.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
      <form
        className='input-group'
        onSubmit={(event) => {
          event.preventDefault();
          handleAddItem(category);
        }}
      >
        <input
          type='text'
          value={newItemInputs[category] || ''}
          onChange={(event) => setNewItemInputs(prev => ({ ...prev, [category]: event.target.value }))}
          enterKeyHint='done'
          placeholder='Add new item'
        />
        <button type='submit'>Add</button>
      </form>
    </div>
  );

  return (
    <div className='body'>
      <div className='checklist'>
        <h1>Shopping List</h1>
        <div className='category-grid'>
          {CATEGORIES.map(renderCategory)}
        </div>
        <button className='button delete-button print-hidden' onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Exit Delete Mode' : 'Delete Items'}
        </button>
        <button className='button print-hidden' onClick={handleReset}>
          Reset
        </button>
        <button className='button print-hidden' onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>
    </div>
  );
};


export default ShoppingList;