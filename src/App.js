// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewPost from './pages/NewPost';
import BlogPost from './pages/BlogPost';
import EditPost from './pages/EditPost'; // Add this import

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-post" element={<NewPost />} />
            <Route path="/post/:id" element={<BlogPost />} />
            <Route path="/edit-post/:id" element={<EditPost />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;