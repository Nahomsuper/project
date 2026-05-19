
let expenses = [];
let filteredExpenses = [];
let count = 1;
const STORAGE_KEY = 'expenseTrackerData';
const STORAGE_COUNT_KEY = 'expenseTrackerCount';

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Loaded - Initializing Expense Tracker");
    loadExpenses();
    setTodayDate();
    setupEventListeners();
    renderTable();
    updateStatistics();
    console.log("Initialization complete. Expenses loaded:", expenses.length);
});

function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    const addBtn = document.getElementById("addBtn");
    if (addBtn) {
        addBtn.addEventListener("click", function(e) {
            console.log("Add Expense button clicked");
            e.preventDefault();
            addExpense();
        });
    } else {
        console.error("Add button not found!");
    }
    
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportToCSV);
    }
    
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", promptClearAll);
    }
    
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }
    
    const catFilter = document.getElementById("categoryFilter");
    if (catFilter) {
        catFilter.addEventListener("change", applyFilters);
    }
    
    const typeFilter = document.getElementById("typeFilter");
    if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
    }
    
    const startDate = document.getElementById("startDate");
    if (startDate) {
        startDate.addEventListener("change", applyFilters);
    }
    
    const endDate = document.getElementById("endDate");
    if (endDate) {
        endDate.addEventListener("change", applyFilters);
    }
    
    const sortBy = document.getElementById("sortBy");
    if (sortBy) {
        sortBy.addEventListener("change", applySorting);
    }
    
    const confirmNo = document.getElementById("confirmNo");
    if (confirmNo) {
        confirmNo.addEventListener("click", closeModal);
    }
    
    const amountInput = document.getElementById("amount");
    if (amountInput) {
        amountInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addExpense();
            }
        });
    }
    
    console.log("Event listeners setup complete");
}

function setTodayDate() {
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function addExpense() {
    console.log("addExpense function called");
    
    try {
        const amountInput = document.getElementById("amount");
        const reasonInput = document.getElementById("reason");
        const typeInput = document.getElementById("type");
        const categoryInput = document.getElementById("category");
        const dateInput = document.getElementById("date");

        if (!amountInput || !reasonInput || !typeInput || !categoryInput || !dateInput) {
            console.error("One or more input fields not found");
            showAlert("Form elements not found. Please refresh the page.", "error");
            return;
        }

        const amount = Number(amountInput.value);
        const reason = reasonInput.value.trim();
        const type = typeInput.value.trim();
        const category = categoryInput.value.trim();
        const date = dateInput.value.trim();

        console.log("Form values:", { amount, reason, type, category, date });

        if (!amountInput.value || amount <= 0 || isNaN(amount)) {
            showAlert("❌ Please enter a valid amount (greater than 0)", "error");
            amountInput.focus();
            return;
        }
        if (reason === "") {
            showAlert("❌ Please enter a description", "error");
            reasonInput.focus();
            return;
        }
        if (type === "") {
            showAlert("❌ Please select a payment method", "error");
            typeInput.focus();
            return;
        }
        if (category === "") {
            showAlert("❌ Please select a category", "error");
            categoryInput.focus();
            return;
        }
        if (date === "") {
            showAlert("❌ Please select a date", "error");
            dateInput.focus();
            return;
        }

        const expense = {
            id: Date.now(),
            count: count,
            amount: amount,
            reason: reason,
            type: type,
            category: category,
            date: date,
            timestamp: new Date().toISOString()
        };

        console.log("Adding expense:", expense);

        expenses.push(expense);
        filteredExpenses = [...expenses]; // Keep filtered list in sync
        count++;
        saveExpenses();
        
        console.log("Total expenses now:", expenses.length);
        
        clearInputs();
        renderTable();
        updateStatistics();
        showAlert("✅ Expense added successfully!", "success");
        
    } catch (error) {
        console.error("Error in addExpense:", error);
        showAlert("❌ An error occurred: " + error.message, "error");
    }
}

function clearInputs() {
    document.getElementById("amount").value = "";
    document.getElementById("reason").value = "";
    document.getElementById("type").value = "";
    document.getElementById("category").value = "";
    setTodayDate();
}

function deleteExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        showConfirmModal(
            `Delete "${expense.reason}" ($${expense.amount.toFixed(2)})?`,
            () => {
                expenses = expenses.filter(e => e.id !== id);
                saveExpenses();
                renderTable();
                updateStatistics();
                showAlert("Expense deleted successfully!", "success");
            }
        );
    }
}

function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    localStorage.setItem(STORAGE_COUNT_KEY, count);
}

function loadExpenses() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedCount = localStorage.getItem(STORAGE_COUNT_KEY);
    
    if (stored) {
        expenses = JSON.parse(stored);
        filteredExpenses = [...expenses];
    }
    
    if (storedCount) {
        count = parseInt(storedCount);
    }
}

function applyFilters() {
    console.log("Applying filters...");
    
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const typeFilter = document.getElementById("typeFilter");
    const startDateEl = document.getElementById("startDate");
    const endDateEl = document.getElementById("endDate");
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const categoryFilterVal = categoryFilter ? categoryFilter.value : "";
    const typeFilterVal = typeFilter ? typeFilter.value : "";
    const startDate = startDateEl ? startDateEl.value : "";
    const endDate = endDateEl ? endDateEl.value : "";

    filteredExpenses = expenses.filter(expense => {
        const matchesSearch = 
            expense.reason.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm) ||
            expense.amount.toString().includes(searchTerm);

        const matchesCategory = !categoryFilterVal || expense.category === categoryFilterVal;

        const matchesType = !typeFilterVal || expense.type === typeFilterVal;

        let matchesDateRange = true;
        if (startDate || endDate) {
            const expenseDate = new Date(expense.date);
            if (startDate) {
                matchesDateRange = matchesDateRange && expenseDate >= new Date(startDate);
            }
            if (endDate) {
                matchesDateRange = matchesDateRange && expenseDate <= new Date(endDate);
            }
        }

        return matchesSearch && matchesCategory && matchesType && matchesDateRange;
    });

    console.log("Filtered expenses:", filteredExpenses.length);
    renderTable();
}

function applySorting() {
    const sortBy = document.getElementById("sortBy")?.value || "newest";

    switch (sortBy) {
        case "newest":
            filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case "oldest":
            filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case "highest":
            filteredExpenses.sort((a, b) => b.amount - a.amount);
            break;
        case "lowest":
            filteredExpenses.sort((a, b) => a.amount - b.amount);
            break;
        case "category":
            filteredExpenses.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }

    renderTable();
}

function renderTable() {
    console.log("Rendering table with", filteredExpenses.length, "expenses");
    
    const tableBody = document.getElementById("expenseTable");
    if (!tableBody) {
        console.error("Table body element not found!");
        return;
    }
    
    tableBody.innerHTML = "";

    if (!filteredExpenses || filteredExpenses.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="7">
                    <i class="fas fa-inbox"></i>
                    <p>${expenses.length === 0 ? "No expenses yet. Add one to get started!" : "No expenses found. Try adjusting your filters!"}</p>
                </td>
            </tr>
        `;
        updateTableFooter();
        return;
    }

    filteredExpenses.forEach((expense, index) => {
        try {
            const row = tableBody.insertRow();
            const expenseClass = getExpenseClass(expense.amount);
            row.classList.add(expenseClass);

            const amountStr = parseFloat(expense.amount).toFixed(2);
            const dateStr = formatDate(expense.date);
            
            row.innerHTML = `
                <td>${expense.count}</td>
                <td class="amount-cell">$${amountStr}</td>
                <td>${escapeHtml(expense.reason)}</td>
                <td><span class="badge-type">${escapeHtml(expense.type)}</span></td>
                <td>${escapeHtml(expense.category)}</td>
                <td class="date-cell">${dateStr}</td>
                <td class="action-cell">
                    <button class="btn btn-delete" onclick="deleteExpense(${expense.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        } catch (error) {
            console.error("Error rendering row:", error, expense);
        }
    });

    updateTableFooter();
}

function updateTableFooter() {
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById("expenseCount").textContent = 
        `${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? 's' : ''}`;
    document.getElementById("tableTotal").textContent = 
        `Total: $${totalAmount.toFixed(2)}`;
}

// ============ GET EXPENSE CLASS ============
function getExpenseClass(amount) {
    if (amount > 5000) return "expense-high";
    if (amount > 500) return "expense-medium";
    return "expense-low";
}

function updateStatistics() {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        const today = new Date();
        return expenseDate.getMonth() === today.getMonth() && 
               expenseDate.getFullYear() === today.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);

    document.getElementById("totalSpent").textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById("monthlySpent").textContent = `$${thisMonth.toFixed(2)}`;

    const lowExpenses = expenses.filter(e => e.amount <= 500);
    const mediumExpenses = expenses.filter(e => e.amount > 500 && e.amount <= 5000);
    const highExpenses = expenses.filter(e => e.amount > 5000);

    const lowTotal = lowExpenses.reduce((sum, e) => sum + e.amount, 0);
    const mediumTotal = mediumExpenses.reduce((sum, e) => sum + e.amount, 0);
    const highTotal = highExpenses.reduce((sum, e) => sum + e.amount, 0);

    document.getElementById("lowExpenses").textContent = `$${lowTotal.toFixed(2)}`;
    document.getElementById("mediumExpenses").textContent = `$${mediumTotal.toFixed(2)}`;
    document.getElementById("highExpenses").textContent = `$${highTotal.toFixed(2)}`;

    document.getElementById("lowCount").textContent = `${lowExpenses.length} item${lowExpenses.length !== 1 ? 's' : ''}`;
    document.getElementById("mediumCount").textContent = `${mediumExpenses.length} item${mediumExpenses.length !== 1 ? 's' : ''}`;
    document.getElementById("highCount").textContent = `${highExpenses.length} item${highExpenses.length !== 1 ? 's' : ''}`;

    updateTopCategory();
}

function updateTopCategory() {
    if (expenses.length === 0) {
        document.getElementById("topCategory").textContent = "N/A";
        document.getElementById("topCategoryAmount").textContent = "$0.00";
        return;
    }

    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCat = Object.keys(categoryTotals).reduce((a, b) => 
        categoryTotals[a] > categoryTotals[b] ? a : b
    );

    document.getElementById("topCategory").textContent = topCat;
    document.getElementById("topCategoryAmount").textContent = `$${categoryTotals[topCat].toFixed(2)}`;
}

// ============ EXPORT TO CSV ============
function exportToCSV() {
    if (expenses.length === 0) {
        showAlert("No expenses to export", "warning");
        return;
    }

    let csv = "ID,Amount,Description,Method,Category,Date\n";
    
    expenses.forEach(expense => {
        const date = formatDate(expense.date);
        csv += `${expense.count},$${expense.amount.toFixed(2)},"${expense.reason}",${expense.type},${expense.category},${date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showAlert("Expenses exported successfully!", "success");
}

function promptClearAll() {
    if (expenses.length === 0) {
        showAlert("No expenses to clear", "warning");
        return;
    }

    showConfirmModal(
        `Are you sure you want to delete all ${expenses.length} expenses? This action cannot be undone.`,
        () => {
            expenses = [];
            filteredExpenses = [];
            count = 1;
            saveExpenses();
            renderTable();
            updateStatistics();
            showAlert("All expenses cleared!", "success");
        }
    );
}

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirmModal");
    document.getElementById("confirmMessage").textContent = message;
    
    const confirmBtn = document.getElementById("confirmYes");
    const cancelBtn = document.getElementById("confirmNo");
    
    // Remove old listeners
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    
    document.getElementById("confirmYes").addEventListener("click", () => {
        onConfirm();
        closeModal();
    });
    
    document.getElementById("confirmNo").addEventListener("click", closeModal);
    modal.classList.add("active");
}

function closeModal() {
    const modal = document.getElementById("confirmModal");
    modal.classList.remove("active");
}

function showAlert(message, type = "info") {
    console.log("Alert:", type, message);
    
    try {
        // Create alert element
        const alertDiv = document.createElement("div");
        const bgColor = getAlertColor(type);
        const icon = getAlertIcon(type);
        
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            font-weight: 600;
            z-index: 2000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-in-out;
        `;
        
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${icon}" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.animation = "slideOutRight 0.3s ease-in-out";
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }, 3000);
    } catch (error) {
        console.error("Error showing alert:", error);
        alert(message); // Fallback to browser alert
    }
}

function getAlertColor(type) {
    const colors = {
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#0ea5e9"
    };
    return colors[type] || colors.info;
}

function getAlertIcon(type) {
    const icons = {
        success: "check-circle",
        error: "exclamation-circle",
        warning: "exclamation-triangle",
        info: "info-circle"
    };
    return icons[type] || icons.info;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
