// Admin Panel JavaScript
class VourneAdmin {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDataTables();
        this.setupCharts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', this.handleSearch.bind(this));
        });

        // Filter functionality
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', this.handleFilter.bind(this));
        });

        // Toggle switches
        const toggleSwitches = document.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', this.handleToggle.bind(this));
        });

        // Form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Action buttons
        const actionButtons = document.querySelectorAll('.btn-icon');
        actionButtons.forEach(button => {
            button.addEventListener('click', this.handleAction.bind(this));
        });
    }

    setupDataTables() {
        // Simple table sorting functionality
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                if (header.textContent.trim() !== 'Acciones') {
                    header.style.cursor = 'pointer';
                    header.addEventListener('click', () => {
                        this.sortTable(table, index);
                    });
                }
            });
        });
    }

    setupCharts() {
        // Initialize simple charts for dashboard
        // In a real implementation, you might use Chart.js or similar
        this.initializeStatsCharts();
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const table = e.target.closest('.content-card')?.querySelector('.data-table');
        
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    handleFilter(e) {
        const filterValue = e.target.value;
        const table = e.target.closest('.content-card')?.querySelector('.data-table');
        
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            if (filterValue === 'all') {
                row.style.display = '';
                return;
            }

            // For products table
            const categoryCell = row.querySelector('.badge');
            if (categoryCell) {
                const category = categoryCell.textContent.toLowerCase();
                row.style.display = category.includes(filterValue) ? '' : 'none';
                return;
            }

            // For orders table
            const statusCell = row.querySelector('.status-badge');
            if (statusCell) {
                const status = statusCell.textContent.toLowerCase();
                row.style.display = status.includes(filterValue) ? '' : 'none';
                return;
            }
        });
    }

    handleToggle(e) {
        const toggle = e.target;
        const row = toggle.closest('tr');
        const productId = row.querySelector('td:first-child').textContent;
        const isFeatured = toggle.checked;

        // Simulate API call to update featured status
        this.showNotification(
            `Producto ${isFeatured ? 'añadido a' : 'eliminado de'} destacados`, 
            'success'
        );

        // In real implementation, you would make an API call here
        console.log(`Updating product ${productId} featured status: ${isFeatured}`);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;

        // Simulate form processing
        setTimeout(() => {
            this.showNotification('Configuración guardada correctamente', 'success');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }

    handleAction(e) {
        const button = e.currentTarget;
        const action = button.classList[1]; // edit, delete, view, etc.
        const row = button.closest('tr');
        const itemId = row.querySelector('td:first-child').textContent;

        switch (action) {
            case 'edit':
                this.editItem(itemId);
                break;
            case 'delete':
                this.deleteItem(itemId, row);
                break;
            case 'view':
                this.viewItem(itemId);
                break;
            case 'print':
                this.printItem(itemId);
                break;
        }
    }

    editItem(id) {
        this.showNotification(`Editando item ${id}`, 'info');
        // In real implementation, open edit modal or redirect to edit page
    }

    deleteItem(id, row) {
        if (confirm(`¿Estás seguro de que quieres eliminar el item ${id}? Esta acción no se puede deshacer.`)) {
            // Simulate deletion
            row.style.opacity = '0.5';
            row.style.pointerEvents = 'none';
            
            setTimeout(() => {
                row.remove();
                this.showNotification('Item eliminado correctamente', 'success');
            }, 1000);
        }
    }

    viewItem(id) {
        this.showNotification(`Viendo detalles del item ${id}`, 'info');
        // In real implementation, open view modal or redirect to details page
    }

    printItem(id) {
        this.showNotification(`Imprimiendo item ${id}`, 'info');
        window.print();
    }

    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isNumeric = this.isColumnNumeric(table, columnIndex);
        const isDate = this.isColumnDate(table, columnIndex);
        
        const sortedRows = rows.sort((a, b) => {
            const aCell = a.cells[columnIndex].textContent.trim();
            const bCell = b.cells[columnIndex].textContent.trim();
            
            if (isNumeric) {
                return parseFloat(aCell) - parseFloat(bCell);
            } else if (isDate) {
                return new Date(aCell) - new Date(bCell);
            } else {
                return aCell.localeCompare(bCell);
            }
        });

        // Clear and re-append sorted rows
        tbody.innerHTML = '';
        sortedRows.forEach(row => tbody.appendChild(row));
    }

    isColumnNumeric(table, columnIndex) {
        // Check if column contains numeric data
        const sampleCell = table.querySelector(`tbody tr:first-child td:nth-child(${columnIndex + 1})`);
        return sampleCell && !isNaN(parseFloat(sampleCell.textContent));
    }

    isColumnDate(table, columnIndex) {
        // Check if column contains date data
        const sampleCell = table.querySelector(`tbody tr:first-child td:nth-child(${columnIndex + 1})`);
        return sampleCell && !isNaN(Date.parse(sampleCell.textContent));
    }

    initializeStatsCharts() {
        // Simple chart initialization
        // In real implementation, use Chart.js or similar library
        console.log('Initializing admin charts...');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : 
                        type === 'error' ? 'var(--error)' : 'var(--primary-dark)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
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
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vourneAdmin = new VourneAdmin();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VourneAdmin;
}