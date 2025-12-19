// Enhanced Coding Society Console - Ultra Advanced Edition
class EnhancedDatabaseConsole {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api/v1';
        this.currentCollection = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.editor = null;
        this.socket = null;
        this.chartInstance = null;
        
        // Enhanced collections with form schemas
        this.collections = {
            users: { 
                endpoint: '/admin/users', 
                icon: 'fas fa-users', 
                name: 'Users',
                schema: this.getUserSchema()
            },
            posts: { 
                endpoint: '/feed', 
                icon: 'fas fa-file-text', 
                name: 'Posts',
                schema: this.getPostSchema()
            },
            achievements: { 
                endpoint: '/admin/achievements', 
                icon: 'fas fa-trophy', 
                name: 'Achievements',
                schema: this.getAchievementSchema()
            },
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
        this.initializeChart();
        this.startPeriodicRefresh();
        this.setupRealTimeUpdates();
        
        this.showNotification('🚀 Console initialized successfully!', 'success');
    }

    // Form Schemas for Smart Forms
    getUserSchema() {
        return [
            { name: 'username', label: 'Username', type: 'text', required: true, placeholder: 'Enter unique username' },
            { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
            { name: 'password', label: 'Password', type: 'password', required: true, placeholder: 'Minimum 6 characters' },
            { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'John', group: 'profile' },
            { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe', group: 'profile' },
            { name: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell us about yourself...', group: 'profile' },
            { 
                name: 'role', 
                label: 'Role', 
                type: 'select', 
                options: [
                    { value: 'USER', label: 'User' },
                    { value: 'MODERATOR', label: 'Moderator' },
                    { value: 'ADMIN', label: 'Admin' }
                ],
                default: 'USER'
            },
            { 
                name: 'experience', 
                label: 'Experience Level', 
                type: 'select',
                group: 'profile',
                options: [
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                    { value: 'expert', label: 'Expert' }
                ],
                default: 'beginner'
            },
            { name: 'skills', label: 'Skills (comma-separated)', type: 'text', placeholder: 'JavaScript, React, Node.js', group: 'profile' },
            { name: 'github', label: 'GitHub Username', type: 'text', placeholder: 'github-username', group: 'profile' },
            { name: 'linkedin', label: 'LinkedIn Profile', type: 'url', placeholder: 'https://linkedin.com/in/...', group: 'profile' },
            { name: 'isVerified', label: 'Verified Account', type: 'checkbox', default: false }
        ];
    }

    getPostSchema() {
        return [
            { name: 'title', label: 'Post Title', type: 'text', required: true, placeholder: 'Enter an engaging title' },
            { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Write your post content here...' },
            { 
                name: 'category', 
                label: 'Category', 
                type: 'select',
                options: [
                    { value: 'project', label: 'Project Showcase' },
                    { value: 'tutorial', label: 'Tutorial' },
                    { value: 'question', label: 'Question' },
                    { value: 'discussion', label: 'Discussion' },
                    { value: 'showcase', label: 'Showcase' },
                    { value: 'news', label: 'News' },
                    { value: 'job', label: 'Job Posting' }
                ],
                default: 'discussion'
            },
            { name: 'tags', label: 'Tags (comma-separated)', type: 'text', placeholder: 'javascript, react, tutorial' },
            { 
                name: 'difficulty', 
                label: 'Difficulty Level', 
                type: 'select',
                options: [
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                ],
                default: 'beginner'
            },
            { name: 'featured', label: 'Featured Post', type: 'checkbox', default: false },
            { name: 'pinned', label: 'Pinned Post', type: 'checkbox', default: false }
        ];
    }

    getAchievementSchema() {
        return [
            { name: 'title', label: 'Achievement Title', type: 'text', required: true, placeholder: 'Enter achievement name' },
            { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe what this achievement represents' },
            { name: 'icon', label: 'Icon (FontAwesome)', type: 'text', placeholder: 'trophy, star, medal', default: 'trophy' },
            { 
                name: 'category', 
                label: 'Category', 
                type: 'select',
                options: [
                    { value: 'milestone', label: 'Milestone' },
                    { value: 'coding', label: 'Coding' },
                    { value: 'community', label: 'Community' },
                    { value: 'learning', label: 'Learning' },
                    { value: 'special', label: 'Special' }
                ],
                default: 'milestone'
            },
            { name: 'points', label: 'Points Reward', type: 'number', required: true, placeholder: '100', min: 0 },
            { 
                name: 'rarity', 
                label: 'Rarity', 
                type: 'select',
                options: [
                    { value: 'common', label: 'Common' },
                    { value: 'uncommon', label: 'Uncommon' },
                    { value: 'rare', label: 'Rare' },
                    { value: 'epic', label: 'Epic' },
                    { value: 'legendary', label: 'Legendary' }
                ],
                default: 'common'
            },
            { 
                name: 'requirementType', 
                label: 'Requirement Type', 
                type: 'select',
                options: [
                    { value: 'posts', label: 'Number of Posts' },
                    { value: 'likes', label: 'Likes Received' },
                    { value: 'comments', label: 'Comments Made' },
                    { value: 'streak', label: 'Activity Streak' },
                    { value: 'projects', label: 'Projects Created' }
                ],
                default: 'posts',
                group: 'requirements'
            },
            { name: 'requirementCount', label: 'Required Count', type: 'number', placeholder: '5', min: 1, group: 'requirements' },
            { name: 'isActive', label: 'Active Achievement', type: 'checkbox', default: true }
        ];
    }

    setupEventListeners() {
        // Enhanced search with debouncing
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuery = e.target.value;
                if (this.currentCollection) {
                    this.loadCollection(this.currentCollection);
                }
            }, 300));
        }

        // Filter changes
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                if (this.currentCollection) {
                    this.loadCollection(this.currentCollection);
                }
            });
        }

        // Modal close events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-enhanced')) {
                this.closeAllModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (document.getElementById('document-editor').classList.contains('active')) {
                    this.saveDocument();
                }
            }
            
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-input').focus();
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
                fontSize: 16,
                showPrintMargin: false,
                wrap: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            });
        }
    }

    initializeChart() {
        const ctx = document.getElementById('activityChart');
        if (ctx && typeof Chart !== 'undefined') {
            this.chartInstance = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'User Activity',
                        data: [12, 19, 3, 5, 2, 3, 20],
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0,123,255,0.1)',
                        tension: 0.4
                    }, {
                        label: 'Posts Created',
                        data: [2, 5, 1, 3, 1, 2, 8],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40,167,69,0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: 'white' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: 'white' }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    }
                }
            });
        }
    }

    async checkConnection() {
        const statusElement = document.getElementById('connectionStatus');
        
        try {
            statusElement.innerHTML = '<span class="real-time-indicator"></span><span>Connecting...</span>';
            
            const healthEndpoints = [
                `${this.baseUrl}/health`,
                `http://localhost:5000/health`
            ];
            
            let connected = false;
            for (const endpoint of healthEndpoints) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 5000
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🔗 Backend Health:', data);
                        connected = true;
                        break;
                    }
                } catch (e) {
                    console.log('Connection attempt failed:', e.message);
                }
            }
            
            if (connected) {
                statusElement.innerHTML = '<span class="real-time-indicator"></span><span>Connected</span>';
                statusElement.className = 'connection-status connected';
                this.showNotification('✅ Connected to backend server', 'success');
                this.useMockData = false;
            } else {
                throw new Error('All connection attempts failed');
            }
        } catch (error) {
            statusElement.innerHTML = '<span style="color: #dc3545;">●</span><span>Disconnected</span>';
            statusElement.className = 'connection-status disconnected';
            this.showNotification('⚠️ Backend server not running. Using demo mode.', 'warning');
            this.useMockData = true;
            this.showConnectionHelp();
        }
    }

    // Smart Form Functions
    showSmartForm(type) {
        const modal = document.getElementById('smartFormModal');
        const formTitle = document.getElementById('form-title');
        const smartForm = document.getElementById('smartForm');
        
        const typeConfig = {
            user: { title: '👤 Add New User', icon: 'fa-user-plus' },
            post: { title: '📝 Create New Post', icon: 'fa-plus' },
            achievement: { title: '🏆 Create Achievement', icon: 'fa-trophy' }
        };
        
        const config = typeConfig[type] || typeConfig.user;
        formTitle.innerHTML = `<i class="fas ${config.icon}"></i> ${config.title}`;
        
        // Generate form based on schema
        const schema = this.collections[type + 's']?.schema || this.getUserSchema();
        const formHTML = this.generateSmartForm(schema, type);
        
        smartForm.innerHTML = formHTML + `
            <div class="form-actions" style="margin-top: 30px; text-align: center;">
                <button type="submit" class="smart-button" style="margin-right: 15px;">
                    <i class="fas fa-save"></i> Create ${type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
                <button type="button" class="smart-button" onclick="closeSmartForm()" style="background: #6c757d;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        `;
        
        // Setup form submission
        smartForm.onsubmit = (e) => this.handleSmartFormSubmit(e, type);
        
        modal.classList.add('show');
    }

    generateSmartForm(schema, type) {
        let formHTML = '';
        let currentGroup = null;
        
        schema.forEach(field => {
            // Group handling
            if (field.group && field.group !== currentGroup) {
                if (currentGroup) formHTML += '</div>';
                formHTML += `<div class="form-group-section">
                    <h4><i class="fas fa-cog"></i> ${field.group.charAt(0).toUpperCase() + field.group.slice(1)}</h4>`;
                currentGroup = field.group;
            }
            
            formHTML += '<div class="form-group">';
            formHTML += `<label class="form-label">${field.label}${field.required ? ' *' : ''}</label>`;
            
            switch (field.type) {
                case 'select':
                    formHTML += `<select class="form-select" name="${field.name}" ${field.required ? 'required' : ''}>`;
                    if (!field.required) formHTML += '<option value="">Choose...</option>';
                    field.options.forEach(option => {
                        const selected = field.default === option.value ? 'selected' : '';
                        formHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                    });
                    formHTML += '</select>';
                    break;
                    
                case 'textarea':
                    formHTML += `<textarea class="form-input form-textarea" name="${field.name}" 
                        placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
                    break;
                    
                case 'checkbox':
                    formHTML += `<label class="checkbox-label">
                        <input type="checkbox" name="${field.name}" ${field.default ? 'checked' : ''}>
                        <span class="checkmark"></span> ${field.label}
                    </label>`;
                    break;
                    
                default:
                    const inputType = field.type || 'text';
                    const min = field.min !== undefined ? `min="${field.min}"` : '';
                    const value = field.default ? `value="${field.default}"` : '';
                    formHTML += `<input class="form-input" type="${inputType}" name="${field.name}" 
                        placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} ${min} ${value}>`;
            }
            
            formHTML += '</div>';
        });
        
        if (currentGroup) formHTML += '</div>';
        
        return formHTML;
    }

    async handleSmartFormSubmit(event, type) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {};
        
        // Process form data
        for (let [key, value] of formData.entries()) {
            if (key.includes('.')) {
                // Handle nested objects (e.g., profile.firstName)
                const [parent, child] = key.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = value;
            } else {
                // Handle arrays (skills, tags)
                if (key === 'skills' || key === 'tags') {
                    data[key] = value.split(',').map(s => s.trim()).filter(s => s);
                } else if (key.startsWith('requirement')) {
                    // Handle achievement requirements
                    if (!data.requirements) data.requirements = {};
                    const reqKey = key.replace('requirement', '').toLowerCase();
                    data.requirements[reqKey] = reqKey === 'count' ? parseInt(value) : value;
                } else {
                    data[key] = value;
                }
            }
        }
        
        // Handle checkboxes (they don't appear in FormData if unchecked)
        const checkboxes = event.target.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if (!formData.has(cb.name)) {
                data[cb.name] = false;
            } else {
                data[cb.name] = true;
            }
        });

        console.log('📝 Form data prepared:', data);

        try {
            this.showLoading();
            
            // Determine endpoint
            const collectionKey = type + 's';
            const collection = this.collections[collectionKey];
            
            if (!collection) {
                throw new Error(`Unknown collection type: ${type}`);
            }

            // Add author for posts (you might want to get this from authentication)
            if (type === 'post' && !data.author) {
                // For demo purposes, we'll use a placeholder
                data.author = '507f1f77bcf86cd799439011'; // This should be the actual logged-in user ID
            }

            const response = await this.apiCall(collection.endpoint, 'POST', data);
            
            this.showNotification(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`, 'success');
            this.closeSmartForm();
            
            // Refresh current view
            if (this.currentCollection === collectionKey) {
                await this.loadCollection(collectionKey);
            } else {
                await this.loadDashboardStats();
            }
            
        } catch (error) {
            console.error('Error creating item:', error);
            this.showNotification(`❌ Error creating ${type}: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    closeSmartForm() {
        document.getElementById('smartFormModal').classList.remove('show');
    }

    showBulkImport() {
        document.getElementById('bulkImportModal').classList.add('show');
    }

    closeBulkImport() {
        document.getElementById('bulkImportModal').classList.remove('show');
    }

    async processBulkImport() {
        const collectionType = document.getElementById('bulk-collection').value;
        const jsonData = document.getElementById('bulk-data').value;
        
        try {
            const data = JSON.parse(jsonData);
            if (!Array.isArray(data)) {
                throw new Error('Data must be an array');
            }
            
            this.showLoading();
            
            const collection = this.collections[collectionType];
            const promises = data.map(item => this.apiCall(collection.endpoint, 'POST', item));
            
            await Promise.all(promises);
            
            this.showNotification(`✅ Successfully imported ${data.length} items!`, 'success');
            this.closeBulkImport();
            
            if (this.currentCollection === collectionType) {
                await this.loadCollection(collectionType);
            }
            await this.loadDashboardStats();
            
        } catch (error) {
            console.error('Bulk import error:', error);
            this.showNotification(`❌ Import failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-enhanced').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Continue with the rest of the existing methods from the original app.js
    // but enhanced with better error handling and UI feedback

    async loadDashboardStats() {
        this.showLoading();
        
        try {
            const stats = await this.fetchDashboardData();
            
            // Update stat cards with animation
            this.animateStatUpdate('total-users', stats.users || 0);
            this.animateStatUpdate('total-posts', stats.posts || 0);
            this.animateStatUpdate('total-achievements', stats.achievements || 0);
            this.animateStatUpdate('total-engagement', this.calculateEngagement(stats));
            
            // Update navigation counts
            Object.keys(this.collections).forEach(key => {
                const countElement = document.getElementById(`${key}-count`);
                if (countElement) {
                    countElement.textContent = stats[key] || 0;
                }
            });
            
            // Update chart if available
            if (this.chartInstance && stats.activityData) {
                this.chartInstance.data.datasets[0].data = stats.activityData.users;
                this.chartInstance.data.datasets[1].data = stats.activityData.posts;
                this.chartInstance.update();
            }
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            this.showNotification('Error loading dashboard statistics', 'error');
        } finally {
            this.hideLoading();
        }
    }

    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((newValue - currentValue) / 20);
        
        if (increment === 0) return;
        
        const animate = () => {
            const current = parseInt(element.textContent) || 0;
            if ((increment > 0 && current < newValue) || (increment < 0 && current > newValue)) {
                element.textContent = current + increment;
                requestAnimationFrame(animate);
            } else {
                element.textContent = newValue;
            }
        };
        
        animate();
    }

    calculateEngagement(stats) {
        return Math.floor((stats.posts * 2) + (stats.users * 1.5) + (stats.achievements * 0.5));
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
                library: 342,
                activityData: {
                    users: [12, 19, 3, 5, 2, 3, 20],
                    posts: [2, 5, 1, 3, 1, 2, 8]
                }
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
        const stats = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        
        // Add mock activity data for chart
        stats.activityData = {
            users: [12, 19, 3, 5, 2, 3, 20],
            posts: [2, 5, 1, 3, 1, 2, 8]
        };
        
        return stats;
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
            const errorText = await response.text();
            throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        return await response.json();
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    setupRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            if (document.getElementById('dashboard').classList.contains('active')) {
                this.loadDashboardStats();
            }
        }, 30000);
        
        // Try to reconnect every 10 seconds if disconnected
        setInterval(() => {
            if (this.useMockData) {
                this.checkConnection();
            }
        }, 10000);
    }

    startPeriodicRefresh() {
        this.setupRealTimeUpdates();
    }

    showConnectionHelp() {
        const helpHtml = `
            <div class="connection-help smart-form">
                <h3><i class="fas fa-exclamation-triangle"></i> Backend Server Not Running</h3>
                <p>To connect to your database, start the backend server:</p>
                <div class="code-block" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <code style="color: #00d4ff;">cd backend</code><br>
                    <code style="color: #00d4ff;">npm install</code><br>
                    <code style="color: #00d4ff;">npm start</code>
                </div>
                <p>Server should start on <strong>http://localhost:5000</strong></p>
                <p>💡 Console will auto-reconnect when server is available</p>
                <button class="smart-button" onclick="app.checkConnection()">
                    <i class="fas fa-sync-alt"></i> Retry Connection
                </button>
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

    // Additional methods for collection management, document editing, etc.
    // (Include the rest from the original app.js but with enhanced features)
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

function showSmartForm(type) {
    app.showSmartForm(type);
}

function closeSmartForm() {
    app.closeSmartForm();
}

function showBulkImport() {
    app.showBulkImport();
}

function closeBulkImport() {
    app.closeBulkImport();
}

function processBulkImport() {
    app.processBulkImport();
}

function exportCurrentCollection() {
    if (app.currentCollection) {
        // Export functionality
        app.showNotification('🚀 Export feature coming soon!', 'info');
    }
}

function createNewDocument() {
    if (app.currentCollection) {
        const type = app.currentCollection.replace('s', ''); // Remove 's' from collection name
        showSmartForm(type);
    }
}

// Initialize the enhanced application
document.addEventListener('DOMContentLoaded', () => {
    app = new EnhancedDatabaseConsole();
    
    // Set dashboard as default view
    showDashboard();
    
    console.log('🚀 Enhanced Coding Society Console initialized!');
});