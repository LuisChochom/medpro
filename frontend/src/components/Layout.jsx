import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, Activity, LogOut, FileText, Settings, Shield, Menu, X } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop & Mobile */}
      <div 
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-gray-800">MedPro</span>
          </div>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Activity className="h-5 w-5 mr-3" /> Dashboard
          </NavLink>
          
          {user?.permissions?.includes('pacientes.view') && (
            <NavLink to="/pacientes" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Users className="h-5 w-5 mr-3" /> Pacientes
            </NavLink>
          )}

          {user?.permissions?.includes('citas.view') && (
            <NavLink to="/citas" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Calendar className="h-5 w-5 mr-3" /> Agenda y Citas
            </NavLink>
          )}

          {user?.permissions?.includes('consultas.view') && (
            <NavLink to="/consultas" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <FileText className="h-5 w-5 mr-3" /> Historia Clínica
            </NavLink>
          )}

          {user?.permissions?.includes('recetas.view') && (
            <NavLink to="/recetas" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Activity className="h-5 w-5 mr-3" /> Recetas Médicas
            </NavLink>
          )}

          {user?.permissions?.includes('documentos.view') && (
            <NavLink to="/documentos" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Activity className="h-5 w-5 mr-3" /> Archivos PDF/Img
            </NavLink>
          )}

          {user?.permissions?.includes('medicos.view') && (
            <NavLink to="/medicos" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Shield className="h-5 w-5 mr-3" /> Médicos
            </NavLink>
          )}

          {user?.permissions?.includes('roles.manage') && (
            <NavLink to="/roles" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Settings className="h-5 w-5 mr-3" /> Roles y Permisos
            </NavLink>
          )}

          {user?.permissions?.includes('usuarios.manage') && (
            <NavLink to="/usuarios" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Shield className="h-5 w-5 mr-3" /> Usuarios Sistema
            </NavLink>
          )}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Panel de Control</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.roles?.[0] || 'Usuario'}</p>
            </div>
            <button onClick={logout} className="flex items-center text-gray-600 hover:text-red-600">
              <LogOut className="h-5 w-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
