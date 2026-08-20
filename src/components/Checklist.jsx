import React, { useEffect, useState } from 'react';

const Checklist = () => {
  const [packingChecklist, setPackingChecklist] = useState(() => {
    const storedChecklist = JSON.parse(localStorage.getItem('packingChecklist'));
    if (Array.isArray(storedChecklist)) return storedChecklist;

    const unifiedChecklist = JSON.parse(localStorage.getItem('checklist'));
    if (Array.isArray(unifiedChecklist)) return unifiedChecklist;

    const oldChecklist = JSON.parse(localStorage.getItem('packingChecklist')) || {};
    return oldChecklist[Object.keys(oldChecklist)[0]] || [];
  });
  const [isCamping, setIsCamping] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('packingChecklist', JSON.stringify(packingChecklist));
  }, [packingChecklist]);

  const checklist = packingChecklist;
  const setChecklist = setPackingChecklist;

  const handleAddItem = () => {
    if (newItem.trim() === '') return;

    setChecklist([
      ...checklist,
      { id: Date.now(), text: newItem, complete: false }
    ]);
    setNewItem('');
  };

  const handleDeleteItem = (id) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleEditItem = (id, text) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  const handleToggleComplete = (id) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, complete: !item.complete } : item
    ));
  };

  const sortedItems = [...checklist].sort((a, b) => {
    if (a.complete && !b.complete) return 1;
    if (!a.complete && b.complete) return -1;
    return 0;
  });

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
        <h2>Clothes</h2>
        <div className='input-group'>
          <input
            type='text'
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            placeholder='Add new item'
          />
          <button onClick={handleAddItem}>Add</button>
        </div>
        <h2>Toiletries</h2>

        <h2>Electronics</h2>

        <h2>Misc</h2>
        {isCamping && (
          <>
          <hr />
          <hr />
            <h2>Camping Gear</h2>
            <h2>Camping Food</h2>
          </>
        )}
        <hr />
        <div>
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className={`checklist-item ${item.complete ? 'complete' : ''}`}
            >
              <input
                type='checkbox'
                checked={item.complete}
                onChange={() => handleToggleComplete(item.id)}
              />
              <input
                type='text'
                value={item.text}
                onChange={(event) => handleEditItem(item.id, event.target.value)}
              />
              {deleteMode && (
                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
        <button className='button' onClick={() => setDeleteMode(!deleteMode)}>
          {deleteMode ? 'Exit Delete Mode' : 'Delete Items'}
        </button>
      </div>
    </div>
  );
};

export default Checklist;
