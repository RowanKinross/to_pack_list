import React, { useEffect, useState } from 'react';

const CATEGORIES = ['Clothes', 'Toiletries', 'Electronics', 'Misc', 'Wear'];
const CAMPING_CATEGORIES = ['Camping Gear', 'Camping Food'];

const DEFAULT_ITEMS = {
  Clothes: ['Pants', 'Socks', 'Bra', 'Trousers/Skirts', 'Tops', 'Dresses', 'nice outfit?', 'Jumpers/Cardigans'],
  Toiletries: ['Toothbrush', 'Hairbrush', 'Makeup', 'Earrings', 'Deoderant', 'Toothpaste'],
  Electronics: ['headphones', 'phone charger', 'watch charger'],
  Misc: ['Book'],
  Wear: ['Top', 'Bra', 'Trousers', 'Pants', 'Socks', 'Jumper', 'Shoes', 'Waterproof Jacket'],
  'Camping Gear': ['Tent', 'Sleeping bags', 'Roll mats', 'Pillow', 'Torches', 'Gas', 'Pocket Rocket', 'Pans', 'Cutlery', 'Tin Opener?', 'Lighter', 'Sponge', 'Washing Up liquid', 'Hand sanitiser', 'Toilet Roll', 'Bin Bags', 'Cards']
};

// ensures each category's fixed/non-deletable default items are present without duplicating them
const mergeDefaultItems = (checklist) => {
  const result = { ...checklist };
  Object.keys(DEFAULT_ITEMS).forEach(category => {
    const existing = result[category] || [];
    const existingFixedTexts = new Set(existing.filter(item => item.fixed).map(item => item.text));
    const missingDefaults = DEFAULT_ITEMS[category]
      .filter(text => !existingFixedTexts.has(text))
      .map(text => ({ id: `default-${category}-${text}`, text, complete: false, fixed: true }));
    result[category] = [...missingDefaults, ...existing];
  });
  return result;
};

const Checklist = () => {
  const [checklistByCategory, setChecklistByCategory] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('checklistByCategory'));
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) return mergeDefaultItems(stored);

    // migrate old flat checklist formats into Misc
    const oldFlat = JSON.parse(localStorage.getItem('packingChecklist'));
    if (Array.isArray(oldFlat)) return mergeDefaultItems({ Misc: oldFlat });

    return mergeDefaultItems({});
  });
  const [isCamping, setIsCamping] = useState(false);
  const [newItemInputs, setNewItemInputs] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('checklistByCategory', JSON.stringify(checklistByCategory));
  }, [checklistByCategory]);

  const getItems = (category) => checklistByCategory[category] || [];

  const handleNewItemChange = (category, value) => {
    setNewItemInputs(prev => ({ ...prev, [category]: value }));
  };

  const handleAddItem = (category) => {
    const text = (newItemInputs[category] || '').trim();
    if (text === '') return;

    setChecklistByCategory(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: Date.now(), text, complete: false }]
    }));
    setNewItemInputs(prev => ({ ...prev, [category]: '' }));
  };

  const handleDeleteItem = (category, id) => {
    setChecklistByCategory(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(item => item.fixed || item.id !== id)
    }));
  };

  const handleEditItem = (category, id, text) => {
    setChecklistByCategory(prev => ({
      ...prev,
      [category]: (prev[category] || []).map(item =>
        item.id === id ? { ...item, text } : item
      )
    }));
  };

  const handleToggleComplete = (category, id) => {
    setChecklistByCategory(prev => ({
      ...prev,
      [category]: (prev[category] || []).map(item =>
        item.id === id ? { ...item, complete: !item.complete } : item
      )
    }));
  };

  const getSortedItems = (category) => [...getItems(category)].sort((a, b) => {
    if (a.complete && !b.complete) return 1;
    if (!a.complete && b.complete) return -1;
    return 0;
  });

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
      <div className='input-group'>
        <input
          type='text'
          value={newItemInputs[category] || ''}
          onChange={(event) => handleNewItemChange(category, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAddItem(category);
          }}
          placeholder='Add new item'
        />
      </div>
    </div>
  );

  return (
    <div className='body'>
      <div className='camping-toggle container'>
        <button
          className={isCamping ? 'active' : ''}
          onClick={() => setIsCamping(!isCamping)}
        >
          {isCamping ? 'Camping' : 'Not Camping'}
        </button>
      </div>
      <div className='checklist'>
        <h1>To Pack</h1>
        <div className='category-grid'>
          {CATEGORIES.map(renderCategory)}
        </div>
        {isCamping && (
          <>
            <hr />
            <hr />
            <div className='category-grid'>
              {CAMPING_CATEGORIES.map(renderCategory)}
            </div>
          </>
        )}
        <button className='button' onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Exit Delete Mode' : 'Delete Items'}
        </button>
        <div className='footer'>
        </div>
      </div>
    </div>
  );
};

export default Checklist;

