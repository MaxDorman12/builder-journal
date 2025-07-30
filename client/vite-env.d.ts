/// <reference types="vite/client" />

// Global type declarations for analytics
declare global {
  interface Window {
    FS?: {
      shutdown(): void;
    };
    gtag?: (...args: any[]) => void;
  }
}
