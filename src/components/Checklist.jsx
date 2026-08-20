import React, { useEffect, useState } from 'react';

const CATEGORIES = ['Clothes', 'Toiletries', 'Electronics', 'Misc', 'Wear'];
const CAMPING_CATEGORIES = ['Camping Gear'];
const CAMPING_FOOD_MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const DEFAULT_ITEMS = {
  Clothes: ['Pants', 'Socks', 'Bra', 'Trousers/Skirts', 'Tops', 'Dress', 'nice outfit?', 'Jumpers'],
  Toiletries: ['Toothbrush', 'Hairbrush', 'Makeup', 'Deoderant', 'Toothpaste'],
  Electronics: ['headphones', 'phone charger', 'watch charger'],
  Misc: ['Book'],
  Wear: ['Top', 'Bra', 'Trousers', 'Pants', 'Socks', 'Jumper', 'Shoes', 'Waterproof Jacket'],
  'Camping Gear': ['Tent', 'Sleeping bags', 'Roll mats', 'Pillow', 'Torches', 'Gas', 'Pocket Rocket', 'Pans', 'Cutlery', 'Tin Opener?', 'Lighter', 'Sponge', 'Washing Up liquid', 'Hand sanitiser', 'smidge', 'Toilet Roll', 'Bin Bags', 'Cards'],
  'Camping Food': ['Snacks', 'water']
};

// items whose packed quantity scales with the number of nights away
const NIGHTS_QUANTITY_ITEMS = ['Pants', 'Socks'];
const THIRD_NIGHTS_QUANTITY_ITEMS = ['Trousers/Skirts', 'Tops', 'Jumpers'];

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
  const [isCamping, setIsCamping] = useState(() => {
    return JSON.parse(localStorage.getItem('isCamping')) || false;
  });
  const [startDate, setStartDate] = useState(() => localStorage.getItem('tripStartDate') || '');
  const [endDate, setEndDate] = useState(() => localStorage.getItem('tripEndDate') || '');
  const [newItemInputs, setNewItemInputs] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('checklistByCategory', JSON.stringify(checklistByCategory));
  }, [checklistByCategory]);

  useEffect(() => {
    localStorage.setItem('isCamping', JSON.stringify(isCamping));
  }, [isCamping]);

  useEffect(() => {
    localStorage.setItem('tripStartDate', startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem('tripEndDate', endDate);
  }, [endDate]);

  const nights = (() => {
    if (!startDate || !endDate) return 0;
    const diffMs = new Date(endDate) - new Date(startDate);
    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  })();

  const getQuantityLabel = (category, text) => {
    if (category !== 'Clothes' || nights <= 0) return null;
    if (NIGHTS_QUANTITY_ITEMS.includes(text)) return `${nights}x`;
    if (THIRD_NIGHTS_QUANTITY_ITEMS.includes(text)) return `${Math.ceil(nights / 3)}x`;
    return null;
  };

  const getMealQuantityLabel = (meal) => {
    if (nights <= 0) return `x ${meal.toLowerCase()}`;
    const count = meal === 'Lunch' ? nights + 1 : nights;
    return `${count}x ${meal.toLowerCase()}`;
  };

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

  const handleReset = () => {
    setChecklistByCategory(prev => {
      const result = {};
      Object.keys(prev).forEach(category => {
        result[category] = prev[category]
          .filter(item => item.fixed)
          .map(item => ({ ...item, complete: false }));
      });
      return result;
    });
    setStartDate('');
    setEndDate('');
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
            {getQuantityLabel(category, item.text) && (
              <p className='quantity-label'>{getQuantityLabel(category, item.text)}</p>
            )}
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

  const renderMealCategory = (meal) => {
    const categoryKey = `Camping Food - ${meal}`;
    return (
      <div className='checklist-category ' key={categoryKey}>
        {getMealQuantityLabel(meal) && (
          <h3 className='quantity-label'>{getMealQuantityLabel(meal)}</h3>
        )}
        <div>
          {getSortedItems(categoryKey).map((item) => (
            <div
              key={item.id}
              className={`checklist-item ${item.complete ? 'complete' : ''}`}
            >
              <input
                type='checkbox'
                checked={item.complete}
                onChange={() => handleToggleComplete(categoryKey, item.id)}
              />
              <input
                type='text'
                value={item.text}
                onChange={(event) => handleEditItem(categoryKey, item.id, event.target.value)}
              />
              {deleteMode && !item.fixed && (
                <button onClick={() => handleDeleteItem(categoryKey, item.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
        <div className='input-group'>
          <input
            type='text'
            value={newItemInputs[categoryKey] || ''}
            onChange={(event) => handleNewItemChange(categoryKey, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAddItem(categoryKey);
            }}
            placeholder='Add new item'
          />
        </div>
      </div>
    );
  };

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
        <div className='date-picker date-picker-container'>
          <label className='date-picker-label'>
            Start date
            <input
              type='date'
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className='date-picker-label'>
            End date
            <input
              type='date'
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
          <p className='nights'>No of nights: <strong className='nights-bold'>{nights}</strong></p>
        </div>
        <div className='category-grid'>
          {CATEGORIES.map(renderCategory)}
        </div>
        {isCamping && (
          <>
            <hr />
            <hr />
            <div className='category-grid'>
              {CAMPING_CATEGORIES.map(renderCategory)}
              <div className='checklist-category'>
                <h2>Camping Food</h2>
                <div>
                  {getSortedItems('Camping Food').map((item) => (
                    <div
                      key={item.id}
                      className={`checklist-item ${item.complete ? 'complete' : ''}`}
                    >
                      <input
                        type='checkbox'
                        checked={item.complete}
                        onChange={() => handleToggleComplete('Camping Food', item.id)}
                      />
                      <input
                        type='text'
                        value={item.text}
                        onChange={(event) => handleEditItem('Camping Food', item.id, event.target.value)}
                      />
                      {deleteMode && !item.fixed && (
                        <button onClick={() => handleDeleteItem('Camping Food', item.id)}>Delete</button>
                      )}
                    </div>
                  ))}
                </div>
                
                {CAMPING_FOOD_MEALS.map(renderMealCategory)}
              </div>
            </div>
          </>
        )}
        <button className='button delete-button' onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Exit Delete Mode' : 'Delete Items'}
        </button>
        <button className='button' onClick={handleReset}>
          Reset
        </button>
        <div className='footer'>
        </div>
      </div>
    </div>
  );
};

export default Checklist;

