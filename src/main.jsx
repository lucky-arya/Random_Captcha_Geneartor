import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// load the original crazy-captcha script so it attaches to window.CrazyCaptcha
import('./crazy-captcha.js');

const root = createRoot(document.getElementById('root'))
root.render(<App />)
