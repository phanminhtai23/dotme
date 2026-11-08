import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import LandingPreview from './pages/LandingPreview.jsx'
import Birthday from './pages/Birthday.jsx'
import Motivation from './pages/Motivation.jsx'
import Love from './pages/Love.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './fonts.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/preview/:version" element={<LandingPreview />} />
        <Route path="/birthday/:id" element={<Birthday />} />
        <Route path="/motivation/:id" element={<Motivation />} />
        <Route path="/love/:id" element={<Love />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
