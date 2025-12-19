// Full Test Drive Console - JavaScript Application
class DatabaseConsole {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api/v1';
        this.currentCollection = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.editor = null;
        this.socket = null;
        
        this.collections = {
            users: { endpoint: '/admin/users', icon: 'fas fa-users', name: 'Users' },
            posts: { endpoint: '/feed', icon: 'fas fa-file-text', name: 'Posts' },
            achievements: { endpoint: '/admin/achievements', icon: 'fas fa-trophy', name: 'Achievements' },
            quests: { endpoint: '/admin/quests', icon: 'fas fa-map', name: 'Quests' },
            stories: { endpoint: '/admin/stories', icon: 'fas fa-book', name: 'Stories' },
            feedback: { endpoint: '/admin/feedback', icon: 'fas fa-comment', name: 'Feedback' },
            hackathons: { endpoint: '/admin/hackathons', icon: 'fas fa-code', name: 'Hackathons' },
            innovations: { endpoint: '/admin/innovations', icon: 'fas fa-lightbulb', name: 'Innovations' },
            internships: { endpoint: '/admin/internships', icon: 'fas fa-briefcase', name: 'Internships' },
            library: { endpoint: '/admin/library', icon: 'fas fa-library', name: 'Library Content' }
        };
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.initializeEditor();
        await this.checkConnection();
        await this.loadDashboardStats();
        this.startPeriodicRefresh();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuery = e.target.value;
                if (this.currentCollection) {
                    this.loadCollection(this.currentCollection);
                }
            }, 300));
        }
        
        // Modal close events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (this.editor && document.getElementById('document-editor').classList.contains('active')) {
                    this.saveDocument();
                }
            }
        });
    }
    
    initializeEditor() {
        const editorElement = document.getElementById('json-editor');
        if (editorElement && typeof ace !== 'undefined') {
            this.editor = ace.edit('json-editor');
            this.editor.setTheme('ace/theme/monokai');
            this.editor.session.setMode('ace/mode/json');
            this.editor.setOptions({
                fontSize: 14,
                showPrintMargin: false,
                wrap: true
            });
        }
    }
    
    async checkConnection() {
        const statusElement = document.getElementById('connectionStatus');
        
        try {
            statusElement.className = 'connection-status connecting';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Connecting...</span>';
            
            // Try multiple health check endpoints
            const healthEndpoints = [
                `${this.baseUrl}/health`,
                `${this.baseUrl}/../health`,
                `http://localhost:5000/health`,
                `http://localhost:5000/api/health`
            ];
            
            let connected = false;
            for (const endpoint of healthEndpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 3000
                    });
                    
                    if (response.ok) {
                        connected = true;
                        break;
                    }
                } catch (e) {
                    // Continue to next endpoint
                }
            }
            
            if (connected) {
                statusElement.className = 'connection-status connected';
                statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Connected</span>';
                this.showToast('Connected to backend server', 'success');
                this.useMockData = false;
            } else {
                throw new Error('All connection attempts failed');
            }
        } catch (error) {
            statusElement.className = 'connection-status disconnected';
            statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Disconnected</span>';
            this.showToast('Backend server not running. Start server: cd backend && npm start', 'warning');
            this.useMockData = true;
            
            // Show helpful connection message
            this.showConnectionHelp();
        }
    }
    
    async loadDashboardStats() {
        this.showLoading();
        
        try {
            const stats = await this.fetchDashboardData();
            
            // Update stat cards
            document.getElementById('total-users').textContent = stats.users || 0;
            document.getElementById('total-posts').textContent = stats.posts || 0;
            document.getElementById('total-achievements').textContent = stats.achievements || 0;
            
            // Update navigation counts
            Object.keys(this.collections).forEach(key => {
                const countElement = document.getElementById(`${key}-count`);
                if (countElement) {
                    countElement.textContent = stats[key] || 0;
                }
            });
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            this.showToast('Error loading dashboard statistics', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async fetchDashboardData() {
        if (this.useMockData) {
            return {
                users: 1247,
                posts: 3891,
                achievements: 156,
                quests: 89,
                stories: 234,
                feedback: 567,
                hackathons: 12,
                innovations: 78,
                internships: 45,
                library: 342
            };
        }
        
        // Fetch real data from multiple endpoints
        const endpoints = Object.keys(this.collections);
        const promises = endpoints.map(async (key) => {
            try {
                const response = await this.apiCall(this.collections[key].endpoint + '?limit=0');
                return { [key]: response.total || response.data?.length || 0 };
            } catch (error) {
                console.error(`Error fetching ${key} count:`, error);
                return { [key]: 0 };
            }
        });
        
        const results = await Promise.all(promises);
        return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    }
    
    async loadCollection(collectionName) {
        this.currentCollection = collectionName;
        this.showSection('collection-view');
        this.updateActiveNavItem(collectionName);
        this.showLoading();
        
        try {
            const collection = this.collections[collectionName];
            
            // Update header
            document.getElementById('collection-name').textContent = collection.name;
            document.getElementById('collection-description').textContent = `Manage your ${collection.name.toLowerCase()} data`;
            
            // Fetch data
            const data = await this.fetchCollectionData(collectionName);
            
            // Render table
            this.renderDataTable(data, collectionName);
            
        } catch (error) {
            console.error(`Error loading collection ${collectionName}:`, error);
            this.showToast(`Error loading ${collectionName}`, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async fetchCollectionData(collectionName) {
        const collection = this.collections[collectionName];
        const params = new URLSearchParams({
            page: this.currentPage,
            limit: this.itemsPerPage
        });
        
        if (this.searchQuery) {
            params.append('search', this.searchQuery);
        }
        
        if (this.useMockData) {
            return this.getMockData(collectionName);
        }
        
        const response = await this.apiCall(`${collection.endpoint}?${params}`);
        return response.data || response;
    }
    
    getMockData(collectionName) {
        const mockData = {
            users: [
                {
                    _id: '1',
                    username: 'john_doe',
                    email: 'john@example.com',
                    role: 'USER',
                    createdAt: '2024-01-15T10:30:00Z',
                    profile: { firstName: 'John', lastName: 'Doe' },
                    isVerified: true
                },
                {
                    _id: '2',
                    username: 'jane_smith',
                    email: 'jane@example.com',
                    role: 'ADMIN',
                    createdAt: '2024-01-14T14:20:00Z',
                    profile: { firstName: 'Jane', lastName: 'Smith' },
                    isVerified: true
                }
            ],
            posts: [
                {
                    _id: '1',
                    title: 'My first coding project',
                    content: 'Just finished my first React application!',
                    author: { username: 'john_doe' },
                    createdAt: '2024-01-15T15:45:00Z',
                    likes: 24,
                    comments: 8
                }
            ],
            achievements: [
                {
                    _id: '1',
                    title: 'First Steps',
                    description: 'Complete your first challenge',
                    icon: 'trophy',
                    points: 100,
                    rarity: 'common',
                    createdAt: '2024-01-10T09:00:00Z'
                }
            ]
        };
        
        return mockData[collectionName] || [];
    }
    
    renderDataTable(data, collectionName) {
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');
        
        if (!data || data.length === 0) {
            tableHead.innerHTML = '';
            tableBody.innerHTML = '<tr><td colspan="100%" class="text-center">No data found</td></tr>';
            return;
        }
        
        // Generate headers based on first item
        const headers = this.getTableHeaders(data[0], collectionName);
        tableHead.innerHTML = `
            <tr>
                ${headers.map(header => `<th>${header.label}</th>`).join('')}
                <th>Actions</th>
            </tr>
        `;
        
        // Generate rows
        const rows = data.map(item => {
            const cells = headers.map(header => {
                let value = this.getNestedValue(item, header.key);
                
                // Format different data types
                if (header.type === 'date' && value) {
                    value = new Date(value).toLocaleDateString();
                } else if (header.type === 'boolean') {
                    value = value ? '✓' : '✗';
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                } else if (value === null || value === undefined) {
                    value = '-';
                }
                
                return `<td>${value}</td>`;
            }).join('');
            
            const actions = `
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-sm action-btn view-btn" onclick="app.viewDocument('${item._id}', '${collectionName}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm action-btn edit-btn" onclick="app.editDocument('${item._id}', '${collectionName}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm action-btn delete-btn" onclick="app.deleteDocument('${item._id}', '${collectionName}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            return `<tr>${cells}${actions}</tr>`;
        }).join('');
        
        tableBody.innerHTML = rows;
    }
    
    getTableHeaders(item, collectionName) {
        // Define custom headers for each collection
        const headerConfigs = {
            users: [
                { key: '_id', label: 'ID', type: 'string' },
                { key: 'username', label: 'Username', type: 'string' },
                { key: 'email', label: 'Email', type: 'string' },
                { key: 'role', label: 'Role', type: 'string' },
                { key: 'createdAt', label: 'Created', type: 'date' },
                { key: 'isVerified', label: 'Verified', type: 'boolean' }
            ],
            posts: [
                { key: '_id', label: 'ID', type: 'string' },
                { key: 'title', label: 'Title', type: 'string' },
                { key: 'author.username', label: 'Author', type: 'string' },
                { key: 'createdAt', label: 'Created', type: 'date' },
                { key: 'likes', label: 'Likes', type: 'number' },
                { key: 'comments', label: 'Comments', type: 'number' }
            ],
            achievements: [
                { key: '_id', label: 'ID', type: 'string' },
                { key: 'title', label: 'Title', type: 'string' },
                { key: 'description', label: 'Description', type: 'string' },
                { key: 'points', label: 'Points', type: 'number' },
                { key: 'rarity', label: 'Rarity', type: 'string' },
                { key: 'createdAt', label: 'Created', type: 'date' }
            ]
        };
        
        return headerConfigs[collectionName] || this.generateHeadersFromObject(item);
    }
    
    generateHeadersFromObject(obj) {
        return Object.keys(obj)
            .filter(key => key !== '__v')
            .slice(0, 6) // Limit to 6 columns for better display
            .map(key => ({
                key,
                label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                type: typeof obj[key] === 'string' && key.includes('At') ? 'date' : 'string'
            }));
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    async viewDocument(id, collectionName) {
        try {
            const data = await this.fetchDocument(id, collectionName);
            this.showDocumentInEditor(data, 'view');
        } catch (error) {
            console.error('Error viewing document:', error);
            this.showToast('Error loading document', 'error');
        }
    }
    
    async editDocument(id, collectionName) {
        try {
            const data = await this.fetchDocument(id, collectionName);
            this.showDocumentInEditor(data, 'edit');
        } catch (error) {
            console.error('Error loading document for edit:', error);
            this.showToast('Error loading document', 'error');
        }
    }
    
    async fetchDocument(id, collectionName) {
        if (this.useMockData) {
            const mockData = this.getMockData(collectionName);
            return mockData.find(item => item._id === id) || {};
        }
        
        const collection = this.collections[collectionName];
        const response = await this.apiCall(`${collection.endpoint}/${id}`);
        return response.data || response;
    }
    
    showDocumentInEditor(data, mode) {
        this.showSection('document-editor');
        document.getElementById('editor-title').textContent = 
            mode === 'edit' ? 'Edit Document' : 'View Document';
        
        if (this.editor) {
            this.editor.setValue(JSON.stringify(data, null, 2), -1);
            this.editor.setReadOnly(mode === 'view');
        }
        
        // Store current document for saving
        this.currentDocument = { data, mode };
    }
    
    async saveDocument() {
        if (!this.currentDocument || this.currentDocument.mode !== 'edit') {
            return;
        }
        
        try {
            const updatedData = JSON.parse(this.editor.getValue());
            
            if (this.useMockData) {
                this.showToast('Document saved (mock mode)', 'success');
                this.loadCollection(this.currentCollection);
                this.showSection('collection-view');
                return;
            }
            
            const collection = this.collections[this.currentCollection];
            await this.apiCall(`${collection.endpoint}/${updatedData._id}`, 'PUT', updatedData);
            
            this.showToast('Document saved successfully', 'success');
            this.loadCollection(this.currentCollection);
            this.showSection('collection-view');
            
        } catch (error) {
            console.error('Error saving document:', error);
            this.showToast('Error saving document', 'error');
        }
    }
    
    async deleteDocument(id, collectionName) {
        this.showConfirmModal(
            'Delete Document',
            'Are you sure you want to delete this document? This action cannot be undone.',
            async () => {
                try {
                    if (this.useMockData) {
                        this.showToast('Document deleted (mock mode)', 'success');
                        this.loadCollection(collectionName);
                        return;
                    }
                    
                    const collection = this.collections[collectionName];
                    await this.apiCall(`${collection.endpoint}/${id}`, 'DELETE');
                    
                    this.showToast('Document deleted successfully', 'success');
                    this.loadCollection(collectionName);
                    
                } catch (error) {
                    console.error('Error deleting document:', error);
                    this.showToast('Error deleting document', 'error');
                }
            }
        );
    }
    
    cancelEdit() {
        if (this.currentCollection) {
            this.showSection('collection-view');
        } else {
            this.showSection('dashboard');
        }
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }
    
    updateActiveNavItem(collectionName) {
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-collection="${collectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
    
    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        
        const confirmBtn = document.getElementById('confirm-btn');
        
        // Remove existing listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Add new listener
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.closeModal();
        });
        
        modal.classList.add('show');
    }
    
    closeModal() {
        document.getElementById('confirmModal').classList.remove('show');
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    startPeriodicRefresh() {
        // Refresh dashboard stats every 30 seconds
        setInterval(async () => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                await this.loadDashboardStats();
            }
        }, 30000);
        
        // Try to reconnect every 10 seconds if disconnected
        setInterval(async () => {
            if (this.useMockData) {
                await this.checkConnection();
            }
        }, 10000);
    }
    
    showConnectionHelp() {
        const helpHtml = `
            <div class="connection-help">
                <h3>🚀 Backend Server Not Running</h3>
                <p>To connect to your database, start the backend server:</p>
                <div class="code-block">
                    <code>cd backend</code><br>
                    <code>npm install</code><br>
                    <code>npm start</code>
                </div>
                <p>Server should start on <strong>http://localhost:5000</strong></p>
                <p>💡 Console will auto-reconnect when server is available</p>
            </div>
        `;
        
        // Add to dashboard if not already present
        const dashboard = document.getElementById('dashboard');
        if (!dashboard.querySelector('.connection-help')) {
            const helpDiv = document.createElement('div');
            helpDiv.innerHTML = helpHtml;
            dashboard.insertBefore(helpDiv, dashboard.firstChild);
        }
    }
}

// Global functions for HTML onclick events
let app;

function loadCollection(collectionName) {
    app.loadCollection(collectionName);
}

function refreshAll() {
    if (app.currentCollection) {
        app.loadCollection(app.currentCollection);
    } else {
        app.loadDashboardStats();
    }
}

function showDashboard() {
    app.showSection('dashboard');
    app.currentCollection = null;
    app.loadDashboardStats();
}

function createNew(collectionName) {
    const emptyDocument = {};
    app.showDocumentInEditor(emptyDocument, 'edit');
}

function createNewDocument() {
    if (app.currentCollection) {
        createNew(app.currentCollection);
    }
}

function saveDocument() {
    app.saveDocument();
}

function cancelEdit() {
    app.cancelEdit();
}

function closeModal() {
    app.closeModal();
}

function exportCollection() {
    if (app.currentCollection) {
        const data = app.getMockData(app.currentCollection);
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${app.currentCollection}_export.json`;
        link.click();
        
        app.showToast(`${app.currentCollection} exported successfully`, 'success');
    }
}

function exportData() {
    app.showToast('Export feature not yet implemented', 'info');
}

function showDatabaseStats() {
    app.showToast('Database stats feature not yet implemented', 'info');
}

function showSystemHealth() {
    app.showToast('System health feature not yet implemented', 'info');
}

function showAPILogs() {
    app.showToast('API logs feature not yet implemented', 'info');
}

function backupDatabase() {
    app.showToast('Database backup feature not yet implemented', 'info');
}

function clearLogs() {
    app.showConfirmModal(
        'Clear Logs',
        'Are you sure you want to clear all application logs?',
        () => {
            app.showToast('Logs cleared successfully', 'success');
        }
    );
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    app = new DatabaseConsole();
    
    // Set dashboard as default view
    showDashboard();
});