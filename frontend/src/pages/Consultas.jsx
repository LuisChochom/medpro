import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FileText, Plus, Edit2, Trash2, Eye, Search, AlertCircle } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  const initialFormState = {
    cita_id: '', paciente_id: '', medico_id: '', motivo_consulta: '', sintomas: '', diagnostico: '',
    notas_evolucion: '',
    signos_vitales: {
      presion_arterial: '', frecuencia_cardiaca: '', temperatura: '', peso_kg: ''
    }
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState(null);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/consultas?search=${search}` : '/consultas';
      const [resConsultas, resPacientes, resMedicos, resCitas] = await Promise.all([
        api.get(endpoint),
        api.get('/pacientes'),
        api.get('/medicos'),
        api.get('/citas?estado=Confirmada')
      ]);
      setConsultas(resConsultas.data.data);
      setPacientes(resPacientes.data.data);
      setMedicos(resMedicos.data.data);
      setCitas(resCitas.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Handlers
  const openCreateModal = () => {
    setFormData(initialFormState);
    toast.error(null);
    setShowCreateModal(true);
  };

  const openEditModal = (c) => {
    setFormData({
      paciente_id: c.paciente_id?._id,
      medico_id: c.medico_id?._id,
      cita_id: c.cita_id,
      motivo_consulta: c.motivo_consulta,
      sintomas: c.sintomas,
      diagnostico: c.diagnostico,
      notas_evolucion: c.notas_evolucion || '',
      signos_vitales: c.signos_vitales || initialFormState.signos_vitales
    });
    setSelectedConsulta(c);
    toast.error(null);
    setShowEditModal(true);
  };

  const openViewModal = (c) => {
    setSelectedConsulta(c);
    setShowViewModal(true);
  };

  const openDeleteModal = (c) => {
    setSelectedConsulta(c);
    setShowDeleteModal(true);
  };

  // CRUD
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consultas', formData);
      setShowCreateModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar la consulta');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/consultas/${selectedConsulta._id}`, formData);
      setShowEditModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro actualizado exitosamente.");
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/consultas/${selectedConsulta._id}`);
      setShowDeleteModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error('Error al eliminar registro');
    }
  };

  // Al seleccionar cita, autocompletar paciente, medico y motivo
  const handleCitaChange = (citaId) => {
    const cita = citas.find(c => c._id === citaId);
    if(cita) {
      setFormData({
        ...formData,
        cita_id: citaId,
        paciente_id: cita.paciente_id?._id,
        medico_id: cita.medico_id?._id,
        motivo_consulta: cita.motivo
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FileText className="mr-2" /> Historial Clínico (Consultas)
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Registrar Consulta
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          placeholder="Buscar consultas por nombre o apellido del paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnóstico</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Cargando consultas...</td></tr>
            ) : consultas.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><AlertCircle className="inline h-6 w-6 mr-2" />No hay resultados</td></tr>
            ) : (
              consultas.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{new Date(c.fecha_consulta).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.paciente_id?.nombre} {c.paciente_id?.apellido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Dr. {c.medico_id?.apellido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{c.diagnostico}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openViewModal(c)} className="text-blue-600 hover:text-blue-900" title="Ver Expediente"><Eye className="w-5 h-5 inline" /></button>
                    <button onClick={() => openEditModal(c)} className="text-amber-500 hover:text-amber-700" title="Modificar"><Edit2 className="w-5 h-5 inline" /></button>
                    <button onClick={() => openDeleteModal(c)} className="text-red-600 hover:text-red-900" title="Eliminar"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALLES (READ) --- */}
      {showViewModal && selectedConsulta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-800">Expediente de Consulta</h3>
              <span className="text-sm text-gray-500">{new Date(selectedConsulta.fecha_consulta).toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-500">Paciente</p><p className="text-lg font-medium">{selectedConsulta.paciente_id?.nombre} {selectedConsulta.paciente_id?.apellido}</p></div>
              <div><p className="text-sm text-gray-500">Médico Atendiente</p><p className="text-lg font-medium">Dr. {selectedConsulta.medico_id?.nombre} {selectedConsulta.medico_id?.apellido}</p></div>
              
              <div className="col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100 flex justify-between">
                <div><p className="text-xs text-blue-800 font-bold">P. Arterial</p><p className="font-mono">{selectedConsulta.signos_vitales?.presion_arterial || 'N/A'}</p></div>
                <div><p className="text-xs text-blue-800 font-bold">Frecuencia C.</p><p className="font-mono">{selectedConsulta.signos_vitales?.frecuencia_cardiaca || 'N/A'} bpm</p></div>
                <div><p className="text-xs text-blue-800 font-bold">Temperatura</p><p className="font-mono">{selectedConsulta.signos_vitales?.temperatura || 'N/A'} °C</p></div>
                <div><p className="text-xs text-blue-800 font-bold">Peso</p><p className="font-mono">{selectedConsulta.signos_vitales?.peso_kg || 'N/A'} lb</p></div>
              </div>

              <div className="col-span-2"><p className="text-sm font-bold">Motivo:</p><p className="text-gray-700 bg-gray-50 p-2 rounded">{selectedConsulta.motivo_consulta}</p></div>
              <div className="col-span-2"><p className="text-sm font-bold">Síntomas:</p><p className="text-gray-700 bg-gray-50 p-2 rounded">{selectedConsulta.sintomas}</p></div>
              <div className="col-span-2"><p className="text-sm font-bold text-red-700">Diagnóstico:</p><p className="text-gray-900 bg-red-50 border border-red-100 p-2 rounded">{selectedConsulta.diagnostico}</p></div>
              <div className="col-span-2"><p className="text-sm font-bold">Notas de Evolución:</p><p className="text-gray-700 bg-gray-50 p-2 rounded whitespace-pre-wrap">{selectedConsulta.notas_evolucion || 'Sin notas.'}</p></div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition">Cerrar Expediente</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ELIMINACIÓN --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Consulta Médica?</h3>
            <p className="text-gray-500 mb-6">Esta acción borrará el registro clínico permanentemente. ¿Deseas continuar?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREAR / EDITAR --- */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              {showCreateModal ? 'Registrar Atención Médica' : 'Editar Expediente Clínico'}
            </h3>
            
            <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="space-y-4">
              {formErrors && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-sm text-red-700">{formErrors}</div>}

              {showCreateModal && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-blue-700">Vincular a Cita Confirmada (Opcional pero Recomendado)</label>
                  <select className="mt-1 w-full border-blue-300 border p-2 rounded-md" onChange={(e) => handleCitaChange(e.target.value)}>
                    <option value="">Selección Manual de Paciente/Médico...</option>
                    {citas.map(c => <option key={c._id} value={c._id}>{new Date(c.fecha_hora).toLocaleString()} - Paciente: {c.paciente_id?.nombre}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Paciente</label>
                  <select required className="mt-1 w-full border p-2 rounded-md bg-gray-50" disabled={!!formData.cita_id} value={formData.paciente_id} onChange={e=>setFormData({...formData, paciente_id: e.target.value})}>
                    <option value="">Seleccione Paciente</option>
                    {pacientes.map(p => <option key={p._id} value={p._id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Médico</label>
                  <select required className="mt-1 w-full border p-2 rounded-md bg-gray-50" disabled={!!formData.cita_id} value={formData.medico_id} onChange={e=>setFormData({...formData, medico_id: e.target.value})}>
                    <option value="">Seleccione Médico</option>
                    {medicos.map(m => <option key={m._id} value={m._id}>Dr. {m.nombre} {m.apellido}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="border p-4 rounded-md mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Signos Vitales</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div><label className="text-xs">P. Arterial</label><input placeholder="120/80" className="w-full border p-2 rounded-md text-sm" value={formData.signos_vitales.presion_arterial} onChange={e=>setFormData({...formData, signos_vitales: {...formData.signos_vitales, presion_arterial: e.target.value}})}/></div>
                  <div><label className="text-xs">Frec. Cardíaca</label><input type="number" placeholder="BPM" className="w-full border p-2 rounded-md text-sm" value={formData.signos_vitales.frecuencia_cardiaca} onChange={e=>setFormData({...formData, signos_vitales: {...formData.signos_vitales, frecuencia_cardiaca: e.target.value}})}/></div>
                  <div><label className="text-xs">Temperatura</label><input type="number" step="0.1" placeholder="°C" className="w-full border p-2 rounded-md text-sm" value={formData.signos_vitales.temperatura} onChange={e=>setFormData({...formData, signos_vitales: {...formData.signos_vitales, temperatura: e.target.value}})}/></div>
                  <div><label className="text-xs">Peso (lb)</label><input type="number" step="0.1" placeholder="lb" className="w-full border p-2 rounded-md text-sm" value={formData.signos_vitales.peso_kg} onChange={e=>setFormData({...formData, signos_vitales: {...formData.signos_vitales, peso_kg: e.target.value}})}/></div>
                </div>
              </div>

              <div><label className="block text-sm font-medium">Motivo</label><input required className="w-full border p-2 rounded-md mt-1" value={formData.motivo_consulta} onChange={e=>setFormData({...formData, motivo_consulta: e.target.value})}/></div>
              <div><label className="block text-sm font-medium">Síntomas</label><textarea required className="w-full border p-2 rounded-md mt-1" rows="2" value={formData.sintomas} onChange={e=>setFormData({...formData, sintomas: e.target.value})}/></div>
              <div><label className="block text-sm font-medium text-red-700">Diagnóstico</label><textarea required className="w-full border border-red-300 p-2 rounded-md mt-1 bg-red-50" rows="2" value={formData.diagnostico} onChange={e=>setFormData({...formData, diagnostico: e.target.value})}/></div>
              <div><label className="block text-sm font-medium">Notas de Evolución</label><textarea className="w-full border p-2 rounded-md mt-1" rows="3" value={formData.notas_evolucion} onChange={e=>setFormData({...formData, notas_evolucion: e.target.value})}/></div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">{showCreateModal ? 'Guardar Consulta' : 'Actualizar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
