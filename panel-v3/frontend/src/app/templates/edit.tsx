import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function TemplatesEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    config: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        const template = data.find((t: any) => t.id === parseInt(id!));
        if (template) {
          setFormData({
            name: template.name,
            description: template.description,
            image: template.image,
            config: template.config || '{}'
          });
        }
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/templates?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) navigate('/templates');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/templates')}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Templates
      </button>

      <div className="glass-dark p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-neon-blue/10 rounded-2xl flex items-center justify-center border border-neon-blue/20">
            <Box className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Template</h1>
            <p className="text-white/40 text-sm">Update the deployment blueprint for {formData.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Template Name</label>
            <input
              type="text"
              required
              className="w-full neon-input py-3 px-4"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Base Container Image</label>
            <input
              type="text"
              required
              className="w-full neon-input py-3 px-4"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Short Description</label>
            <textarea
              className="w-full neon-input py-3 px-4"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">JSON Configuration Blueprint</label>
            <textarea
              className="w-full neon-input py-3 px-4 min-h-[150px] font-mono text-sm"
              value={formData.config}
              onChange={e => setFormData({...formData, config: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full neon-button py-4 font-bold flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
