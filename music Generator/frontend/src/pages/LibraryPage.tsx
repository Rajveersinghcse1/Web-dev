import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AudioTrack {
  id: string;
  title: string;
  prompt: string;
  model: string;
  duration: number;
  created_at: string;
  file_size: number;
  audio_url: string;
}

const LibraryPage: React.FC = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      // This would be a real API call in production
      const response = await axios.get('http://localhost:8000/api/v1/music/library');
      setTracks(response.data.tracks || []);
    } catch (err: any) {
      // For now, use mock data since library endpoint might not exist
      setTracks(generateMockTracks());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTracks = (): AudioTrack[] => {
    const mockTracks = [
      {
        id: '1',
        title: 'Electronic Dance Anthem',
        prompt: 'Upbeat electronic dance music with heavy bass and synthesizers',
        model: 'musicgen-medium',
        duration: 30,
        created_at: '2024-01-15T10:30:00Z',
        file_size: 2.4,
        audio_url: '#'
      },
      {
        id: '2',
        title: 'Calm Acoustic Melody',
        prompt: 'Calm acoustic guitar melody with soft vocals for relaxation',
        model: 'musicgen-small',
        duration: 45,
        created_at: '2024-01-14T15:20:00Z',
        file_size: 3.6,
        audio_url: '#'
      },
      {
        id: '3',
        title: 'Epic Orchestra',
        prompt: 'Epic orchestral soundtrack with dramatic crescendo and choir',
        model: 'musicgen-large',
        duration: 60,
        created_at: '2024-01-13T09:15:00Z',
        file_size: 4.8,
        audio_url: '#'
      },
      {
        id: '4',
        title: 'Jazz Piano Solo',
        prompt: 'Jazz piano solo in a smoky bar atmosphere with saxophone',
        model: 'musicgen-melody',
        duration: 40,
        created_at: '2024-01-12T18:45:00Z',
        file_size: 3.2,
        audio_url: '#'
      },
      {
        id: '5',
        title: 'Rock Anthem',
        prompt: 'Rock anthem with powerful drums and electric guitar riffs',
        model: 'musicgen-medium',
        duration: 35,
        created_at: '2024-01-11T14:10:00Z',
        file_size: 2.8,
        audio_url: '#'
      }
    ];
    return mockTracks;
  };

  const filteredAndSortedTracks = tracks
    .filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           track.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModel = filterModel === 'all' || track.model === filterModel;
      return matchesSearch && matchesModel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const getModelColor = (model: string) => {
    const colors: { [key: string]: string } = {
      'musicgen-small': '#10b981',
      'musicgen-medium': '#f59e0b',
      'musicgen-large': '#ef4444',
      'musicgen-melody': '#8b5cf6'
    };
    return colors[model] || '#6b7280';
  };

  const deleteTrack = async (trackId: string) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await axios.delete(`http://localhost:8000/api/v1/music/library/${trackId}`);
        setTracks(tracks.filter(track => track.id !== trackId));
      } catch (err) {
        setError('Failed to delete track');
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
        <div>Loading your music library...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#f1f5f9' }}>
          Music Library
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
          Browse and manage your generated music tracks
        </p>
      </div>

      {/* Controls */}
      <div style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.8)', 
        borderRadius: '12px', 
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '15px', alignItems: 'center' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '16px'
            }}
          />

          {/* Model Filter */}
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            style={{
              padding: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '16px'
            }}
          >
            <option value="all">All Models</option>
            <option value="musicgen-small">MusicGen Small</option>
            <option value="musicgen-medium">MusicGen Medium</option>
            <option value="musicgen-large">MusicGen Large</option>
            <option value="musicgen-melody">MusicGen Melody</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '16px'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>
            {filteredAndSortedTracks.length}
          </div>
          <div style={{ color: '#cbd5e1' }}>Total Tracks</div>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {filteredAndSortedTracks.reduce((acc, track) => acc + track.duration, 0)}s
          </div>
          <div style={{ color: '#cbd5e1' }}>Total Duration</div>
        </div>

        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {filteredAndSortedTracks.reduce((acc, track) => acc + track.file_size, 0).toFixed(1)} MB
          </div>
          <div style={{ color: '#cbd5e1' }}>Total Size</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5'
        }}>
          {error}
        </div>
      )}

      {/* Tracks Grid */}
      {filteredAndSortedTracks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎵</div>
          <h3 style={{ color: '#f1f5f9', marginBottom: '10px' }}>No tracks found</h3>
          <p style={{ color: '#cbd5e1' }}>
            {searchTerm || filterModel !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Start generating music to build your library'}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px' 
        }}>
          {filteredAndSortedTracks.map((track) => (
            <div key={track.id} style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ 
                  color: '#f1f5f9', 
                  marginBottom: '8px', 
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {track.title}
                </h3>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '14px', 
                  lineHeight: '1.4',
                  marginBottom: '10px'
                }}>
                  {track.prompt}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    background: getModelColor(track.model),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {track.model.replace('musicgen-', '').toUpperCase()}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {track.duration}s • {formatFileSize(track.file_size)}
                  </span>
                </div>

                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  {formatDate(track.created_at)}
                </p>
              </div>

              {/* Audio Player */}
              <div style={{ marginBottom: '15px' }}>
                <audio 
                  controls 
                  style={{ width: '100%' }}
                  onPlay={() => setCurrentlyPlaying(track.id)}
                  onPause={() => setCurrentlyPlaying(null)}
                >
                  <source src={track.audio_url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={track.audio_url}
                  download={`${track.title}.wav`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Download
                </a>
                <button
                  onClick={() => deleteTrack(track.id)}
                  style={{
                    padding: '8px 12px',
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;