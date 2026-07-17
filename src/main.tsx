import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import './index.css';
import App from './App.tsx';

window.addEventListener('error', (event) => {
    alert(`CRITICAL RUNTIME ERROR:\nMessage: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}:${event.colno}`);
});
window.addEventListener('unhandledrejection', (event) => {
    alert(`UNHANDLED PROMISE REJECTION:\nReason: ${event.reason}`);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
