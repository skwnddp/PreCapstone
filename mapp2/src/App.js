import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import { HashRouter as Router, Route, Routes, Switch } from 'react-router-dom';
import React, { useState, useEffect, Navigate } from 'react';
import logo from './logo.svg';
import Home from './Home';
import Main from './Main';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/Home" />} />  */}
        <Route path="/Home" element={<Home />} />
        <Route path="/Main" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;