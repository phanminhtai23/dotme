import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './fonts.css'
import './index.css'

const RouterApp = lazy(() => import('./RouterApp.jsx'))
const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={null}>{isHome ? <App /> : <RouterApp />}</Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)
