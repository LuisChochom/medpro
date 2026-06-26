import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Shield, Plus, Edit2, Trash2, Eye, Search, AlertCircle } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);

  // Form states
  const initialFormState = {
    email: '', password: '', colegiado_numero: '', nombre: '', apellido: '', especialidad: '',
    telefono: '', horario_entrada: '08:00', horario_salida: '16:00', dias_laborables: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState(null);

  const fetchMedicos = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/medicos?search=${search}` : '/medicos';
      const res = await api.get(endpoint);
      setMedicos(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicos(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Handlers para modales
  const openCreateModal = () => {
    setFormData(initialFormState);
    toast.error(null);
    setShowCreateModal(true);
  };

  const openEditModal = (m) => {
    setFormData({
      colegiado_numero: m.colegiado_numero, nombre: m.nombre, apellido: m.apellido,
      especialidad: m.especialidad, telefono: m.telefono,
      horario_entrada: m.horario_entrada, horario_salida: m.horario_salida,
      dias_laborables: m.dias_laborables
    });
    setSelectedMedico(m);
    toast.error(null);
    setShowEditModal(true);
  };

  const openViewModal = (m) => {
    setSelectedMedico(m);
    setShowViewModal(true);
  };

  const openDeleteModal = (m) => {
    setSelectedMedico(m);
    setShowDeleteModal(true);
  };

  // Acciones CRUD
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medicos', formData);
      setShowCreateModal(false);
      fetchMedicos(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el médico');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/medicos/${selectedMedico._id}`, formData);
      setShowEditModal(false);
      fetchMedicos(debouncedSearchTerm);
      toast.success("Registro actualizado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/medicos/${selectedMedico._id}`);
      setShowDeleteModal(false);
      fetchMedicos(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error('Error al dar de baja el médico');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Shield className="mr-2" /> Listado de Médicos
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Nuevo Médico
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
          placeholder="Buscar por nombre, apellido o número de colegiado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colegiado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando médicos...
                  </div>
                </td>
              </tr>
            ) : medicos.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No se encontraron médicos para tu búsqueda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              medicos.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{m.colegiado_numero}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Dr(a). {m.nombre} {m.apellido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.especialidad}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.horario_entrada} - {m.horario_salida}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openViewModal(m)} className="text-blue-600 hover:text-blue-900" title="Ver Detalles"><Eye className="w-5 h-5 inline" /></button>
                    <button onClick={() => openEditModal(m)} className="text-amber-500 hover:text-amber-700" title="Editar"><Edit2 className="w-5 h-5 inline" /></button>
                    <button onClick={() => openDeleteModal(m)} className="text-red-600 hover:text-red-900" title="Desactivar"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALLES (READ) --- */}
      {showViewModal && selectedMedico && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">Perfil Médico</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedMedico.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {selectedMedico.is_active ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-500">Nombre Completo</p><p className="text-lg font-medium">Dr(a). {selectedMedico.nombre} {selectedMedico.apellido}</p></div>
              <div><p className="text-sm text-gray-500">No. Colegiado</p><p className="text-lg font-medium">{selectedMedico.colegiado_numero}</p></div>
              <div><p className="text-sm text-gray-500">Especialidad</p><p className="text-lg font-medium text-primary">{selectedMedico.especialidad}</p></div>
              <div><p className="text-sm text-gray-500">Teléfono</p><p className="text-lg font-medium">{selectedMedico.telefono}</p></div>
              
              <div className="col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100 mt-2">
                <h4 className="font-bold text-blue-800 mb-2">Disponibilidad de Agenda</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p className="text-blue-900"><span className="font-medium">Días Laborables:</span> {selectedMedico.dias_laborables?.join(', ')}</p>
                  <p className="text-blue-900"><span className="font-medium">Horario:</span> {selectedMedico.horario_entrada} a {selectedMedico.horario_salida}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ELIMINACIÓN (DELETE) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Dar de baja a Médico?</h3>
            <p className="text-gray-500 mb-6">
              Estás a punto de desactivar la cuenta y ocultar a <strong>Dr(a). {selectedMedico?.nombre} {selectedMedico?.apellido}</strong>. Ya no podrá agendar citas ni acceder al sistema.
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Desactivar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREAR / EDITAR --- */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {showCreateModal ? 'Registrar Nuevo Médico' : 'Editar Médico'}
            </h3>
            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {formErrors && (
                <div className="col-span-2 bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm text-red-700">{formErrors}</p>
                </div>
              )}

              {showCreateModal && (
                <div className="col-span-2 bg-gray-50 p-4 rounded-md border mb-2">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Credenciales de Acceso (Usuario)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Email</label><input required type="email" className="mt-1 w-full border p-2 rounded-md" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Contraseña (min 6)</label><input required type="password" minLength="6" className="mt-1 w-full border p-2 rounded-md" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})}/></div>
                  </div>
                </div>
              )}

              <div><label className="block text-sm font-medium text-gray-700">Nombre</label><input required className="mt-1 w-full border p-2 rounded-md" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})}/></div>
              <div><label className="block text-sm font-medium text-gray-700">Apellido</label><input required className="mt-1 w-full border p-2 rounded-md" value={formData.apellido} onChange={e=>setFormData({...formData, apellido: e.target.value})}/></div>
              <div><label className="block text-sm font-medium text-gray-700">Colegiado No.</label><input required className="mt-1 w-full border p-2 rounded-md" value={formData.colegiado_numero} onChange={e=>setFormData({...formData, colegiado_numero: e.target.value})}/></div>
              <div><label className="block text-sm font-medium text-gray-700">Especialidad</label><input required className="mt-1 w-full border p-2 rounded-md" value={formData.especialidad} onChange={e=>setFormData({...formData, especialidad: e.target.value})}/></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Teléfono</label><input required className="mt-1 w-full border p-2 rounded-md" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})}/></div>
              
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Disponibilidad y Horarios</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Entrada</label><input required type="time" className="mt-1 w-full border p-2 rounded-md" value={formData.horario_entrada} onChange={e=>setFormData({...formData, horario_entrada: e.target.value})}/></div>
                  <div><label className="block text-sm font-medium text-gray-700">Salida</label><input required type="time" className="mt-1 w-full border p-2 rounded-md" value={formData.horario_salida} onChange={e=>setFormData({...formData, horario_salida: e.target.value})}/></div>
                </div>
              </div>

              <div className="col-span-2 flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">{showCreateModal ? 'Crear Médico' : 'Actualizar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
