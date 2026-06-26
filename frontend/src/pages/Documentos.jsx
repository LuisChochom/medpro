import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Folder, Plus, Download, Edit2, Trash2, Search, AlertCircle, Eye, Image as ImageIcon } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const SecureMediaViewer = ({ docId, index, mimeType, nombre_archivo }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl = null;
    const fetchMedia = async () => {
      try {
        const res = await api.get(`/documentos/stream/${docId}/${index}`, { responseType: 'blob' });
        objectUrl = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }));
        setUrl(objectUrl);
      } catch (error) {
        console.error('Error al cargar archivo', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
    return () => {
      if(objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [docId, index, mimeType]);

  if (loading) return <div className="p-12 text-center text-gray-500">Cargando vista previa segura...</div>;
  if (!url) return <div className="p-12 text-center text-red-500">Error al cargar la vista previa.</div>;

  if (mimeType.startsWith('image/')) {
    return <img src={url} alt={nombre_archivo} className="max-w-full h-auto rounded mx-auto" style={{maxHeight: '600px'}} />;
  } else if (mimeType === 'application/pdf') {
    return <iframe src={url} className="w-full h-96 border rounded" title={nombre_archivo} />;
  }
  return null;
};

export default function Documentos() {
  const [documentos, setDocumentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [files, setFiles] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('Laboratorio');

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const endpoint = search ? `/documentos?search=${search}` : '/documentos';
      const [resDocs, resPacientes] = await Promise.all([
        api.get(endpoint),
        api.get('/pacientes')
      ]);
      setDocumentos(resDocs.data.data);
      setPacientes(resPacientes.data.data);
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
    setFiles([]);
    setPacienteId('');
    setTitulo('');
    setTipoDocumento('Laboratorio');
    setShowCreateModal(true);
  };

  const openEditModal = (d) => {
    setSelectedDoc(d);
    setTitulo(d.titulo || '');
    setTipoDocumento(d.tipo_documento);
    setShowEditModal(true);
  };

  const openDeleteModal = (d) => {
    setSelectedDoc(d);
    setShowDeleteModal(true);
  };

  const openViewModal = (d) => {
    setSelectedDoc(d);
    setShowViewModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.warning('Seleccione al menos un archivo');
    if (!pacienteId) return toast.warning('Seleccione un paciente');
    
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    formData.append('paciente_id', pacienteId);
    formData.append('titulo', titulo);
    formData.append('tipo_documento', tipoDocumento);

    try {
      await api.post('/documentos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowCreateModal(false);
      fetchData(debouncedSearchTerm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al subir documento');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/documentos/${selectedDoc._id}`, { titulo, tipo_documento: tipoDocumento });
      setShowEditModal(false);
      fetchData(debouncedSearchTerm);
    } catch (error) {
      toast.error('Error al actualizar metadata');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/documentos/${selectedDoc._id}`);
      setShowDeleteModal(false);
      fetchData(debouncedSearchTerm);
      toast.success("Registro eliminado/archivado exitosamente.");
    } catch (error) {
      toast.error('Error al eliminar archivo');
    }
  };

  const handleDownload = async (id, fileIndex, nombre) => {
    try {
      const res = await api.get(`/documentos/stream/${id}/${fileIndex}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombre);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Error al descargar');
    }
  };

  const getTipoColor = (tipo) => {
    switch(tipo){
      case 'Laboratorio': return 'bg-purple-100 text-purple-800';
      case 'Imagenología': return 'bg-blue-100 text-blue-800';
      case 'Consentimiento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Folder className="mr-2" /> Gestor de Archivos Físicos
        </h2>
        <button onClick={openCreateModal} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> Subir Archivos
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
          placeholder="Buscar registro por título o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título / Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjuntos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Cargando archivos...</td></tr>
            ) : documentos.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><AlertCircle className="inline mr-2" />No hay archivos subidos</td></tr>
            ) : (
              documentos.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.titulo}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{d.paciente_id?.nombre} {d.paciente_id?.apellido}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTipoColor(d.tipo_documento)}`}>{d.tipo_documento}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="flex items-center"><ImageIcon className="w-4 h-4 mr-1 text-gray-400"/> {d.archivos?.length || 0} archivos</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-3">
                    <button onClick={() => openViewModal(d)} className="text-blue-600 hover:text-blue-900" title="Ver Adjuntos"><Eye className="w-5 h-5 inline" /></button>
                    <button onClick={() => openEditModal(d)} className="text-amber-500 hover:text-amber-700" title="Editar Metadata"><Edit2 className="w-5 h-5 inline" /></button>
                    <button onClick={() => openDeleteModal(d)} className="text-red-600 hover:text-red-900" title="Eliminar Registro"><Trash2 className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL VISUALIZADOR --- */}
      {showViewModal && selectedDoc && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedDoc.titulo}</h3>
                <p className="text-sm text-gray-500">Paciente: {selectedDoc.paciente_id?.nombre} {selectedDoc.paciente_id?.apellido}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cerrar Visor</button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto bg-gray-100">
              <div className="grid grid-cols-1 gap-6">
                {selectedDoc.archivos?.map((archivo, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-bold text-gray-700 flex items-center"><ImageIcon className="w-4 h-4 mr-2 text-gray-400"/> {archivo.nombre_archivo}</p>
                      <button onClick={() => handleDownload(selectedDoc._id, index, archivo.nombre_archivo)} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 flex items-center">
                        <Download className="w-4 h-4 mr-1"/> Descargar
                      </button>
                    </div>
                    
                    {(archivo.mime_type.startsWith('image/') || archivo.mime_type === 'application/pdf') ? (
                      <SecureMediaViewer 
                        docId={selectedDoc._id} 
                        index={index} 
                        mimeType={archivo.mime_type} 
                        nombre_archivo={archivo.nombre_archivo} 
                      />
                    ) : (
                      <div className="p-12 text-center bg-gray-50 rounded border-dashed border-2 border-gray-300">
                        <p className="text-gray-500 mb-2">Vista previa no disponible para este tipo de archivo.</p>
                        <p className="font-mono text-sm">{archivo.mime_type}</p>
                      </div>
                    )}
                  </div>
                ))}
                {(!selectedDoc.archivos || selectedDoc.archivos.length === 0) && (
                  <p className="text-center text-gray-500 p-12">No hay archivos en este registro.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ELIMINAR --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Registro Completo?</h3>
            <p className="text-gray-500 mb-6">Esta acción borrará el registro y sus <strong>{selectedDoc?.archivos?.length} archivos adjuntos</strong> del servidor. No se puede deshacer. ¿Continuar?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Eliminar Todo</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR METADATA --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-11/12 md:w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Editar Metadata del Registro</h3>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Título del Registro</label>
                <input required className="w-full border p-2 rounded focus:ring-primary" value={titulo} onChange={e=>setTitulo(e.target.value)}/>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Cambiar Categoría</label>
                <select className="w-full border p-2 rounded-md focus:ring-primary focus:border-primary" value={tipoDocumento} onChange={e=>setTipoDocumento(e.target.value)}>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Imagenología">Imagenología</option>
                  <option value="Consentimiento">Consentimiento Médico</option>
                  <option value="Identificación">Identificación Personal</option>
                  <option value="Otro">Otro Archivo</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL SUBIR DOCUMENTOS --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Subir Registro de Archivos Clínicos</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Título / Descripción del Grupo</label>
                <input required placeholder="Ej. Laboratorios de Sangre Noviembre" className="mt-1 w-full border p-2 rounded-md focus:ring-primary" value={titulo} onChange={e=>setTitulo(e.target.value)}/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Expediente del Paciente</label>
                <select required className="mt-1 w-full border p-2 rounded-md focus:ring-primary focus:border-primary" value={pacienteId} onChange={e=>setPacienteId(e.target.value)}>
                  <option value="">Seleccione Paciente...</option>
                  {pacientes.map(p => <option key={p._id} value={p._id}>{p.nombre} {p.apellido} (Exp. {p.expediente_numero})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Categoría</label>
                <select required className="mt-1 w-full border p-2 rounded-md focus:ring-primary focus:border-primary" value={tipoDocumento} onChange={e=>setTipoDocumento(e.target.value)}>
                  <option value="Laboratorio">Laboratorio Clínico</option>
                  <option value="Imagenología">Imagenología (Rayos X, MRI)</option>
                  <option value="Consentimiento">Consentimiento Informado</option>
                  <option value="Identificación">Identificación Oficial</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="bg-blue-50 p-6 rounded-md border border-dashed border-blue-300 mt-4 text-center">
                <ImageIcon className="w-8 h-8 mx-auto text-blue-400 mb-2"/>
                <label className="block text-sm font-bold text-blue-900 mb-2">Seleccionar Archivos (PDF, JPG, PNG)</label>
                <input required type="file" multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" onChange={e=>setFiles(e.target.files)}/>
                <p className="text-xs text-gray-500 mt-2">Puedes seleccionar varios archivos al mismo tiempo.</p>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-md hover:bg-blue-700 flex items-center"><Download className="w-4 h-4 mr-2 rotate-180"/> Subir y Guardar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
