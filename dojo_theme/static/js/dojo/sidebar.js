// Sidebar functionality for dojo navigation
class DojoSidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        this.mainContent = document.getElementById('main-content');
        this.toggleBtn = document.getElementById('sidebar-toggle');
        this.collapseBtn = document.getElementById('sidebar-collapse');
        this.tooltip = document.getElementById('challenge-tooltip');
        
        this.state = 'expanded'; // 'expanded', 'collapsed', 'hidden'
        this.currentSection = null;
        
        // Debug logging
        console.log('DojoSidebar initialized:', {
            sidebar: !!this.sidebar,
            mainContent: !!this.mainContent,
            toggleBtn: !!this.toggleBtn,
            collapseBtn: !!this.collapseBtn
        });
        
        if (!this.sidebar || !this.mainContent) {
            console.error('Required sidebar elements not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDojos();
        this.loadModules();
        this.setupChallengeHovers();
        this.restoreState();
    }
    
    setupEventListeners() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (this.collapseBtn) {
            this.collapseBtn.addEventListener('click', () => this.collapseSidebar());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.hideSidebar());
        }
        
        // Section toggle listeners
        document.querySelectorAll('.sidebar-section-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section === 'help') {
                    window.open('/pwncollege_sensai/sensai', '_blank');
                    return;
                }

                const targetSelector = e.currentTarget.getAttribute('data-target');
                const content = targetSelector ? document.querySelector(targetSelector) : null;
                this.toggleSection(section, content, e.currentTarget);
            });
        });
        
        // Challenge click listeners
        document.querySelectorAll('.sidebar-challenge').forEach(challenge => {
            challenge.addEventListener('click', (e) => {
                const challengeId = e.currentTarget.dataset.challengeId;
                const challengeName = e.currentTarget.dataset.challengeName;
                this.navigateToChallenge(challengeId, challengeName);
            });
        });
        
        // Responsive handling
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
        });
    }
    
    toggleSidebar() {
        if (this.state === 'hidden') {
            this.expandSidebar();
        } else if (this.state === 'expanded') {
            this.hideSidebar();
        } else {
            this.expandSidebar();
        }
    }
    
    expandSidebar() {
        this.state = 'expanded';
        this.applySidebarState();
        this.saveState();
    }
    
    collapseSidebar() {
        this.state = 'collapsed';
        this.applySidebarState();
        this.saveState();
    }
    
    hideSidebar() {
        this.state = 'hidden';
        this.applySidebarState();
        this.saveState();
    }
    
    toggleSection(sectionName, contentOverride = null, headerOverride = null) {
        const header = headerOverride || document.querySelector(`.sidebar-section-header[data-section="${sectionName}"]`);
        const targetSelector = header ? header.getAttribute('data-target') : null;
        const content = contentOverride || (targetSelector ? document.querySelector(targetSelector) : null);

        if (!header || !content) {
            return;
        }

        const chevron = header.querySelector('.sidebar-chevron');
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            header.setAttribute('aria-expanded', 'false');
            content.classList.remove('show');
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        } else {
            header.setAttribute('aria-expanded', 'true');
            content.classList.add('show');
            if (chevron) {
                chevron.style.transform = 'rotate(90deg)';
            }

            if (sectionName === 'dojos' && !this.dojosLoaded) {
                this.loadDojos();
            } else if (sectionName === 'modules' && !this.modulesLoaded) {
                this.loadModules();
            }
        }
    }

    ensureSectionExpanded(sectionName) {
        const header = document.querySelector(`.sidebar-section-header[data-section="${sectionName}"]`);
        if (!header) {
            return;
        }

        const targetSelector = header.getAttribute('data-target');
        const content = targetSelector ? document.querySelector(targetSelector) : null;

        if (!content) {
            return;
        }

        if (header.getAttribute('aria-expanded') !== 'true') {
            this.toggleSection(sectionName, content, header);
        }
    }
    
    async loadDojos() {
        const content = document.getElementById('dojos-content');
        if (!content) return;
        
        try {
            const response = await fetch('/pwncollege_api/v1/dojos');
            const data = await response.json();
            
            let html = '';
            if (data.success && data.dojos) {
                data.dojos.forEach(dojo => {
                    const isActive = window.init.dojo === dojo.id;
                    html += `
                        <a href="/${dojo.id}" class="list-group-item list-group-item-action bg-transparent text-light d-flex align-items-center sidebar-item ${isActive ? 'active' : ''}">
                            <i class="fas fa-torii-gate mr-2"></i>
                            <span class="flex-grow-1">${dojo.name || dojo.id}</span>
                        </a>
                    `;
                });
            }
            
            if (!html) {
                html = '<div class="sidebar-empty list-group-item bg-transparent text-muted">No dojos available</div>';
            }
            
            content.innerHTML = html;
            this.dojosLoaded = true;
            
            // Re-setup event listeners for any dynamically loaded content
            this.setupChallengeHovers();
        } catch (error) {
            console.error('Failed to load dojos:', error);
            content.innerHTML = '<div class="sidebar-loading">Failed to load dojos</div>';
        }
    }
    
    async loadModules() {
        const content = document.getElementById('modules-content');
        if (!content || !window.init.dojo) return;
        
        try {
            const response = await fetch(`/pwncollege_api/v1/dojos/${window.init.dojo}/modules`);
            const data = await response.json();
            
            let html = '';
            if (data.success && data.modules) {
                data.modules.forEach(module => {
                    const isActive = window.init.module === module.id;
                    html += `
                        <a href="/${window.init.dojo}/${module.id}" class="list-group-item list-group-item-action bg-transparent text-light d-flex align-items-center sidebar-item ${isActive ? 'active' : ''}">
                            <i class="fas fa-book mr-2"></i>
                            <span class="flex-grow-1">${module.name || module.id}</span>
                        </a>
                    `;
                });
            }
            
            if (!html) {
                html = '<div class="sidebar-empty list-group-item bg-transparent text-muted">No modules available</div>';
            }
            
            content.innerHTML = html;
            this.modulesLoaded = true;
            
            // Re-setup event listeners for any dynamically loaded content
            this.setupChallengeHovers();
        } catch (error) {
            console.error('Failed to load modules:', error);
            content.innerHTML = '<div class="sidebar-loading">Failed to load modules</div>';
        }
    }
    
    setupChallengeHovers() {
        // Remove existing event listeners to prevent duplicates
        document.querySelectorAll('.sidebar-challenge').forEach(challenge => {
            // Clone node to remove all event listeners
            const newChallenge = challenge.cloneNode(true);
            challenge.parentNode.replaceChild(newChallenge, challenge);
        });
        
        // Add fresh event listeners
        document.querySelectorAll('.sidebar-challenge').forEach(challenge => {
            challenge.addEventListener('mouseenter', (e) => {
                const challengeElement = e.target.closest('.sidebar-challenge');
                const title = challengeElement.dataset.challengeName;
                const description = challengeElement.dataset.challengeDescription;
                
                if (title && description && this.state !== 'collapsed') {
                    this.showTooltip(challengeElement, title, description);
                }
            });
            
            challenge.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            // Add click handlers for navigation
            challenge.addEventListener('click', (e) => {
                const challengeElement = e.target.closest('.sidebar-challenge');
                const challengeId = challengeElement.dataset.challengeId;
                const challengeName = challengeElement.dataset.challengeName;
                
                if (challengeId && challengeName) {
                    this.navigateToChallenge(challengeId, challengeName);
                }
            });
        });
    }
    
    showTooltip(element, title, description) {
        if (!this.tooltip || this.state === 'collapsed') return;
        
        const titleEl = this.tooltip.querySelector('.challenge-tooltip-title');
        const descEl = this.tooltip.querySelector('.challenge-tooltip-description');
        
        if (!titleEl || !descEl) return;
        
        titleEl.textContent = title;
        descEl.textContent = description;
        
        const rect = element.getBoundingClientRect();
        const sidebarRect = this.sidebar.getBoundingClientRect();
        const tooltipWidth = 300; // Approximate tooltip width
        
        // Position tooltip to the right of the sidebar
        let left = sidebarRect.right + 10;
        let top = rect.top;
        
        // Ensure tooltip doesn't go off screen
        if (left + tooltipWidth > window.innerWidth) {
            left = sidebarRect.left - tooltipWidth - 10;
        }
        
        // Ensure tooltip doesn't go off screen vertically
        if (top + 100 > window.innerHeight) {
            top = window.innerHeight - 120;
        }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.position = 'fixed';
        this.tooltip.style.zIndex = '9999';
        this.tooltip.classList.add('show');
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('show');
        }
    }
    
    navigateToChallenge(challengeId, challengeName) {
        const dojoId = window.init.dojo;
        const moduleId = window.init.module;
        
        if (dojoId && moduleId) {
            // Send challenge start request
            const url = `/pwncollege_api/v1/dojos/${dojoId}/${moduleId}/${challengeId}/start`;
            fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // Reload page to show challenge
                    window.location.reload();
                }
            }).catch(error => {
                console.error('Failed to start challenge:', error);
            });
        }
    }
    
    handleResize() {
        if (window.innerWidth <= 768) {
            if (this.state === 'expanded') {
                this.overlay.classList.add('active');
            }
        } else {
            this.overlay.classList.remove('active');
        }
    }
    
    saveState() {
        localStorage.setItem('sidebar-state', this.state);
    }
    
    restoreState() {
        const savedState = localStorage.getItem('sidebar-state');
        if (savedState && ['expanded', 'collapsed', 'hidden'].includes(savedState)) {
            this.state = savedState;
        } else {
            this.state = 'expanded'; // Default state
        }
        
        // Apply the initial state
        this.applySidebarState();
        
        // Auto-expand current section
        if (window.init && window.init.module) {
            this.ensureSectionExpanded('challenges');
            this.ensureSectionExpanded('modules');
            this.ensureSectionExpanded('dojos');
        } else if (window.init && window.init.dojo) {
            this.ensureSectionExpanded('modules');
            this.ensureSectionExpanded('dojos');
        } else {
            this.ensureSectionExpanded('dojos');
        }
    }
    
    applySidebarState() {
        const navbar = document.querySelector('.main-navbar');
        
        if (this.state === 'expanded') {
            this.sidebar.className = 'sidebar sidebar-expanded';
            this.mainContent.className = 'main-content sidebar-expanded';
            if (navbar) {
                navbar.className = navbar.className.replace(/sidebar-\w+/g, '') + ' sidebar-expanded';
            }
        } else if (this.state === 'collapsed') {
            this.sidebar.className = 'sidebar sidebar-collapsed';
            this.mainContent.className = 'main-content sidebar-collapsed';
            if (navbar) {
                navbar.className = navbar.className.replace(/sidebar-\w+/g, '') + ' sidebar-collapsed';
            }
        } else {
            this.sidebar.className = 'sidebar sidebar-hidden';
            this.mainContent.className = 'main-content sidebar-hidden';
            if (navbar) {
                navbar.className = navbar.className.replace(/sidebar-\w+/g, '') + ' sidebar-hidden';
            }
            if (this.overlay) {
                this.overlay.classList.remove('active');
            }
        }
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DojoSidebar();
});

// Export for use in other scripts
window.DojoSidebar = DojoSidebar;