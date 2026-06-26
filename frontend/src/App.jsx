import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';

import Pacientes from './pages/Pacientes';
import Medicos from './pages/Medicos';
import Citas from './pages/Citas';
import Consultas from './pages/Consultas';
import Recetas from './pages/Recetas';
import Documentos from './pages/Documentos';
import Roles from './pages/Roles';
import Usuarios from './pages/Usuarios';

const Dashboard = () => (
  <div className="bg-white p-8 rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4">Bienvenido a MedPro</h2>
    <p className="text-gray-600">Selecciona un módulo en el menú lateral para comenzar a gestionar.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="print:hidden">
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }} 
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="medicos" element={<Medicos />} />
            <Route path="citas" element={<Citas />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="recetas" element={<Recetas />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="roles" element={<Roles />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="*" element={<h2 className="text-red-500">Página en construcción</h2>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
