import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette, Plus, Trash2, Edit, RefreshCw
} from 'lucide-react';
import { SkeletonGrid } from '../components/SkeletonLoader';

interface Theme {
  id: number;
  name: string;
  config: string;
  is_active: boolean;
}

const ThemeIndex: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      setThemes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleApply = async (theme: Theme) => {
    try {
      await fetch('/api/themes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: theme.id, apply: true })
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      await fetch(`/api/themes/${id}`, { method: 'DELETE' });
      fetchThemes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Themes</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchThemes}
            className="p-2 glass-dark hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/theme/create')}
            className="neon-button flex items-center justify-center gap-2 font-bold px-6 py-2.5"
          >
            <Plus className="w-5 h-5" />
            Create Theme
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <div
              key={theme.id}
              className={`glass-dark p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                theme.is_active ? 'border-neon-blue shadow-neon' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-2">
                    <button onClick={() => navigate(`/theme/edit/${theme.id}`)} className="p-2 glass-dark rounded-xl hover:bg-white/10"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(theme.id)} className="p-2 glass-dark rounded-xl hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                 </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                 <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: JSON.parse(theme.config).backgroundColor,
                      borderColor: JSON.parse(theme.config).primaryColor + '40',
                    }}
                 >
                    <Palette className="w-6 h-6" style={{ color: JSON.parse(theme.config).primaryColor }} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg">{theme.name}</h3>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-black">
                       {theme.is_active ? 'Currently Active' : 'Inactive'}
                    </p>
                 </div>
              </div>

              <div className="flex gap-2 mb-6">
                 {['primaryColor', 'backgroundColor', 'accentColor'].map(k => (
                   <div key={k} className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: JSON.parse(theme.config)[k] }} />
                 ))}
              </div>

              {!theme.is_active && (
                <button
                  onClick={() => handleApply(theme)}
                  className="w-full py-3 glass-dark hover:bg-neon-blue hover:text-white rounded-xl font-bold transition-all border border-white/5 hover:border-neon-blue group"
                >
                  Apply Aesthetic
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeIndex;
