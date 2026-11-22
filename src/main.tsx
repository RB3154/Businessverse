import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { applyBrandingVars } from './config/branding.config';
import { backgroundStore } from './utils/stores';
import App from './App';

applyBrandingVars();
backgroundStore.set('void');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
