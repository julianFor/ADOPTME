import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ¡Importa BrowserRouter!
import App from './App.jsx';
import './styles/PublicDonations.css'; // Ajusta la ruta según tu estructura

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);