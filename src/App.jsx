import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import dayjs from 'dayjs';
import './App.css';
import Checklist from './components/Checklist.jsx'


function App() {

return (
  <>
      <header className='header container'>
      </header>
      <div className='body'>
        <Checklist/>
      </div>
  </>
  )
}

export default App
