import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import dayjs from 'dayjs';
import './App.css';
import Checklist from './components/Checklist.jsx'
import ShoppingList from './components/Shopping_List.jsx'


function App() {
const [view, setView] = useState(() => {
  const savedView = localStorage.getItem('activeListView');
  return savedView === 'buy' ? 'buy' : 'pack';
});
const toggleView = () => setView(v => (v === 'pack' ? 'buy' : 'pack'));

useEffect(() => {
  localStorage.setItem('activeListView', view);
}, [view]);

return (
  <>
      <header className='header container'>
      </header>
      <div className='body'>
        {view === 'pack'
          ? <Checklist onToggleView={toggleView}/>
          : <ShoppingList onToggleView={toggleView}/>}
      </div>
  </>
  )
}

export default App
