import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './fonts.css'
import './index.css'

const Login = lazy(() => import('./pages/Login.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const LandingPreview = lazy(() => import('./pages/LandingPreview.jsx'))
const Birthday = lazy(() => import('./pages/Birthday.jsx'))
const Motivation = lazy(() => import('./pages/Motivation.jsx'))
const Love = lazy(() => import('./pages/Love.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/preview/:version" element={<LandingPreview />} />
        <Route path="/birthday/:id" element={<Birthday />} />
        <Route path="/motivation/:id" element={<Motivation />} />
        <Route path="/love/:id" element={<Love />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
