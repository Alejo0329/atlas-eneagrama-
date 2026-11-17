import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isExternalExtensionError = (reasonOrMessage: unknown, stack?: string, filename?: string): boolean => {
  const text = `${String(reasonOrMessage ?? '')} ${stack ?? ''} ${filename ?? ''}`;
  return (
    text.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
    text.includes('Failed to connect to MetaMask')
  );
};

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason = event.reason as { message?: string; stack?: string } | undefined;
    if (isExternalExtensionError(reason?.message ?? reason, reason?.stack)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true,
);

window.addEventListener(
  'error',
  (event) => {
    const err = event.error as { message?: string; stack?: string } | undefined;
    if (isExternalExtensionError(err?.message ?? event.message, err?.stack, event.filename)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        void registration.update();
      })
      .catch((err) => {
        console.warn('No se pudo registrar el Service Worker:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
