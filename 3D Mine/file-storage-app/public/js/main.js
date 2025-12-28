document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const uploadProgress = document.getElementById('upload-progress');
    const progressContainer = document.querySelector('.progress-container');
    const filesContainer = document.getElementById('files-container');
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Modal Elements
    const fileModal = document.getElementById('file-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalContent = document.getElementById('modal-content');
    const downloadBtn = document.getElementById('download-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const closeModal = document.querySelector('.close');
    
    // API Base URL
    // Default to relative '/api' so it works when the frontend is served by the backend.
    // But when using Live Server (commonly on port 5500) or opening the file directly,
    // the frontend origin won't match the backend. In that case fallback to the
    // backend running on localhost (port from .env, default 3001).
    const FALLBACK_BACKEND = 'http://localhost:3001';
    let API_URL = '/api';

    try {
        const origin = window.location.origin;
        // If served from file:// or from Live Server default port 5500, use fallback
        if (!origin || origin === 'null' || origin.startsWith('file:') || origin.includes(':5500')) {
            API_URL = FALLBACK_BACKEND + '/api';
        }
    } catch (e) {
        API_URL = FALLBACK_BACKEND + '/api';
    }
    
    // Current file data
    let currentFile = null;

    // Load files on page load
    loadFiles();

    // Event Listeners
    uploadForm.addEventListener('submit', handleFileUpload);
    searchBtn.addEventListener('click', () => searchFiles(searchInput.value));
    refreshBtn.addEventListener('click', loadFiles);
    closeModal.addEventListener('click', () => fileModal.style.display = 'none');
    downloadBtn.addEventListener('click', downloadCurrentFile);
    deleteBtn.addEventListener('click', deleteCurrentFile);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === fileModal) {
            fileModal.style.display = 'none';
        }
    });

    // File Upload Handler
    async function handleFileUpload(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('file');
        const titleInput = document.getElementById('title');
        const descriptionInput = document.getElementById('description');
        
        if (!fileInput.files[0]) {
            showStatus('Please select a file to upload', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('title', titleInput.value);
        formData.append('description', descriptionInput.value);
        
        try {
            // Show progress bar
            progressContainer.style.display = 'block';
            uploadProgress.style.width = '0%';
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload`, true);
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    uploadProgress.style.width = `${percentComplete}%`;
                }
            };
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    showStatus('File uploaded successfully', 'success');
                    uploadForm.reset();
                    loadFiles();
                } else {
                    showStatus('Error uploading file: ' + xhr.statusText, 'error');
                }
                progressContainer.style.display = 'none';
            };
            
            xhr.onerror = function() {
                showStatus('Network error occurred', 'error');
                progressContainer.style.display = 'none';
            };
            
            xhr.send(formData);
        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
            progressContainer.style.display = 'none';
        }
    }
    
    // Load All Files
    async function loadFiles() {
        filesContainer.innerHTML = '<div class="loading">Loading files...</div>';
        
        try {
            const response = await fetch(`${API_URL}/files`);
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            
            const data = await response.json();
            
            if (data.files.length === 0) {
                filesContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No files found</p>
                        <p>Upload a file to get started</p>
                    </div>
                `;
                return;
            }
            
            renderFiles(data.files);
        } catch (error) {
            filesContainer.innerHTML = `
                <div class="empty-state">
                    <p>Error: ${error.message}</p>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
    
    // Search Files
    async function searchFiles(query) {
        if (!query.trim()) {
            loadFiles();
            return;
        }
        
        filesContainer.innerHTML = '<div class="loading">Searching files...</div>';
        
        try {
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to search files');
            }
            
            const data = await response.json();
            
            if (data.files.length === 0) {
                filesContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No matching files found</p>
                        <p>Try a different search term</p>
                    </div>
                `;
                return;
            }
            
            renderFiles(data.files);
        } catch (error) {
            filesContainer.innerHTML = `
                <div class="empty-state">
                    <p>Error: ${error.message}</p>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
    
    // Render Files to UI
    function renderFiles(files) {
        filesContainer.innerHTML = '';
        
        files.forEach(file => {
            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            fileCard.innerHTML = `
                <h3>${file.title}</h3>
                <p>${file.description || 'No description'}</p>
                <div class="file-info">
                    <span>${formatFileSize(file.size)}</span>
                    <span>${formatDate(file.uploadedAt)}</span>
                </div>
            `;
            
            fileCard.addEventListener('click', () => openFileModal(file));
            filesContainer.appendChild(fileCard);
        });
    }
    
    // Open File Modal
    function openFileModal(file) {
        currentFile = file;
        modalTitle.textContent = file.title;
        modalDescription.textContent = file.description || 'No description';
        
        // Clear previous content
        modalContent.innerHTML = '<div class="loading">Loading preview...</div>';
        
        // Display modal
        fileModal.style.display = 'block';
        
        // Check file type and load preview
        const fileExtension = file.originalName.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
            // Image preview
            const img = document.createElement('img');
            img.onload = () => {
                modalContent.innerHTML = '';
                modalContent.appendChild(img);
            };
            img.onerror = () => {
                modalContent.innerHTML = '<p>Error loading image preview</p>';
            };
            img.src = `${API_URL}/files/${file._id}/download`;
        } else if (['pdf'].includes(fileExtension)) {
            // PDF preview (iframe)
            modalContent.innerHTML = `
                <iframe src="${API_URL}/files/${file._id}/download" width="100%" height="400px"></iframe>
            `;
        } else if (['txt', 'csv', 'md', 'json'].includes(fileExtension)) {
            // Text preview
            fetch(`${API_URL}/files/${file._id}/download`)
                .then(response => response.text())
                .then(text => {
                    modalContent.innerHTML = `<pre>${text}</pre>`;
                })
                .catch(error => {
                    modalContent.innerHTML = `<p>Error loading text preview: ${error.message}</p>`;
                });
        } else {
            // No preview available
            modalContent.innerHTML = `
                <div class="empty-state">
                    <p>No preview available for this file type</p>
                    <p>Click the download button to view the file</p>
                </div>
            `;
        }
    }
    
    // Download Current File
    function downloadCurrentFile() {
        if (!currentFile) return;
        
        window.location.href = `${API_URL}/files/${currentFile._id}/download`;
    }
    
    // Delete Current File
    async function deleteCurrentFile() {
        if (!currentFile || !confirm('Are you sure you want to delete this file?')) return;
        
        try {
            const response = await fetch(`${API_URL}/files/${currentFile._id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete file');
            }
            
            fileModal.style.display = 'none';
            showStatus('File deleted successfully', 'success');
            loadFiles();
        } catch (error) {
            showStatus(`Error deleting file: ${error.message}`, 'error');
        }
    }
    
    // Helper Functions
    function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `status ${type}`;
        setTimeout(() => {
            uploadStatus.className = 'status';
        }, 5000);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
});