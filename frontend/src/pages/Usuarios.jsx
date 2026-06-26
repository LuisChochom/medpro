import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Users, Plus, Edit2, Shield, Search, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '', password: '', roles: [], is_active: true
  });
  const [formErrors, setFormErrors] = useState(null);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/users?search=${search}` : '/users';
      const [resUsers, resRoles] = await Promise.all([
        api.get(endpoint),
        api.get('/roles')
      ]);
      setUsuarios(resUsers.data.data);
      setRolesDisponibles(resRoles.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const openCreateModal = () => {
    setFormData({ email: '', password: '', roles: [], is_active: true });
    toast.error(null);
    setShowCreateModal(true);
  };

  const openEditModal = (u) => {
    setFormData({
      email: u.email,
      password: '', // Vacio a menos que quiera cambiarlo
      roles: u.roles.map(r => r._id),
      is_active: u.is_active
    });
    setSelectedUser(u);
    toast.error(null);
    setShowEditModal(true);
  };

  const handleRoleToggle = (roleId) => {
    const currentRoles = [...formData.roles];
    const index = currentRoles.indexOf(roleId);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(roleId);
    }
    setFormData({ ...formData, roles: currentRoles });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) return toast.error('Debe seleccionar al menos un rol.');
    try {
      await api.post('/users', formData);
      setShowCreateModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) return toast.error('Debe seleccionar al menos un rol.');
    try {
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) delete dataToUpdate.password; // No actualizar contraseña si viene vacia

      await api.put(`/users/${selectedUser._id}`, dataToUpdate);
      setShowEditModal(false);
      fetchData(debouncedSearchTerm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { is_active: !user.is_active });
      fetchData(debouncedSearchTerm);
    } catch (error) {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="mr-2" /> Gestión de Usuarios del Sistema
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Nuevo Usuario
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          placeholder="Buscar usuario por correo electrónico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario (Email)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles Asignados</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Cargando usuarios...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No se encontraron usuarios.</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map(r => (
                        <span key={r._id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs flex items-center border border-blue-200"><Shield className="w-3 h-3 mr-1"/> {r.display_name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {u.is_active ? (
                      <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full text-xs font-bold flex items-center w-max"><CheckCircle className="w-3 h-3 mr-1"/> Activo</span>
                    ) : (
                      <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full text-xs font-bold flex items-center w-max"><XCircle className="w-3 h-3 mr-1"/> Inactivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openEditModal(u)} className="text-amber-500 hover:text-amber-700" title="Editar"><Edit2 className="w-5 h-5 inline" /></button>
                    {u.is_active ? (
                      <button onClick={() => toggleStatus(u)} className="text-red-500 hover:text-red-700" title="Desactivar Acceso"><UserX className="w-5 h-5 inline" /></button>
                    ) : (
                      <button onClick={() => toggleStatus(u)} className="text-green-500 hover:text-green-700" title="Reactivar Acceso"><UserCheck className="w-5 h-5 inline" /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE CREAR / EDITAR --- */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {showCreateModal ? 'Crear Nuevo Usuario' : 'Modificar Perfil de Acceso'}
            </h3>
            
            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="space-y-4">
              {formErrors && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{formErrors}</div>}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico (Login)</label>
                <input required type="email" placeholder="ejemplo@clinica.com" className="w-full border p-2 rounded focus:ring-primary" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}/>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{showCreateModal ? 'Contraseña' : 'Nueva Contraseña (Opcional)'}</label>
                <input required={showCreateModal} type="password" placeholder="••••••••" className="w-full border p-2 rounded focus:ring-primary" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})}/>
                {showEditModal && <p className="text-xs text-gray-500 mt-1">Déjalo en blanco si no deseas cambiar la contraseña actual.</p>}
              </div>

              <div className="border p-4 rounded bg-gray-50">
                <label className="block text-sm font-bold text-gray-700 mb-3">Roles de Acceso Asignados</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rolesDisponibles.map(r => (
                    <label key={r._id} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border hover:border-primary transition">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                        checked={formData.roles.includes(r._id)}
                        onChange={() => handleRoleToggle(r._id)}
                      />
                      <span className="text-sm font-medium text-gray-700">{r.display_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">{showCreateModal ? 'Crear Usuario' : 'Actualizar Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
