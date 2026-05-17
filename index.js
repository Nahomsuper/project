let count = 1;

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

    if (amount <= 0 || reason === "" || type === "" || category === "" || date === "") {
        alert("Please fill out all fields with valid information.");
        return;
    }

    const table = document.getElementById("expenseTable");
    const row = table.insertRow();

    if (amount > 5000) {
        row.classList.add("expense-high");
    } else if (amount > 500) {
        row.classList.add("expense-medium");
    } else {
        row.classList.add("expense-low");
    }

    row.innerHTML = `
        <td>${count}</td>
        <td class="amount-cell">$${amount.toFixed(2)}</td>
        <td>${reason}</td>
        <td><span class="badge-type">${type}</span></td>
        <td>${category}</td>
        <td class="date-cell">${date}</td>
    `;

    count++;

    amountInput.value = "";
    reasonInput.value = "";
    typeInput.value = "";
    categoryInput.value = "";
    dateInput.value = "";
}
