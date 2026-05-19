let expenses = [];
let filteredExpenses = [];
let count = 1;
const STORAGE_KEY = 'expenseTrackerData';
const STORAGE_COUNT_KEY = 'expenseTrackerCount';

document.addEventListener("DOMContentLoaded", function () {
    loadExpenses();
    setTodayDate();
    setupEventListeners();
    renderTable();
    updateStatistics();
});

function setupEventListeners() {
    document.getElementById("addBtn")?.addEventListener("click", addExpense);
    document.getElementById("exportBtn")?.addEventListener("click", exportToCSV);
    document.getElementById("clearAllBtn")?.addEventListener("click", promptClearAll);
    
    document.getElementById("searchInput")?.addEventListener("input", applyFilters);
    document.getElementById("categoryFilter")?.addEventListener("change", applyFilters);
    document.getElementById("typeFilter")?.addEventListener("change", applyFilters);
    document.getElementById("startDate")?.addEventListener("change", applyFilters);
    document.getElementById("endDate")?.addEventListener("change", applyFilters);
    
    document.getElementById("sortBy")?.addEventListener("change", applySorting);
    
    document.getElementById("confirmNo")?.addEventListener("click", closeModal);
    
    document.getElementById("amount")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addExpense();
    });
}

function setTodayDate() {
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function addExpense() {
    const amountInput = document.getElementById("amount");
    const reasonInput = document.getElementById("reason");
    const typeInput = document.getElementById("type");
    const categoryInput = document.getElementById("category");
    const dateInput = document.getElementById("date");

    const amount = Number(amountInput.value);
    const reason = reasonInput.value.trim();
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (amount <= 0) {
        showAlert("Please enter a valid amount", "error");
        return;
    }
    if (reason === "") {
        showAlert("Please enter a description", "error");
        return;
    }
    if (type === "") {
        showAlert("Please select a payment method", "error");
        return;
    }
    if (category === "") {
        showAlert("Please select a category", "error");
        return;
    }
    if (date === "") {
        showAlert("Please select a date", "error");
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

    expenses.push(expense);
    count++;
    saveExpenses();
    
    clearInputs();
    renderTable();
    updateStatistics();
    showAlert("Expense added successfully!", "success");
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

// 
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
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const categoryFilter = document.getElementById("categoryFilter")?.value || "";
    const typeFilter = document.getElementById("typeFilter")?.value || "";
    const startDate = document.getElementById("startDate")?.value || "";
    const endDate = document.getElementById("endDate")?.value || "";

    filteredExpenses = expenses.filter(expense => {
        const matchesSearch = 
            expense.reason.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm) ||
            expense.amount.toString().includes(searchTerm);

        const matchesCategory = !categoryFilter || expense.category === categoryFilter;

        const matchesType = !typeFilter || expense.type === typeFilter;

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

    renderTable();
    updateStatistics();
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
    const tableBody = document.getElementById("expenseTable");
    tableBody.innerHTML = "";

    if (filteredExpenses.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="7">
                    <i class="fas fa-inbox"></i>
                    <p>No expenses found. Try adjusting your filters!</p>
                </td>
            </tr>
        `;
        updateTableFooter();
        return;
    }

    filteredExpenses.forEach(expense => {
        const row = tableBody.insertRow();
        const expenseClass = getExpenseClass(expense.amount);
        row.classList.add(expenseClass);

        row.innerHTML = `
            <td>${expense.count}</td>
            <td class="amount-cell">$${expense.amount.toFixed(2)}</td>
            <td>${escapeHtml(expense.reason)}</td>
            <td><span class="badge-type">${escapeHtml(expense.type)}</span></td>
            <td>${escapeHtml(expense.category)}</td>
            <td class="date-cell">${formatDate(expense.date)}</td>
            <td class="action-cell">
                <button class="btn btn-delete" onclick="deleteExpense(${expense.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
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
    const alertDiv = document.createElement("div");
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background: ${getAlertColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        font-weight: 600;
        z-index: 2000;
        animation: slideInRight 0.3s ease-in-out;
        max-width: 400px;
    `;
    
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${getAlertIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = "slideOutRight 0.3s ease-in-out";
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
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
