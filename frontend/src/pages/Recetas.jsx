import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FilePlus, Plus, Edit2, Trash2, Eye, Search, AlertCircle, Printer } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

export default function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  
  const [formData, setFormData] = useState({
    consulta_id: '',
    instrucciones_generales: '',
    medicamentos: []
  });

  const [med, setMed] = useState({ medicamento_nombre: '', dosis: '', frecuencia: '', duracion: '', cantidad_entregar: '' });

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/recetas?search=${search}` : '/recetas';
      const [resRecetas, resConsultas] = await Promise.all([
        api.get(endpoint),
        api.get('/consultas') // Consultas disponibles para receta
      ]);
      setRecetas(resRecetas.data.data);
      setConsultas(resConsultas.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const addMedicamento = () => {
    if(!med.medicamento_nombre || !med.dosis) return toast.warning('Nombre y dosis requeridos');
    setFormData({ ...formData, medicamentos: [...formData.medicamentos, med] });
    setMed({ medicamento_nombre: '', dosis: '', frecuencia: '', duracion: '', cantidad_entregar: '' });
  };

  const removeMedicamento = (index) => {
    const newMeds = [...formData.medicamentos];
    newMeds.splice(index, 1);
    setFormData({ ...formData, medicamentos: newMeds });
  };

  const openCreateModal = () => {
    setFormData({ consulta_id: '', instrucciones_generales: '', medicamentos: [] });
    setShowCreateModal(true);
  };

  const openViewModal = (r) => {
    setSelectedReceta(r);
    setShowViewModal(true);
  };

  const openDeleteModal = (r) => {
    setSelectedReceta(r);
    setShowDeleteModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(formData.medicamentos.length === 0) return toast.warning('Añade al menos un medicamento');
    try {
      const res = await api.post('/recetas', formData);
      setShowCreateModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro creado exitosamente.");
      
      // Auto-imprimir
      if (res.data && res.data.data) {
        setSelectedReceta(res.data.data);
        setShowViewModal(true);
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al emitir receta');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/recetas/${selectedReceta._id}`);
      setShowDeleteModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error('Error al anular receta');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FilePlus className="mr-2" /> Recetario Médico
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Emitir Receta
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          placeholder="Buscar receta por código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicamentos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Emisión</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Cargando recetas...</td></tr>
            ) : recetas.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><AlertCircle className="inline mr-2" />No se encontraron recetas</td></tr>
            ) : (
              recetas.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold font-mono text-primary">{r.codigo_receta}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.consulta_id?.paciente_id?.nombre} {r.consulta_id?.paciente_id?.apellido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.medicamentos?.length} rx.</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openViewModal(r)} className="text-blue-600 hover:text-blue-900" title="Ver e Imprimir"><Printer className="w-5 h-5 inline" /></button>
                    <button onClick={() => openDeleteModal(r)} className="text-red-600 hover:text-red-900" title="Anular"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL LECTURA (IMPRIMIR RECETA) --- */}
      {showViewModal && selectedReceta && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 md:w-full max-w-2xl font-sans">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 tracking-tight">RECETA MÉDICA</h3>
                <p className="text-gray-500">Dr. {selectedReceta.consulta_id?.medico_id?.nombre} {selectedReceta.consulta_id?.medico_id?.apellido}</p>
                <p className="text-sm text-gray-400">Colegiado: {selectedReceta.consulta_id?.medico_id?.colegiado_numero}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-blue-900">{selectedReceta.codigo_receta}</p>
                <p className="text-sm text-gray-500">{new Date(selectedReceta.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="mb-6 bg-gray-50 p-4 rounded-md border">
              <p><strong>Paciente:</strong> {selectedReceta.consulta_id?.paciente_id?.nombre} {selectedReceta.consulta_id?.paciente_id?.apellido}</p>
              <p><strong>Diagnóstico:</strong> {selectedReceta.consulta_id?.diagnostico}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-xl mb-3 text-indigo-900 flex items-center">Rx</h4>
              <ul className="space-y-4">
                {selectedReceta.medicamentos?.map((m, i) => (
                  <li key={i} className="border-b pb-2">
                    <p className="font-bold text-lg">{m.medicamento_nombre} <span className="text-sm font-normal text-gray-500">{m.dosis}</span></p>
                    <p className="text-gray-700">Tomar {m.frecuencia} durante {m.duracion}.</p>
                    <p className="text-sm text-gray-500">Cantidad a despachar: {m.cantidad_entregar}</p>
                  </li>
                ))}
              </ul>
            </div>

            {selectedReceta.instrucciones_generales && (
              <div className="mb-8">
                <h4 className="font-bold text-gray-800">Indicaciones Generales / Dieta</h4>
                <p className="text-gray-600 bg-yellow-50 p-3 rounded">{selectedReceta.instrucciones_generales}</p>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-3 print:hidden">
              <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center"><Printer className="w-4 h-4 mr-2"/> Imprimir</button>
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ELIMINAR --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Anular Receta?</h3>
            <p className="text-gray-500 mb-6">Esta acción borrará la receta con código <strong>{selectedReceta?.codigo_receta}</strong>. No podrá ser surtida en farmacia. ¿Continuar?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Anular</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREAR --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              Emitir Receta Médica
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700">Vincular a Consulta</label>
                <select required className="mt-1 w-full border p-2 rounded-md bg-gray-50" value={formData.consulta_id} onChange={e=>setFormData({...formData, consulta_id: e.target.value})}>
                  <option value="">Seleccione Consulta Atendida</option>
                  {consultas.map(c => <option key={c._id} value={c._id}>{new Date(c.fecha_consulta).toLocaleDateString()} - {c.paciente_id?.nombre} - {c.diagnostico}</option>)}
                </select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Prescripción (Agregar Medicamento)</h4>
                <div className="grid grid-cols-5 gap-2 items-end">
                  <div><label className="text-xs">Nombre</label><input placeholder="Ej: Paracetamol" className="w-full border p-2 rounded text-sm bg-white" value={med.medicamento_nombre} onChange={e=>setMed({...med, medicamento_nombre: e.target.value})}/></div>
                  <div><label className="text-xs">Dosis</label><input placeholder="Ej: 500mg" className="w-full border p-2 rounded text-sm bg-white" value={med.dosis} onChange={e=>setMed({...med, dosis: e.target.value})}/></div>
                  <div><label className="text-xs">Frecuencia</label><input placeholder="Ej: Cada 8h" className="w-full border p-2 rounded text-sm bg-white" value={med.frecuencia} onChange={e=>setMed({...med, frecuencia: e.target.value})}/></div>
                  <div><label className="text-xs">Duración</label><input placeholder="Ej: 7 días" className="w-full border p-2 rounded text-sm bg-white" value={med.duracion} onChange={e=>setMed({...med, duracion: e.target.value})}/></div>
                  <div><label className="text-xs">Cant.</label><input type="number" placeholder="Cajas" className="w-full border p-2 rounded text-sm bg-white" value={med.cantidad_entregar} onChange={e=>setMed({...med, cantidad_entregar: e.target.value})}/></div>
                </div>
                <button type="button" onClick={addMedicamento} className="mt-3 text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm font-bold">Agregar a Lista</button>
              </div>

              {formData.medicamentos.length > 0 && (
                <div className="border rounded-md mt-4 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Indicación</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cant</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th></tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.medicamentos.map((m, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-sm font-bold text-gray-900">{m.medicamento_nombre} {m.dosis}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">Tomar {m.frecuencia} por {m.duracion}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{m.cantidad_entregar}</td>
                          <td className="px-4 py-2 text-sm"><button type="button" onClick={()=>removeMedicamento(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4"><label className="block text-sm font-bold text-gray-700">Instrucciones Generales / Dieta</label><textarea className="mt-1 w-full border p-2 rounded-md" rows="3" value={formData.instrucciones_generales} onChange={e=>setFormData({...formData, instrucciones_generales: e.target.value})}/></div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700">Emitir Receta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
