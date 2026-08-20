import React, { useEffect, useState } from 'react';

const CATEGORIES = ['Clothes', 'Toiletries', 'Electronics', 'Misc', 'Wear'];
const CAMPING_CATEGORIES = ['Camping Gear', 'Camping Food'];

const Checklist = () => {
  const [checklistByCategory, setChecklistByCategory] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('checklistByCategory'));
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) return stored;

    // migrate old flat checklist formats into Misc
    const oldFlat = JSON.parse(localStorage.getItem('packingChecklist'));
    if (Array.isArray(oldFlat)) return { Misc: oldFlat };

    return {};
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
      [category]: (prev[category] || []).filter(item => item.id !== id)
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
    <React.Fragment key={category}>
      <h2>{category}</h2>
      <div className='input-group'>
        <input
          type='text'
          value={newItemInputs[category] || ''}
          onChange={(event) => handleNewItemChange(category, event.target.value)}
          placeholder='Add new item'
        />
        <button onClick={() => handleAddItem(category)}>Add</button>
      </div>
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
            {deleteMode && (
              <button onClick={() => handleDeleteItem(category, item.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </React.Fragment>
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
        {CATEGORIES.map(renderCategory)}
        {isCamping && (
          <>
            <hr />
            <hr />
            {CAMPING_CATEGORIES.map(renderCategory)}
          </>
        )}
        <button className='button' onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Exit Delete Mode' : 'Delete Items'}
        </button>
      </div>
    </div>
  );
};

export default Checklist;

