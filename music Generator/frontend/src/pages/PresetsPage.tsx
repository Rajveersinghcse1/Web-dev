import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Preset {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: string;
  duration: number;
  tags: string[];
  category: string;
  created_at: string;
  usage_count: number;
  is_favorite: boolean;
  is_custom: boolean;
}

const PresetsPage: React.FC = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPreset, setNewPreset] = useState({
    name: '',
    description: '',
    prompt: '',
    model: 'musicgen-small',
    duration: 30,
    tags: '',
    category: 'custom'
  });

  const categories = [
    { value: 'all', label: 'All Presets', count: 0 },
    { value: 'electronic', label: 'Electronic', count: 0 },
    { value: 'classical', label: 'Classical', count: 0 },
    { value: 'rock', label: 'Rock', count: 0 },
    { value: 'jazz', label: 'Jazz', count: 0 },
    { value: 'ambient', label: 'Ambient', count: 0 },
    { value: 'custom', label: 'Custom', count: 0 }
  ];

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setLoading(true);
      // This would be a real API call in production
      const response = await axios.get('http://localhost:8000/api/v1/presets');
      setPresets(response.data.presets || []);
    } catch (err: any) {
      // For now, use mock data since presets endpoint might not exist
      setPresets(generateMockPresets());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPresets = (): Preset[] => {
    return [
      {
        id: '1',
        name: 'Energetic EDM',
        description: 'High-energy electronic dance music perfect for workouts',
        prompt: 'Upbeat electronic dance music with heavy bass, synthesizers, and driving beats',
        model: 'musicgen-medium',
        duration: 30,
        tags: ['edm', 'electronic', 'high-energy', 'bass'],
        category: 'electronic',
        created_at: '2024-01-15T10:00:00Z',
        usage_count: 45,
        is_favorite: true,
        is_custom: false
      },
      {
        id: '2',
        name: 'Relaxing Piano',
        description: 'Calm and peaceful piano melodies for relaxation',
        prompt: 'Soft piano melody with gentle harmonies, perfect for meditation and relaxation',
        model: 'musicgen-small',
        duration: 45,
        tags: ['piano', 'calm', 'relaxing', 'meditation'],
        category: 'classical',
        created_at: '2024-01-14T15:30:00Z',
        usage_count: 32,
        is_favorite: false,
        is_custom: false
      },
      {
        id: '3',
        name: 'Epic Orchestra',
        description: 'Dramatic orchestral music with powerful crescendos',
        prompt: 'Epic orchestral soundtrack with dramatic crescendo, choir, and powerful brass section',
        model: 'musicgen-large',
        duration: 60,
        tags: ['orchestral', 'epic', 'dramatic', 'cinematic'],
        category: 'classical',
        created_at: '2024-01-13T09:15:00Z',
        usage_count: 28,
        is_favorite: true,
        is_custom: false
      },
      {
        id: '4',
        name: 'Smooth Jazz',
        description: 'Elegant jazz with saxophone and piano',
        prompt: 'Smooth jazz with saxophone, piano, and subtle drums in a lounge atmosphere',
        model: 'musicgen-melody',
        duration: 40,
        tags: ['jazz', 'saxophone', 'smooth', 'lounge'],
        category: 'jazz',
        created_at: '2024-01-12T18:45:00Z',
        usage_count: 19,
        is_favorite: false,
        is_custom: false
      },
      {
        id: '5',
        name: 'Rock Anthem',
        description: 'Powerful rock music with electric guitars',
        prompt: 'Rock anthem with powerful drums, electric guitar riffs, and energetic bass',
        model: 'musicgen-medium',
        duration: 35,
        tags: ['rock', 'guitar', 'drums', 'energetic'],
        category: 'rock',
        created_at: '2024-01-11T14:10:00Z',
        usage_count: 37,
        is_favorite: false,
        is_custom: false
      },
      {
        id: '6',
        name: 'Ambient Space',
        description: 'Atmospheric ambient music with ethereal pads',
        prompt: 'Ambient electronic music with ethereal pads, subtle beats, and cosmic atmosphere',
        model: 'musicgen-small',
        duration: 50,
        tags: ['ambient', 'ethereal', 'atmospheric', 'space'],
        category: 'ambient',
        created_at: '2024-01-10T11:20:00Z',
        usage_count: 15,
        is_favorite: true,
        is_custom: false
      }
    ];
  };

  const filteredPresets = presets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'all') return presets.length;
    return presets.filter(p => p.category === category).length;
  };

  const toggleFavorite = async (presetId: string) => {
    try {
      const preset = presets.find(p => p.id === presetId);
      if (!preset) return;

      await axios.patch(`http://localhost:8000/api/v1/presets/${presetId}`, {
        is_favorite: !preset.is_favorite
      });

      setPresets(presets.map(p => 
        p.id === presetId ? { ...p, is_favorite: !p.is_favorite } : p
      ));
    } catch (err) {
      // Handle error silently for now
      setPresets(presets.map(p => 
        p.id === presetId ? { ...p, is_favorite: !p.is_favorite } : p
      ));
    }
  };

  const usePreset = (preset: Preset) => {
    // This would navigate to generator page with preset values
    // For now, we'll show an alert
    alert(`Using preset: ${preset.name}\nPrompt: ${preset.prompt}`);
  };

  const createPreset = async () => {
    if (!newPreset.name.trim() || !newPreset.prompt.trim()) {
      alert('Please fill in name and prompt');
      return;
    }

    try {
      const preset: Preset = {
        id: Date.now().toString(),
        name: newPreset.name,
        description: newPreset.description,
        prompt: newPreset.prompt,
        model: newPreset.model,
        duration: newPreset.duration,
        tags: newPreset.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: newPreset.category,
        created_at: new Date().toISOString(),
        usage_count: 0,
        is_favorite: false,
        is_custom: true
      };

      await axios.post('http://localhost:8000/api/v1/presets', preset);
      setPresets([...presets, preset]);
      setShowCreateModal(false);
      setNewPreset({
        name: '',
        description: '',
        prompt: '',
        model: 'musicgen-small',
        duration: 30,
        tags: '',
        category: 'custom'
      });
    } catch (err) {
      // Add to local state for now
      const preset: Preset = {
        id: Date.now().toString(),
        name: newPreset.name,
        description: newPreset.description,
        prompt: newPreset.prompt,
        model: newPreset.model,
        duration: newPreset.duration,
        tags: newPreset.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: newPreset.category,
        created_at: new Date().toISOString(),
        usage_count: 0,
        is_favorite: false,
        is_custom: true
      };
      setPresets([...presets, preset]);
      setShowCreateModal(false);
      setNewPreset({
        name: '',
        description: '',
        prompt: '',
        model: 'musicgen-small',
        duration: 30,
        tags: '',
        category: 'custom'
      });
    }
  };

  const deletePreset = async (presetId: string) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/presets/${presetId}`);
        setPresets(presets.filter(p => p.id !== presetId));
      } catch (err) {
        setPresets(presets.filter(p => p.id !== presetId));
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: '#cbd5e1' 
      }}>
        <div>Loading presets...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#f1f5f9' }}>
          Music Presets
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
          Ready-to-use music generation templates for different styles and moods
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
        {/* Sidebar */}
        <div>
          {/* Create Preset Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: 'background-color 0.2s'
            }}
          >
            + Create Preset
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '16px',
              marginBottom: '20px'
            }}
          />

          {/* Categories */}
          <div style={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.8)', 
            borderRadius: '12px', 
            padding: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#f1f5f9', fontSize: '1.1rem' }}>Categories</h3>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: selectedCategory === category.value ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  border: selectedCategory === category.value ? '1px solid #6366f1' : '1px solid transparent',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: '5px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{category.label}</span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {getCategoryCount(category.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {filteredPresets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎼</div>
              <h3 style={{ color: '#f1f5f9', marginBottom: '10px' }}>No presets found</h3>
              <p style={{ color: '#cbd5e1' }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first custom preset'}
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {filteredPresets.map((preset) => (
                <div key={preset.id} style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}>
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(preset.id)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      color: preset.is_favorite ? '#fbbf24' : '#6b7280'
                    }}
                  >
                    {preset.is_favorite ? '★' : '☆'}
                  </button>

                  <div style={{ marginBottom: '15px', paddingRight: '30px' }}>
                    <h3 style={{ 
                      color: '#f1f5f9', 
                      marginBottom: '8px', 
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      {preset.name}
                      {preset.is_custom && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '12px',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          CUSTOM
                        </span>
                      )}
                    </h3>
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: '14px', 
                      lineHeight: '1.4',
                      marginBottom: '10px'
                    }}>
                      {preset.description}
                    </p>
                    
                    <div style={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      padding: '10px',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}>
                      <p style={{ 
                        color: '#cbd5e1', 
                        fontSize: '13px', 
                        fontStyle: 'italic',
                        margin: 0
                      }}>
                        "{preset.prompt}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{
                        background: '#6366f1',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {preset.model.replace('musicgen-', '').toUpperCase()}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {preset.duration}s
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                        Used {preset.usage_count} times
                      </span>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                      {preset.tags.map((tag, index) => (
                        <span key={index} style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.7)',
                          color: '#94a3b8',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => usePreset(preset)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Use Preset
                    </button>
                    {preset.is_custom && (
                      <button
                        onClick={() => deletePreset(preset.id)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Preset Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#f1f5f9', marginBottom: '20px' }}>Create New Preset</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Name</label>
              <input
                type="text"
                value={newPreset.name}
                onChange={(e) => setNewPreset({...newPreset, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#f1f5f9'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Description</label>
              <input
                type="text"
                value={newPreset.description}
                onChange={(e) => setNewPreset({...newPreset, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#f1f5f9'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Prompt</label>
              <textarea
                value={newPreset.prompt}
                onChange={(e) => setNewPreset({...newPreset, prompt: e.target.value})}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#f1f5f9',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Model</label>
                <select
                  value={newPreset.model}
                  onChange={(e) => setNewPreset({...newPreset, model: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#f1f5f9'
                  }}
                >
                  <option value="musicgen-small">Small</option>
                  <option value="musicgen-medium">Medium</option>
                  <option value="musicgen-large">Large</option>
                  <option value="musicgen-melody">Melody</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Duration (s)</label>
                <input
                  type="number"
                  value={newPreset.duration}
                  onChange={(e) => setNewPreset({...newPreset, duration: parseInt(e.target.value)})}
                  min={10}
                  max={60}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#f1f5f9'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Tags (comma separated)</label>
              <input
                type="text"
                value={newPreset.tags}
                onChange={(e) => setNewPreset({...newPreset, tags: e.target.value})}
                placeholder="electronic, upbeat, energetic"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#f1f5f9'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={createPreset}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Preset
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'rgba(100, 116, 139, 0.3)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetsPage;