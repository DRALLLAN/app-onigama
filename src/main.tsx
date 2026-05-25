import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent noisy cross-origin/iframe contentWindow errors from disrupting trading widget runtime
if (typeof window !== 'undefined') {
  const ignoreErrorPatterns = [
    'contentWindow',
    'iframe',
    'TradingView',
    'postMessage',
    'Cannot listen to the event',
    'contentWindow is not available'
  ];

  // Intercept and swallow console errors and warnings matching the ignore patterns
  const originalError = console.error;
  console.error = function (...args) {
    const checkStr = args.map(arg => String(arg)).join(' ');
    if (ignoreErrorPatterns.some(pattern => checkStr.includes(pattern))) {
      return; // Silence this error
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = function (...args) {
    const checkStr = args.map(arg => String(arg)).join(' ');
    if (ignoreErrorPatterns.some(pattern => checkStr.includes(pattern))) {
      return; // Silence this warning
    }
    originalWarn.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (ignoreErrorPatterns.some(pattern => errorMsg.includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = (event.reason instanceof Error ? event.reason.message : String(event.reason)) || '';
    if (ignoreErrorPatterns.some(pattern => reasonMsg.includes(pattern))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Hook HTMLIFrameElement prototype to guarantee that accessing contentWindow doesn't cause security
  // or null-pointer errors if accessed in a sandboxed/detached cross-origin context.
  try {
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
    if (originalDescriptor && originalDescriptor.get) {
      const originalGet = originalDescriptor.get;
      Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
        get() {
          try {
            const win = originalGet.call(this);
            if (!win) {
              return {
                postMessage: () => {},
                addEventListener: () => {},
                removeEventListener: () => {},
                parent: window,
                top: window,
                self: null,
                window: null,
                document: null,
                location: { href: '', replace: () => {} }
              };
            }
            return win;
          } catch (e) {
            return {
              postMessage: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              parent: window,
              top: window,
              self: null,
              window: null,
              document: null,
              location: { href: '', replace: () => {} }
            };
          }
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch (err) {
    // Safely ignore prototype modification failures
  }

  // Intercept and stop the propagation of TradingView / general cross-origin iframe messages
  // to prevent unhandled iframe-resizer contentWindow verification errors in the parent frame.
  window.addEventListener('message', (event) => {
    try {
      const origin = event.origin || '';
      const dataStr = typeof event.data === 'string' ? event.data : JSON.stringify(event.data || '');

      const isTradingView = origin.includes('tradingview') || dataStr.includes('tradingview') || dataStr.includes('tv-chart');
      
      // Stop all non-critical cross-origin iframe events from propagating further if they are not system resizer payloads
      if (isTradingView && !dataStr.includes('[iFrameSizer]') && !dataStr.includes('iFrameResizer')) {
        event.stopImmediatePropagation();
      }
    } catch (e) {
      // Safely catch JSON.stringify errors for any nested binary payloads
    }
  }, true); // Use capture phase to intercept before parent system handlers get triggered
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

