import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Calendar as CalIcon, Plus, Edit2, Trash2, Eye, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
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
  const [selectedCita, setSelectedCita] = useState(null);

  const [formData, setFormData] = useState({
    paciente_id: '', medico_id: '', fecha_hora: '', motivo: ''
  });
  const [formErrors, setFormErrors] = useState(null);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/citas?search=${search}` : '/citas';
      const [resCitas, resPacientes, resMedicos] = await Promise.all([
        api.get(endpoint),
        api.get('/pacientes'),
        api.get('/medicos')
      ]);
      setCitas(resCitas.data.data);
      setPacientes(resPacientes.data.data);
      setMedicos(resMedicos.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Handlers para modales
  const openCreateModal = () => {
    setFormData({ paciente_id: '', medico_id: '', fecha_hora: '', motivo: '' });
    toast.error(null);
    setShowCreateModal(true);
  };

  const openEditModal = (c) => {
    // Format datetime-local input: YYYY-MM-DDTHH:mm
    const dateObj = new Date(c.fecha_hora);
    const tzOffset = dateObj.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);

    setFormData({
      paciente_id: c.paciente_id._id,
      medico_id: c.medico_id._id,
      fecha_hora: localISOTime,
      motivo: c.motivo
    });
    setSelectedCita(c);
    toast.error(null);
    setShowEditModal(true);
  };

  const openViewModal = (c) => {
    setSelectedCita(c);
    setShowViewModal(true);
  };

  const openDeleteModal = (c) => {
    setSelectedCita(c);
    setShowDeleteModal(true);
  };

  // CRUD
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/citas', formData);
      setShowCreateModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agendar cita');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/citas/${selectedCita._id}`, formData);
      setShowEditModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro actualizado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/citas/${selectedCita._id}`);
      setShowDeleteModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error('Error al cancelar cita');
    }
  };

  const changeStatus = async (id, nuevoEstado) => {
    try {
      await api.patch(`/citas/${id}/estado`, { estado: nuevoEstado });
      fetchData(debouncedSearchTerm);
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmada': return 'bg-blue-100 text-blue-800';
      case 'Atendida': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <CalIcon className="mr-2" /> Agenda de Citas
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Agendar Cita
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          placeholder="Buscar cita por nombre o apellido de paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
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
                    Cargando agenda...
                  </div>
                </td>
              </tr>
            ) : citas.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No hay citas agendadas para esta búsqueda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              citas.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{new Date(c.fecha_hora).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.paciente_id?.nombre} {c.paciente_id?.apellido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Dr. {c.medico_id?.apellido}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(c.estado)}`}>{c.estado}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    {c.estado === 'Pendiente' && <button onClick={() => changeStatus(c._id, 'Confirmada')} className="text-blue-600 hover:text-blue-900" title="Confirmar"><CheckCircle className="w-5 h-5 inline" /></button>}
                    {c.estado === 'Confirmada' && <button onClick={() => changeStatus(c._id, 'Cancelada')} className="text-gray-400 hover:text-red-600" title="Cancelar"><XCircle className="w-5 h-5 inline" /></button>}
                    
                    <button onClick={() => openViewModal(c)} className="text-indigo-600 hover:text-indigo-900" title="Ver Detalles"><Eye className="w-5 h-5 inline" /></button>
                    
                    {c.estado !== 'Cancelada' && c.estado !== 'Atendida' && (
                      <>
                        <button onClick={() => openEditModal(c)} className="text-amber-500 hover:text-amber-700" title="Reprogramar"><Edit2 className="w-5 h-5 inline" /></button>
                        <button onClick={() => openDeleteModal(c)} className="text-red-600 hover:text-red-900" title="Eliminar Registro"><Trash2 className="w-5 h-5 inline" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALLES (READ) --- */}
      {showViewModal && selectedCita && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">Detalles de la Cita</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedCita.estado)}`}>{selectedCita.estado}</span>
            </div>
            
            <div className="space-y-4">
              <div><p className="text-sm text-gray-500">Fecha y Hora Programada</p><p className="text-lg font-medium">{new Date(selectedCita.fecha_hora).toLocaleString()}</p></div>
              <div><p className="text-sm text-gray-500">Paciente</p><p className="text-lg font-medium">{selectedCita.paciente_id?.nombre} {selectedCita.paciente_id?.apellido} (Exp. {selectedCita.paciente_id?.expediente_numero})</p></div>
              <div><p className="text-sm text-gray-500">Médico Asignado</p><p className="text-lg font-medium">Dr(a). {selectedCita.medico_id?.nombre} {selectedCita.medico_id?.apellido} - {selectedCita.medico_id?.especialidad}</p></div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-1">Motivo de la Cita:</p>
                <p className="text-gray-700">{selectedCita.motivo}</p>
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar registro de cita?</h3>
            <p className="text-gray-500 mb-6">
              Esta acción borrará permanentemente la cita de la base de datos (no es una simple cancelación). ¿Deseas proceder?
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Conservar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREAR / EDITAR --- */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {showCreateModal ? 'Agendar Nueva Cita' : 'Reprogramar Cita'}
            </h3>
            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="space-y-4">
              
              

              <div>
                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                <select required className="mt-1 w-full border p-2 rounded-md" value={formData.paciente_id} onChange={e=>setFormData({...formData, paciente_id: e.target.value})}>
                  <option value="">Seleccione Paciente</option>
                  {pacientes.map(p => <option key={p._id} value={p._id}>{p.nombre} {p.apellido} ({p.expediente_numero})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Médico Especialista</label>
                <select required className="mt-1 w-full border p-2 rounded-md" value={formData.medico_id} onChange={e=>setFormData({...formData, medico_id: e.target.value})}>
                  <option value="">Seleccione Médico</option>
                  {medicos.map(m => <option key={m._id} value={m._id}>Dr. {m.nombre} {m.apellido} - {m.especialidad}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                <input required type="datetime-local" className="mt-1 w-full border p-2 rounded-md" value={formData.fecha_hora} onChange={e=>setFormData({...formData, fecha_hora: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo de la Consulta</label>
                <textarea required className="mt-1 w-full border p-2 rounded-md" rows="3" value={formData.motivo} onChange={e=>setFormData({...formData, motivo: e.target.value})}></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">{showCreateModal ? 'Confirmar Agenda' : 'Actualizar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
