// Global variables
let expenses = [];
let currentTheme = localStorage.getItem('theme') || 'light';
let categoryChart = null;
let trendChart = null;
let isMobile = window.innerWidth <= 768;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadExpenses();
    setTheme(currentTheme);
    updateDashboard();
    initializeCharts();
    setupEventListeners();
    setupMobileFeatures();
    
    // Set default date to today
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
});

// Handle window resize for responsive behavior
function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isMobile) {
        // Reinitialize charts on orientation change
        if (categoryChart && trendChart) {
            setTimeout(() => {
                categoryChart.resize();
                trendChart.resize();
            }, 100);
        }
    }
}

// Mobile-specific features
function setupMobileFeatures() {
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('button, .back-link, .cta-button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
    
    // Improve form experience on mobile
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        // Prevent zoom on iOS
        if (input.type === 'text' || input.type === 'number' || input.type === 'email') {
            input.style.fontSize = '16px';
        }
        
        // Add focus handling for better mobile UX
        input.addEventListener('focus', function() {
            if (isMobile) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    // Add swipe gestures for tabs (if needed)
    setupSwipeGestures();
}

// Setup swipe gestures for mobile
function setupSwipeGestures() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer || !isMobile) return;
    
    let startX = 0;
    let currentX = 0;
    
    tabsContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    tabsContainer.addEventListener('touchmove', function(e) {
        currentX = e.touches[0].clientX;
    });
    
    tabsContainer.addEventListener('touchend', function(e) {
        const diffX = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
            const activeIndex = tabButtons.findIndex(btn => btn.classList.contains('active'));
            
            if (diffX > 0 && activeIndex < tabButtons.length - 1) {
                // Swipe left - next tab
                tabButtons[activeIndex + 1].click();
            } else if (diffX < 0 && activeIndex > 0) {
                // Swipe right - previous tab
                tabButtons[activeIndex - 1].click();
            }
        }
    });
}

// Theme management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// LocalStorage management
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadExpenses() {
    const saved = localStorage.getItem('expenses');
    expenses = saved ? JSON.parse(saved) : [];
}

// Expense management
function addExpense(expense) {
    expense.id = Date.now();
    expense.createdAt = new Date().toISOString();
    expenses.push(expense);
    saveExpenses();
    updateDashboard();
    showAlert('Expense added successfully!', 'success');
    
    // Scroll to top on mobile after adding expense
    if (isMobile) {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
    }
}

function deleteExpense(id) {
    // Add confirmation for mobile
    if (isMobile) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }
    }
    
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    updateDashboard();
    showAlert('Expense deleted successfully!', 'success');
}

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    // Populate form with expense data
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseNotes').value = expense.notes || '';
    
    // Set frequency
    const frequencyRadios = document.querySelectorAll('input[name="frequency"]');
    frequencyRadios.forEach(radio => {
        radio.checked = radio.value === expense.frequency;
    });
    
    // Remove old expense and scroll to form
    deleteExpense(id);
    scrollToForm();
}

// Dashboard updates
function updateDashboard() {
    updateSummaryCards();
    updateExpenseTable();
    updateCharts();
}

function updateSummaryCards() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Calculate different time periods
    const todayExpenses = expenses.filter(exp => exp.date === today);
    const weekExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expDate >= weekAgo;
    });
    const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && 
               expDate.getFullYear() === now.getFullYear();
    });
    const yearExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getFullYear() === now.getFullYear();
    });
    
    // Calculate totals
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const weekTotal = weekExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const yearTotal = yearExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Update display
    updateElement('todayAmount', formatCurrency(todayTotal));
    updateElement('weekAmount', formatCurrency(weekTotal));
    updateElement('monthAmount', formatCurrency(monthTotal));
    updateElement('yearAmount', formatCurrency(yearTotal));
    
    // Update total balance (assuming some income - you can modify this logic)
    const totalBalance = 50000 - yearTotal; // Example: ₹50,000 yearly budget
    updateElement('totalBalance', formatCurrency(totalBalance));
    
    // Show warning for high spending
    if (monthTotal > 20000) {
        showAlert('High spending this month! Consider reviewing your budget.', 'warning');
    }
}

function updateExpenseTable() {
    const tbody = document.getElementById('expenseTableBody');
    if (!tbody) return;
    
    const filterPeriod = document.getElementById('filterPeriod')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'date';
    
    let filteredExpenses = [...expenses];
    
    // Apply filters
    if (filterPeriod !== 'all') {
        const now = new Date();
        const today = new Date().toISOString().split('T')[0];
        
        switch (filterPeriod) {
            case 'today':
                filteredExpenses = expenses.filter(exp => exp.date === today);
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredExpenses = expenses.filter(exp => new Date(exp.date) >= weekAgo);
                break;
            case 'month':
                filteredExpenses = expenses.filter(exp => {
                    const expDate = new Date(exp.date);
                    return expDate.getMonth() === now.getMonth() && 
                           expDate.getFullYear() === now.getFullYear();
                });
                break;
            case 'year':
                filteredExpenses = expenses.filter(exp => {
                    const expDate = new Date(exp.date);
                    return expDate.getFullYear() === now.getFullYear();
                });
                break;
        }
    }
    
    // Apply sorting
    filteredExpenses.sort((a, b) => {
        switch (sortBy) {
            case 'amount':
                return parseFloat(b.amount) - parseFloat(a.amount);
            case 'category':
                return a.category.localeCompare(b.category);
            case 'date':
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    // Generate table rows with mobile-friendly layout
    tbody.innerHTML = filteredExpenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>
                <span class="category-badge category-${expense.category.toLowerCase()}">
                    ${expense.category}
                </span>
            </td>
            <td class="expense-amount">${formatCurrency(expense.amount)}</td>
            <td>${expense.notes || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editExpense(${expense.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense(${expense.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Show empty state if no expenses
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No expenses found for the selected period.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add your first expense to get started!</p>
                </td>
            </tr>
        `;
    }
}

// Charts
function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                            padding: isMobile ? 10 : 20,
                            font: {
                                size: isMobile ? 12 : 14
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Trend Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        trendChart = new Chart(trendCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Monthly Spending',
                    data: [],
                    backgroundColor: '#4f46e5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: isMobile ? 12 : 14
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateCharts() {
    if (!categoryChart || !trendChart) return;
    
    // Update category chart
    const categoryData = getCategoryData();
    categoryChart.data.labels = categoryData.labels;
    categoryChart.data.datasets[0].data = categoryData.values;
    categoryChart.update();
    
    // Update trend chart
    const trendData = getTrendData();
    trendChart.data.labels = trendData.labels;
    trendChart.data.datasets[0].data = trendData.values;
    trendChart.update();
}

function getCategoryData() {
    const now = new Date();
    const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && 
               expDate.getFullYear() === now.getFullYear();
    });
    
    const categoryTotals = {};
    monthExpenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });
    
    return {
        labels: Object.keys(categoryTotals),
        values: Object.values(categoryTotals)
    };
}

function getTrendData() {
    const months = [];
    const values = [];
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-IN', { month: 'short' });
        months.push(monthName);
        
        const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === month.getMonth() && 
                   expDate.getFullYear() === month.getFullYear();
        });
        
        const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        values.push(monthTotal);
    }
    
    return { labels: months, values };
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
        <span>${message}</span>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function scrollToForm() {
    const form = document.querySelector('.expense-form-section');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

// Event listeners
function setupEventListeners() {
    // Expense form submission
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // You can add specific logic for each tab here
        });
    });
    
    // Filter and sort controls
    const filterSelect = document.getElementById('filterPeriod');
    const sortSelect = document.getElementById('sortBy');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', updateExpenseTable);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', updateExpenseTable);
    }
    
    // Mobile-specific event listeners
    if (isMobile) {
        // Add pull-to-refresh functionality
        let startY = 0;
        let currentY = 0;
        
        document.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', function(e) {
            currentY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', function(e) {
            const diffY = startY - currentY;
            if (diffY > 100 && window.scrollY === 0) {
                // Pull to refresh - reload dashboard
                updateDashboard();
                showAlert('Dashboard refreshed!', 'success');
            }
        });
    }
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const expense = {
        date: formData.get('expenseDate') || document.getElementById('expenseDate').value,
        category: formData.get('expenseCategory') || document.getElementById('expenseCategory').value,
        amount: parseFloat(formData.get('expenseAmount') || document.getElementById('expenseAmount').value),
        notes: formData.get('expenseNotes') || document.getElementById('expenseNotes').value,
        frequency: formData.get('frequency') || 'daily'
    };
    
    // Validation
    if (!expense.date || !expense.category || !expense.amount || expense.amount <= 0) {
        showAlert('Please fill in all required fields with valid values.', 'error');
        return;
    }
    
    addExpense(expense);
    
    // Reset form
    e.target.reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

// Add some sample data for demonstration
function addSampleData() {
    if (expenses.length > 0) return; // Don't add if already has data
    
    const sampleExpenses = [
        {
            date: new Date().toISOString().split('T')[0],
            category: 'Food',
            amount: 1500,
            notes: 'Grocery shopping',
            frequency: 'daily'
        },
        {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'Transport',
            amount: 800,
            notes: 'Fuel for car',
            frequency: 'weekly'
        },
        {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'Health',
            amount: 2500,
            notes: 'Medical checkup',
            frequency: 'monthly'
        },
        {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'Kids',
            amount: 1200,
            notes: 'School supplies',
            frequency: 'monthly'
        }
    ];
    
    sampleExpenses.forEach(expense => {
        addExpense(expense);
    });
    
    showAlert('Sample data added! You can now explore the features.', 'success');
}

// Add sample data button (for demonstration)
if (window.location.pathname.includes('dashboard.html')) {
    // Add a button to add sample data if no expenses exist
    setTimeout(() => {
        if (expenses.length === 0) {
            const sampleBtn = document.createElement('button');
            sampleBtn.textContent = 'Add Sample Data';
            sampleBtn.className = 'sample-data-btn';
            sampleBtn.style.cssText = `
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: var(--accent-color);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                z-index: 1000;
                font-size: 14px;
                min-height: 44px;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                transition: transform 0.3s ease;
            `;
            sampleBtn.onclick = addSampleData;
            sampleBtn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            sampleBtn.addEventListener('touchend', function() {
                this.style.transform = '';
            });
            document.body.appendChild(sampleBtn);
        }
    }, 1000);
}

// Home page specific functions
function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Enhanced mobile detection and touch handling
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

// Add touch feedback to buttons
document.addEventListener('DOMContentLoaded', function() {
    if (isMobileDevice()) {
        const buttons = document.querySelectorAll('button, .cta-button, .nav-cta');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .step-item, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}); 