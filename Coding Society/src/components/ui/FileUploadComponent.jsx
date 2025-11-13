import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2,
  File,
  Camera,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import uploadService from '../../services/uploadService';
import { useNotifications } from '../../context/NotificationContext';

const FileUploadComponent = ({
  type = 'image', // 'image', 'video', 'pdf', 'mixed'
  multiple = false,
  maxFiles = 5,
  onUploadComplete,
  onUploadProgress,
  className = '',
  disabled = false,
  children
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addNotification } = useNotifications();

  // File type configurations
  const fileTypeConfigs = {
    image: {
      accept: 'image/*',
      icon: Image,
      label: 'Images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    video: {
      accept: 'video/*',
      icon: Video,
      label: 'Videos',
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    },
    pdf: {
      accept: '.pdf',
      icon: FileText,
      label: 'PDF Files',
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['application/pdf']
    },
    mixed: {
      accept: '*',
      icon: File,
      label: 'Files',
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: []
    }
  };

  const config = fileTypeConfigs[type] || fileTypeConfigs.mixed;
  const IconComponent = config.icon;

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    
    // Validate file count
    if (!multiple && fileList.length > 1) {
      addNotification('error', 'Only one file allowed');
      return;
    }
    
    if (files.length + fileList.length > maxFiles) {
      addNotification('error', `Maximum ${maxFiles} files allowed`);
      return;
    }

    // Process and validate files
    const processedFiles = fileList.map((file, index) => {
      const fileInfo = uploadService.getFileInfo(file);
      
      // Validate file type
      if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(file.type)) {
        return {
          ...fileInfo,
          file,
          id: Date.now() + index,
          status: 'error',
          error: `Invalid file type. Expected: ${config.label.toLowerCase()}`
        };
      }

      // Validate file size
      if (file.size > config.maxSize) {
        return {
          ...fileInfo,
          file,
          id: Date.now() + index,
          status: 'error',
          error: `File too large. Max size: ${uploadService.formatFileSize(config.maxSize)}`
        };
      }

      return {
        ...fileInfo,
        file,
        id: Date.now() + index,
        status: 'ready',
        progress: 0,
        preview: null
      };
    });

    // Generate previews for images
    processedFiles.forEach(async (fileObj) => {
      if (fileObj.type.startsWith('image/') && fileObj.status === 'ready') {
        try {
          const preview = await uploadService.createFilePreview(fileObj.file);
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, preview } : f
          ));
        } catch (error) {
          console.warn('Failed to generate preview:', error);
        }
      }
    });

    setFiles(prev => [...prev, ...processedFiles]);
  }, [files, multiple, maxFiles, config, addNotification]);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles?.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect, disabled]);

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Upload files
  const handleUpload = useCallback(async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    
    if (readyFiles.length === 0) {
      addNotification('warning', 'No files ready for upload');
      return;
    }

    setUploading(true);

    try {
      for (const fileObj of readyFiles) {
        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const onProgress = (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, progress } : f
          ));
          onUploadProgress?.(fileObj.id, progress);
        };

        let result;
        
        // Choose upload method based on type
        switch (type) {
          case 'image':
            result = await uploadService.uploadFeedImage(fileObj.file, onProgress);
            break;
          case 'video':
            result = await uploadService.uploadFeedVideo(fileObj.file, onProgress);
            break;
          case 'pdf':
            result = await uploadService.uploadLibraryPDF(fileObj.file, onProgress);
            break;
          default:
            throw new Error('Unsupported upload type');
        }

        // Update file status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'completed', 
            progress: 100,
            url: result.files?.[0]?.url || result.url,
            result
          } : f
        ));

        addNotification('success', `${fileObj.name} uploaded successfully`);
      }

      // Call completion callback with results
      const completedFiles = files
        .filter(f => f.status === 'completed')
        .map(f => ({ ...f.result, originalFile: f }));
      
      onUploadComplete?.(completedFiles);

    } catch (error) {
      console.error('Upload error:', error);
      addNotification('error', `Upload failed: ${error.message}`);
      
      // Update failed files
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error', error: error.message } : f
      ));
    } finally {
      setUploading(false);
    }
  }, [files, type, onUploadComplete, onUploadProgress, addNotification]);

  // File input click handler
  const handleFileInputClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const renderFilePreview = (fileObj) => {
    const getStatusColor = () => {
      switch (fileObj.status) {
        case 'ready': return 'border-blue-200 bg-blue-50';
        case 'uploading': return 'border-yellow-200 bg-yellow-50';
        case 'completed': return 'border-green-200 bg-green-50';
        case 'error': return 'border-red-200 bg-red-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    };

    const getStatusIcon = () => {
      switch (fileObj.status) {
        case 'uploading': return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'completed': return <Check className="h-4 w-4 text-green-500" />;
        case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
        default: return <IconComponent className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <motion.div
        key={fileObj.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative p-3 rounded-lg border ${getStatusColor()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {fileObj.preview ? (
              <img 
                src={fileObj.preview} 
                alt={fileObj.name}
                className="h-10 w-10 object-cover rounded"
              />
            ) : (
              <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileObj.name}
              </p>
              <p className="text-xs text-gray-500">
                {fileObj.formattedSize}
                {fileObj.status === 'uploading' && ` • ${fileObj.progress}%`}
                {fileObj.error && ` • ${fileObj.error}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-2">
            {getStatusIcon()}
            {fileObj.status !== 'uploading' && fileObj.status !== 'completed' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFile(fileObj.id)}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {fileObj.status === 'uploading' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${fileObj.progress}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleFileInputClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-3">
          <div className="mx-auto h-12 w-12 text-gray-400">
            {dragActive ? (
              <Upload className="h-12 w-12" />
            ) : (
              <IconComponent className="h-12 w-12" />
            )}
          </div>
          
          {children || (
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? `Drop ${config.label.toLowerCase()} here` : `Upload ${config.label}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select {multiple ? 'files' : 'a file'}
                <br />
                Max size: {uploadService.formatFileSize(config.maxSize)}
                {multiple && ` • Max ${maxFiles} files`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map(renderFilePreview)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {files.some(f => f.status === 'ready') && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={uploading || disabled}
            className="min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.filter(f => f.status === 'ready').length} file{files.filter(f => f.status === 'ready').length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;