// Global type definitions for the AI Meeting Agent project

// Window object extensions for external APIs
declare global {
  interface Window {
    OneDrive?: {
      open: (config: any) => void;
    };
  }
}

export {}; 