import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Save, AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  category: string;
  fact: string;
  amount: number | null;
  source_url: string;
  last_verified: string;
}

export const KnowledgeBaseAdminPage: React.FC = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchKnowledge();
  }, [token]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/knowledge', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge base', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(entries)
      });
      
      if (res.ok) {
        setMessage('Successfully updated knowledge base.');
      } else {
        setMessage('Failed to update knowledge base. Ensure you have ADMIN privileges.');
      }
    } catch (err) {
      setMessage('Error saving knowledge base.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index: number, field: keyof KnowledgeEntry, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleAdd = () => {
    setEntries([
      { id: `kb_new_${Date.now()}`, category: 'STUDY', fact: '', amount: null, source_url: '', last_verified: new Date().toISOString().split('T')[0] },
      ...entries
    ]);
  };

  const handleDelete = (index: number) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  if (loading) return <div className="p-12 text-center">Loading Knowledge Base...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-indigo-600" />
              Germany Knowledge Base Admin
            </h1>
            <p className="text-gray-600 mt-1">Manage the centralized facts used by the Routing Agent and FAQs (PRD 20.5 & 23).</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleAdd} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <Plus className="w-4 h-4 mr-2" /> Add Entry
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-md ${message.includes('Success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Important Disclaimer:</strong> Do not treat any of these numbers as permanent. These are 2026 snapshots and change periodically. All UI displaying these numbers must show the "last_verified" date and indicate this is guidance, not legal advice.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex space-x-4 flex-1">
                  <div className="w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">ID</label>
                    <input type="text" value={entry.id} onChange={(e) => handleChange(idx, 'id', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select value={entry.category} onChange={(e) => handleChange(idx, 'category', e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                      <option value="STUDY">STUDY</option>
                      <option value="WORK">WORK</option>
                      <option value="VOCATIONAL">VOCATIONAL</option>
                      <option value="LIFESTYLE">LIFESTYLE</option>
                    </select>
                  </div>
                  <div className="w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount / Threshold</label>
                    <input type="number" value={entry.amount || ''} onChange={(e) => handleChange(idx, 'amount', e.target.value ? Number(e.target.value) : null)} className="w-full text-sm border-gray-300 rounded-md" placeholder="e.g. 11904" />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Last Verified</label>
                    <input type="date" value={entry.last_verified} onChange={(e) => handleChange(idx, 'last_verified', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <button onClick={() => handleDelete(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-md ml-4">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fact / Description</label>
                  <textarea value={entry.fact} onChange={(e) => handleChange(idx, 'fact', e.target.value)} rows={2} className="w-full text-sm border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Source URL</label>
                  <input type="text" value={entry.source_url} onChange={(e) => handleChange(idx, 'source_url', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
