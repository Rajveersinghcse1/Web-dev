import React, { useState } from 'react';
import { useMode } from '../context/ModeContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Share2, 
  Link, 
  Download, 
  Upload, 
  Copy, 
  Save,
  FileText,
  Globe,
  Lock,
  Eye,
  Clock,
  User,
  Code,
  X
} from 'lucide-react';

const CodeSharingModal = ({ 
  isOpen, 
  onClose, 
  code, 
  language, 
  title = 'Untitled Code'
}) => {
  const { mode } = useMode();
  const { success, error, info } = useNotifications();
  const [shareSettings, setShareSettings] = useState({
    title: title,
    description: '',
    visibility: 'public', // public, private, unlisted
    allowComments: true,
    allowDownload: true,
    expiresAt: '' // Optional expiration
  });
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareId, setShareId] = useState('');

  if (!isOpen) return null;

  // Generate a mock share URL (in real app, this would be a backend call)
  const generateShareUrl = async () => {
    setIsSharing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockShareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockUrl = `https://codingbuddy.dev/share/${mockShareId}`;
      
      setShareId(mockShareId);
      setShareUrl(mockUrl);
      
      // Save to localStorage for demo purposes
      const shareData = {
        id: mockShareId,
        title: shareSettings.title,
        description: shareSettings.description,
        code: code,
        language: language,
        visibility: shareSettings.visibility,
        allowComments: shareSettings.allowComments,
        allowDownload: shareSettings.allowDownload,
        createdAt: new Date().toISOString(),
        expiresAt: shareSettings.expiresAt || null
      };
      
      const existingShares = JSON.parse(localStorage.getItem('shared-codes') || '[]');
      existingShares.push(shareData);
      localStorage.setItem('shared-codes', JSON.stringify(existingShares));
      
      success('Code shared successfully!', {
        title: 'Share Created',
        duration: 3000
      });
      
    } catch (err) {
      error('Failed to create share link', {
        title: 'Share Failed',
        details: err.message
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      success('Share URL copied to clipboard', {
        title: 'Copied',
        duration: 2000
      });
    } catch (err) {
      error('Failed to copy URL', {
        title: 'Copy Failed'
      });
    }
  };

  const downloadAsFile = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shareSettings.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${language}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      success('File downloaded successfully', {
        title: 'Download Complete'
      });
    } catch (err) {
      error('Failed to download file', {
        title: 'Download Failed'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-2xl w-full mx-4 rounded-lg ${
        mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Share Your Code
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                mode === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!shareUrl ? (
            /* Share Settings */
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={shareSettings.title}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      mode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Give your code a title..."
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={shareSettings.description}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      mode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={3}
                    placeholder="Describe what your code does..."
                  />
                </div>
              </div>

              {/* Visibility Settings */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Visibility
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'public', icon: Globe, label: 'Public', desc: 'Anyone can find and view this code' },
                    { value: 'unlisted', icon: Link, label: 'Unlisted', desc: 'Only people with the link can view' },
                    { value: 'private', icon: Lock, label: 'Private', desc: 'Only you can view this code' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        shareSettings.visibility === option.value
                          ? mode === 'dark' 
                            ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                            : 'border-blue-500 bg-blue-50'
                          : mode === 'dark'
                            ? 'border-gray-700 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={shareSettings.visibility === option.value}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, visibility: e.target.value }))}
                        className="mt-1"
                      />
                      <option.icon className={`h-5 w-5 mt-0.5 ${
                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <div>
                        <div className={`font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </div>
                        <div className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${
                  mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Additional Options
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={shareSettings.allowComments}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={`text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Allow comments
                  </span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={shareSettings.allowDownload}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                    className="rounded"
                  />
                  <span className={`text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Allow downloads
                  </span>
                </label>
              </div>

              {/* Expiration */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Expiration (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={shareSettings.expiresAt}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    mode === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Code Preview */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Code Preview
                </label>
                <div className={`p-3 rounded-lg border ${
                  mode === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {language.toUpperCase()}
                    </span>
                    <span className={`text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {code.split('\n').length} lines
                    </span>
                  </div>
                  <pre className={`text-sm font-mono overflow-auto max-h-32 ${
                    mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {code.slice(0, 200)}{code.length > 200 ? '...' : ''}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={generateShareUrl}
                  disabled={isSharing || !shareSettings.title.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isSharing ? 'Creating...' : 'Create Share Link'}
                </Button>
              </div>
            </div>
          ) : (
            /* Share Result */
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  mode === 'dark' ? 'bg-green-900' : 'bg-green-100'
                }`}>
                  <Share2 className={`h-8 w-8 ${
                    mode === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Code Shared Successfully!
                </h3>
                <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your code is now available at the link below
                </p>
              </div>

              {/* Share URL */}
              <div className={`p-4 rounded-lg border ${
                mode === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${
                  mode === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Share URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className={`flex-1 px-3 py-2 rounded border ${
                      mode === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-gray-300' 
                        : 'bg-white border-gray-300 text-gray-700'
                    } text-sm font-mono`}
                  />
                  <Button onClick={copyShareUrl} size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Share Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${
                  mode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className={`text-xs uppercase tracking-wide font-medium mb-1 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Visibility
                  </div>
                  <div className={`text-sm font-medium ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {shareSettings.visibility.charAt(0).toUpperCase() + shareSettings.visibility.slice(1)}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  mode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className={`text-xs uppercase tracking-wide font-medium mb-1 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Share ID
                  </div>
                  <div className={`text-sm font-mono ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {shareId}
                  </div>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="flex justify-between items-center pt-4">
                <Button onClick={downloadAsFile} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
                <div className="space-x-2">
                  <Button onClick={() => {
                    setShareUrl('');
                    setShareId('');
                  }} variant="outline">
                    Share Another
                  </Button>
                  <Button onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeSharingModal;