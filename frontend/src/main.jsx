import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'

import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'

import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/shell.css'
import './styles/auth.css'
import './styles/app.css'

import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
