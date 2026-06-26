import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Settings, Plus, Edit2, Trash2, Key, Search, AlertCircle } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', display_name: '' });
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [formErrors, setFormErrors] = useState(null);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/roles?search=${search}` : '/roles';
      const [resRoles, resPermisos] = await Promise.all([
        api.get(endpoint),
        api.get('/permissions')
      ]);
      setRoles(resRoles.data.data);
      setPermisosDisponibles(resPermisos.data.data);
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
    setFormData({ name: '', display_name: '' });
    toast.error(null);
    setShowCreateModal(true);
  };

  const openEditModal = (r) => {
    setFormData({ name: r.name, display_name: r.display_name });
    setSelectedRole(r);
    toast.error(null);
    setShowEditModal(true);
  };

  const openPermisosModal = (r) => {
    setSelectedRole(r);
    setSelectedPermisos(r.permissions?.map(p => p._id) || []);
    setShowPermisosModal(true);
  };

  const openDeleteModal = (r) => {
    setSelectedRole(r);
    setShowDeleteModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/roles', formData);
      setShowCreateModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear rol');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/roles/${selectedRole._id}`, formData);
      setShowEditModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro actualizado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar rol');
    }
  };

  const handleSyncPermissions = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/roles/${selectedRole._id}/permissions`, { permissions: selectedPermisos });
      setShowPermisosModal(false);
      fetchData(debouncedSearchTerm);
    } catch (error) {
      toast.error('Error al sincronizar permisos');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/roles/${selectedRole._id}`);
      setShowDeleteModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error('Error al eliminar rol');
    }
  };

  const togglePermiso = (id) => {
    if (selectedPermisos.includes(id)) {
      setSelectedPermisos(selectedPermisos.filter(p => p !== id));
    } else {
      setSelectedPermisos([...selectedPermisos, id]);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="mr-2" /> Gestión de Roles y Permisos
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Nuevo Rol
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          placeholder="Buscar rol por nombre o llave técnica..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Llave Técnica</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Público</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alcance (Permisos)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Cargando roles...</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No se encontraron roles.</td></tr>
            ) : (
              roles.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 rounded inline-block mt-3 ml-6 font-bold">{r.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.display_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-200 flex items-center w-max">
                      <Key className="w-3 h-3 mr-1" /> {r.permissions?.length || 0} Reglas
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openPermisosModal(r)} className="text-blue-600 hover:text-blue-900" title="Asignar Permisos"><Key className="w-5 h-5 inline" /></button>
                    <button onClick={() => openEditModal(r)} className="text-amber-500 hover:text-amber-700" title="Editar"><Edit2 className="w-5 h-5 inline" /></button>
                    <button onClick={() => openDeleteModal(r)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE CREAR / EDITAR ROL --- */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {showCreateModal ? 'Crear Nuevo Rol' : 'Modificar Rol'}
            </h3>
            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="space-y-4">
              {formErrors && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{formErrors}</div>}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Público (Display Name)</label>
                <input required placeholder="Ej: Administrador Médico" className="w-full border p-2 rounded focus:ring-primary" value={formData.display_name} onChange={e=>setFormData({...formData, display_name: e.target.value})}/>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Llave Técnica en Sistema (Name)</label>
                <input required placeholder="Ej: admin_medico" className="w-full border p-2 rounded focus:ring-primary font-mono text-sm" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/>
                <p className="text-xs text-gray-500 mt-1">Este valor es usado en el código para validar permisos. Ej: admin, recepcionista.</p>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">{showCreateModal ? 'Crear' : 'Actualizar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL ASIGNAR PERMISOS --- */}
      {showPermisosModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-2xl">
            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center"><Key className="mr-2" /> Privilegios de Acceso</h3>
              <p className="text-gray-500 mt-1">Configurando alcance para el rol: <strong className="text-primary">{selectedRole?.display_name}</strong></p>
            </div>
            
            <form onSubmit={handleSyncPermissions}>
              <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
                {permisosDisponibles.map(p => (
                  <label key={p._id} className={`flex flex-col p-3 border rounded cursor-pointer transition ${selectedPermisos.includes(p._id) ? 'bg-blue-50 border-blue-300' : 'bg-white hover:border-gray-400'}`}>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                        checked={selectedPermisos.includes(p._id)}
                        onChange={() => togglePermiso(p._id)}
                      />
                      <span className="font-bold text-gray-800 text-sm">{p.description || p.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-6 font-mono mt-1">{p.name}</span>
                  </label>
                ))}
                {permisosDisponibles.length === 0 && <p className="col-span-2 text-center text-gray-500">No hay permisos definidos en el sistema.</p>}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowPermisosModal(false)} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cerrar sin Guardar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">Sincronizar Privilegios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL ELIMINAR --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Rol de Sistema?</h3>
            <p className="text-gray-500 mb-6">Se borrará permanentemente la llave técnica <strong>{selectedRole?.name}</strong>. Todos los usuarios que posean este rol perderán sus accesos asociados. ¿Continuar?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Destruir Rol</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
