import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
// Shared Aidxn header styles — imported after index.css so this app's own
// --app-* colour variables are already defined when chrome.css consumes them.
import '@aidxn/chrome/chrome.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
