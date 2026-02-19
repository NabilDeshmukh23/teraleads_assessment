import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Header from '../components/Header';
import { Search, Edit2, Trash2, Plus, Clock, Activity, CheckCircle, X, AlertTriangle, Loader2, MessageCircle } from 'lucide-react';
import AIChatBot from '../components/AIChatBot';

const ModalWrapper = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-3xl p-8 w-full ${maxWidth} shadow-2xl animate-in zoom-in duration-200 border border-gray-100`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 border-l-4 border-blue-600 pl-3 uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1 rounded-lg transition"><X size={24} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Dashboard = () => {
  // --- States ---
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ show: false, id: null });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', dob: '', medicalNotes: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, recentlyAdded: 0 });
  const LIMIT = 3;

  const showSuccess = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchInsights = async () => {
    try {
      const response = await api.get('/patients/insights');
      setStats({
        total: response.data.total || 0,
        recentlyAdded: response.data.recentlyAdded || 0
      });
    } catch (err) {
      console.error("INSIGHTS_FETCH_ERROR", err);
    }
  };

  const fetchPatients = async (query = '', page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/patients/list?page=${page}&limit=${LIMIT}&search=${query}`);
      setPatients(response.data.patients || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("FETCH ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(searchTerm, currentPage);
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage]);

  const handlePageChange = (newPage) => {
    setLoading(true);
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openChatWithPatient = (patient) => {
    setSelectedPatient(patient);
    showSuccess(`SECURE CHAT OPENED: ${patient.name.toUpperCase()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/patients/update/${currentPatientId}`, formData);
        showSuccess("PATIENT UPDATED SUCCESSFULLY!");
      } else {
        await api.post('/patients/add', formData);
        showSuccess("PATIENT REGISTERED SUCCESSFULLY!");
      }
      closeModal();
      await fetchPatients(searchTerm, currentPage);
      await fetchInsights();
    } catch (err) {
      alert(err.response?.data?.error || "AN ERROR OCCURRED");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (patient) => {
    setIsEditing(true);
    setCurrentPatientId(patient.id);
    setFormData({ name: patient.name, email: patient.email, phone: patient.phone, dob: patient.dob || '', medicalNotes: patient.medicalNotes || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setFormData({ name: '', email: '', phone: '', dob: '', medicalNotes: '' });
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/patients/delete/${deleteConfig.id}`);
      showSuccess("PATIENT DELETED SUCCESSFULLY!");
      setDeleteConfig({ show: false, id: null });
      await fetchPatients(searchTerm, currentPage);
      await fetchInsights();
    } catch (err) {
      console.error("DELETE_API_ERROR:", err.response?.data);
      alert(err.response?.data?.error || "DELETE FAILED.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-800 font-sans relative">
      <Header patientCount={stats.total} />

      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle size={18} />
          <span className="font-bold tracking-wide">{notification}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest">TOTAL PATIENTS</p>
              <p className="text-4xl font-black text-slate-900">{stats.total}</p>
            </div>
            <Activity className="text-blue-500" size={40} />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest">NEW (24H)</p>
              <p className="text-4xl font-black text-slate-900">+{stats.recentlyAdded}</p>
            </div>
            <Clock className="text-orange-500" size={40} />
          </div>
        </div>


        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="SEARCH PATIENT..."
                value={searchTerm}
                className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition text-sm font-bold tracking-tight"
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all"
                  title="Clear search"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest">
              <Plus size={18} className="inline mr-2" /> ADD PATIENT
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
                  <th className="px-8 py-5">NAME</th>
                  <th className="px-8 py-5">EMAIL</th>
                  <th className="px-8 py-5">PHONE</th>
                  <th className="px-8 py-5">BIRTH DATE</th>
                  <th className="px-8 py-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-blue-600">
                      <div className="flex flex-col items-center gap-2 uppercase font-black tracking-widest text-xs">
                        <Loader2 className="animate-spin" size={32} />
                        Syncing Records...
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-gray-400 uppercase font-black">No patients found</td></tr>
                ) : patients.map((p) => (
                  <tr key={p.id} className={`transition group ${selectedPatient?.id === p.id ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                    <td className="px-8 py-6 text-slate-900 uppercase flex items-center gap-2 font-black">
                      {p.name}
                      {selectedPatient?.id === p.id && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                    </td>
                    <td className="px-8 py-6 text-gray-600 uppercase font-medium">{p.email}</td>
                    <td className="px-8 py-6 font-mono text-gray-600">{p.phone}</td>
                    <td className="px-8 py-6 text-gray-500 uppercase">{p.dob || '—'}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-4 text-gray-300">
                        <button onClick={() => openChatWithPatient(p)} className={`${selectedPatient?.id === p.id ? 'text-blue-600' : 'hover:text-blue-600'} transition active:scale-90`} title="START AI CHAT"><MessageCircle size={22} /></button>
                        <button onClick={() => openEditModal(p)} className="hover:text-green-600 transition" title="EDIT"><Edit2 size={18} /></button>
                        <button onClick={() => setDeleteConfig({ show: true, id: p.id })} className="hover:text-red-500 transition" title="DELETE"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>


      <ModalWrapper isOpen={showModal} onClose={closeModal} title={isEditing ? 'Update Patient' : 'Register Patient'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 tracking-[0.2em]">FULL NAME</label>
            <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-sm" onChange={e => setFormData({ ...formData, name: e.target.value })} value={formData.name} required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 tracking-[0.2em]">EMAIL ADDRESS</label>
            <input type="email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-sm" onChange={e => setFormData({ ...formData, email: e.target.value })} value={formData.email} required disabled={isSubmitting} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em]">DOB</label>
              <input
                type="date"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition text-sm font-bold"
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                value={formData.dob}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-[1.5] space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-[0.2em]">PHONE</label>
              <input
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-sm"
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                value={formData.phone}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 tracking-[0.2em]">MEDICAL NOTES</label>
            <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition h-28 resize-none font-bold text-xs leading-relaxed" onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })} value={formData.medicalNotes} disabled={isSubmitting} />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 uppercase rounded-2xl font-black hover:bg-blue-700 shadow-xl transition mt-4 text-xs flex justify-center items-center gap-2">
            {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : (isEditing ? 'Save Changes' : 'Confirm Registration')}
          </button>
        </form>
      </ModalWrapper>

      <ModalWrapper isOpen={deleteConfig.show} onClose={() => setDeleteConfig({ show: false, id: null })} title="DELETE CONFIRMATION" maxWidth="max-w-md">
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto"><AlertTriangle size={40} /></div>
          <p className="text-gray-500 mb-8 uppercase font-bold tracking-tight text-xs">PERMANENTLY REMOVE THE RECORD? THIS CANNOT BE UNDONE.</p>
          <div className="flex gap-4 w-full">
            <button disabled={actionLoading} onClick={() => setDeleteConfig({ show: false, id: null })} className="flex-1 py-4 text-[10px] font-black text-slate-500 bg-gray-100 rounded-2xl uppercase">CANCEL</button>
            <button disabled={actionLoading} onClick={handleDelete} className="flex-1 py-4 text-[10px] font-black text-white bg-red-500 rounded-2xl shadow-xl flex justify-center items-center gap-2 uppercase">
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'YES, DELETE'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      <AIChatBot patientId={selectedPatient?.id} patientName={selectedPatient?.name} />
    </div>
  );
};

export default Dashboard;