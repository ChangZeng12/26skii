import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/tokens.css';
import './styles/materials.css';
import './styles/global.css';
import './components/glass/glass.css';
import './components/map/map.css';
import './components/panels/panels.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('index.html 缺少 #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
