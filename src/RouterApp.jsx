import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Login = lazy(() => import('./pages/Login.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const LandingPreview = lazy(() => import('./pages/LandingPreview.jsx'))
const Birthday = lazy(() => import('./pages/Birthday.jsx'))
const Motivation = lazy(() => import('./pages/Motivation.jsx'))
const Love = lazy(() => import('./pages/Love.jsx'))

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/preview/:version" element={<LandingPreview />} />
          <Route path="/birthday/:id" element={<Birthday />} />
          <Route path="/motivation/:id" element={<Motivation />} />
          <Route path="/love/:id" element={<Love />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
