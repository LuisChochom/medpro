import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Users, Plus, Edit2, Trash2, Eye, Search, AlertCircle } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);

  // Form states
  const initialFormState = {
    nombre: '', apellido: '', fecha_nacimiento: '', genero: 'M', telefono: '', direccion: '', tipo_sangre: 'O+',
    contacto_emergencia_nombre: '', contacto_emergencia_telefono: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState(null);

  const fetchPacientes = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/pacientes?search=${search}` : '/pacientes';
      const res = await api.get(endpoint);
      setPacientes(res.data.data);
    } catch (error) {
      console.error('Error fetching pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Handlers para modales
  const openCreateModal = () => {
    setFormData(initialFormState);
    toast.error(null);
    setShowCreateModal(true);
  };

  const openEditModal = (p) => {
    setFormData({
      nombre: p.nombre, apellido: p.apellido, fecha_nacimiento: p.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : '', 
      genero: p.genero, telefono: p.telefono, direccion: p.direccion, tipo_sangre: p.tipo_sangre,
      contacto_emergencia_nombre: p.contacto_emergencia_nombre || '', contacto_emergencia_telefono: p.contacto_emergencia_telefono || ''
    });
    setSelectedPaciente(p);
    toast.error(null);
    setShowEditModal(true);
  };

  const openViewModal = (p) => {
    setSelectedPaciente(p);
    setShowViewModal(true);
  };

  const openDeleteModal = (p) => {
    setSelectedPaciente(p);
    setShowDeleteModal(true);
  };

  // Acciones CRUD
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pacientes', formData);
      setShowCreateModal(false);
      fetchPacientes(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pacientes/${selectedPaciente._id}`, formData);
      setShowEditModal(false);
      fetchPacientes(debouncedSearchTerm);
      toast.success("Registro actualizado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pacientes/${selectedPaciente._id}`);
      setShowDeleteModal(false);
      fetchPacientes(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error("Error al eliminar/archivar el registro");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="mr-2" /> Directorio de Pacientes
        </h2>
        <button 
          onClick={openCreateModal}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1" /> Nuevo Paciente
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
          placeholder="Buscar paciente por nombre, apellido o expediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expediente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sangre</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                    Cargando pacientes...
                  </div>
                </td>
              </tr>
            ) : pacientes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No se encontraron registros para tu búsqueda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pacientes.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.expediente_numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.nombre} {p.apellido}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">{p.tipo_sangre}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openViewModal(p)} className="text-blue-600 hover:text-blue-900" title="Ver Detalles"><Eye className="w-5 h-5 inline" /></button>
                    <button onClick={() => openEditModal(p)} className="text-amber-500 hover:text-amber-700" title="Editar"><Edit2 className="w-5 h-5 inline" /></button>
                    <button onClick={() => openDeleteModal(p)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALLES (READ) --- */}
      {showViewModal && selectedPaciente && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">Perfil del Paciente</h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-mono text-sm">{selectedPaciente.expediente_numero}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="text-lg font-medium text-gray-900">{selectedPaciente.nombre} {selectedPaciente.apellido}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                <p className="text-lg font-medium text-gray-900">{new Date(selectedPaciente.fecha_nacimiento).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Género</p>
                <p className="text-lg font-medium text-gray-900">{selectedPaciente.genero === 'M' ? 'Masculino' : 'Femenino'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-lg font-medium text-gray-900">{selectedPaciente.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Sangre</p>
                <p className="text-lg font-medium text-red-600 font-bold">{selectedPaciente.tipo_sangre}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-lg font-medium text-gray-900">{selectedPaciente.direccion}</p>
              </div>
              <div className="col-span-2 bg-red-50 p-4 rounded-md border border-red-100">
                <h4 className="font-bold text-red-800 mb-2">Contacto de Emergencia</h4>
                <p className="text-red-900"><span className="font-medium">Nombre:</span> {selectedPaciente.contacto_emergencia_nombre || 'N/A'}</p>
                <p className="text-red-900"><span className="font-medium">Teléfono:</span> {selectedPaciente.contacto_emergencia_telefono || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition">Cerrar Perfil</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ELIMINACIÓN (DELETE) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Archivar paciente?</h3>
            <p className="text-gray-500 mb-6">
              Estás a punto de desactivar/archivar a <strong>{selectedPaciente?.nombre} {selectedPaciente?.apellido}</strong>. Ya no aparecerá en las búsquedas activas. ¿Deseas continuar?
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Archivar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREAR / EDITAR (CREATE & UPDATE) --- */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {showCreateModal ? 'Registrar Nuevo Paciente' : 'Editar Paciente'}
            </h3>
            
            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="space-y-4">
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Nombre</label><input required className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})}/></div>
                <div><label className="block text-sm font-medium text-gray-700">Apellido</label><input required className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.apellido} onChange={e=>setFormData({...formData, apellido: e.target.value})}/></div>
                <div><label className="block text-sm font-medium text-gray-700">Nacimiento</label><input required type="date" className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.fecha_nacimiento} onChange={e=>setFormData({...formData, fecha_nacimiento: e.target.value})}/></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Género</label>
                  <select className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.genero} onChange={e=>setFormData({...formData, genero: e.target.value})}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Teléfono</label><input required className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})}/></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                  <select className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.tipo_sangre} onChange={e=>setFormData({...formData, tipo_sangre: e.target.value})}>
                    <option value="O+">O+</option><option value="O-">O-</option><option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Dirección</label><input required className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})}/></div>
                
                <div className="col-span-2 mt-4 pt-4 border-t">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Contacto de Emergencia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Nombre de Contacto</label><input required className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.contacto_emergencia_nombre} onChange={e=>setFormData({...formData, contacto_emergencia_nombre: e.target.value})}/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Teléfono Emergencia</label><input required className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-primary focus:border-primary" value={formData.contacto_emergencia_telefono} onChange={e=>setFormData({...formData, contacto_emergencia_telefono: e.target.value})}/></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition">
                  {showCreateModal ? 'Guardar Paciente' : 'Actualizar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
