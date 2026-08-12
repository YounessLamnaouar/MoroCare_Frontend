import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" expand={true} richColors />
      <AppRouter />
    </Router>
  )
}
