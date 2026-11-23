import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'sonner';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: '10px',
              fontSize: '12px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
