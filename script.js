let titleInput = document.getElementById('expenseTitle');
let amountInput = document.getElementById('expenseAmount');
let categoryInput = document.getElementById('expenseCategory');

const expensesContainer = document.getElementById("expenses");

let addExpense = document.getElementById('addExpense');

let editingExpenseId = null;

const cancelEdit = document.getElementById("cancelEdit");

const editMessage = document.getElementById("editMessage");

const totalTransactions = document.getElementById("totalTransactions");
const highestExpense = document.getElementById("highestExpense");
const averageExpense = document.getElementById("averageExpense");

const monthFilter = document.getElementById("monthFilter");

const categorySummary = document.getElementById("categorySummary");

let clearExpenses = document.getElementById("clearExpenses");

const filterCategory = document.getElementById("filterCategory");

const searchExpense = document.getElementById("searchExpense")

const sortExpenses = document.getElementById("sortExpenses");


monthFilter.addEventListener("change", function() {

    renderExpenses();
    updateTotal();
    updateCategorySummary();

});

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function getFilteredExpenses() {
    let filteredExpenses = expenses;

    if (filterCategory.value !== "All") {
        filteredExpenses = filteredExpenses.filter(function (expense) {
            return expense.category === filterCategory.value;
        });
    }

    if (monthFilter.value !== "all") {

    filteredExpenses = filteredExpenses.filter(function (expense) {

        const date = new Date(expense.date);

        const month = date.toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        });

        return month === monthFilter.value;

    });

}

    const searchText = searchExpense.value.toLowerCase();

    filteredExpenses = filteredExpenses.filter(function (expense) {
        return expense.title.toLowerCase().includes(searchText);
    });

    if (sortExpenses.value === "latest") {
        filteredExpenses.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date)
        });
    }

    if (sortExpenses.value === "oldest") {
        filteredExpenses.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    }

    return filteredExpenses;
}


function updateTotal() {

    const filteredExpenses = getFilteredExpenses();

    const total = filteredExpenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    document.getElementById("totalExpense").textContent = `₹${total}`;

    totalTransactions.textContent = filteredExpenses.length;

    let highest = 0;

    filteredExpenses.forEach(function (expense) {
        if (Number(expense.amount) > highest) {
            highest = Number(expense.amount);
        }
    })
    highestExpense.textContent = `₹${highest}`;

    let average = 0;

    if (filteredExpenses.length > 0) {
        average = total / filteredExpenses.length;
    }
    averageExpense.textContent = `₹${average.toFixed(2)}`;
}

function updateCategorySummary() {

    const categoryTotals = {};

    const filteredExpenses = getFilteredExpenses();

filteredExpenses.forEach(function(expense) {

    const category = expense.category;
    const amount = Number(expense.amount);

    if(categoryTotals[category]) {
        categoryTotals[category] += amount;
    } else {
        categoryTotals[category] = amount;
    }

});

categorySummary.innerHTML = "";

for (const category in categoryTotals) {

    const categoryElement = document.createElement("p");

    categoryElement.textContent =
        `${category}: ₹${categoryTotals[category]}`;

    categorySummary.appendChild(categoryElement);
}

}

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    console.log("Saved:", localStorage.getItem("expenses"));
}

function updateMonthFilter() {

    const months = [];

    expenses.forEach(function (expense) {

        const date = new Date(expense.date);

        const month = date.toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        });

        if (!months.includes(month)) {
            months.push(month);
        }

    });

    monthFilter.innerHTML = `<option value="all">All Months</option>`;

    months.forEach(function (month) {

        const option = document.createElement("option");

        option.value = month;
        option.textContent = month;

        monthFilter.appendChild(option);

    });

}

function renderExpenses() {

    expensesContainer.innerHTML = "";

    const filteredExpenses = getFilteredExpenses();

    if (filteredExpenses.length === 0) {
        expensesContainer.innerHTML = "<p>No expenses found</p>"
        return;
    }

    filteredExpenses.forEach(function (expense) {

        const expenseElement = document.createElement("div");
        expenseElement.classList.add('expense-card')

        expenseElement.innerHTML = `
    <div class="expense-info">
        <h3>${expense.title}</h3>
        <p>${expense.category}</p>
        <small>${new Date(expense.date).toLocaleString()}</small>
    </div>

    <div class="expense-right">
        <strong>₹${expense.amount}</strong>
        <button class="edit-btn" data-id="${expense.id}">Edit</button>
        <button class="delete-btn" data-id="${expense.id}">Delete</button>
    </div>
`;

        const editButton = expenseElement.querySelector(".edit-btn");
        const deleteButton = expenseElement.querySelector(".delete-btn");

        editButton.addEventListener("click", function () {
            titleInput.value = expense.title;
            amountInput.value = expense.amount;
            categoryInput.value = expense.category;

            editingExpenseId = expense.id;
            addExpense.textContent = "Update Expense";

            cancelEdit.style.display = "inline-block";
            editMessage.style.display = "block";
        })


        deleteButton.addEventListener("click", function () {

            const id = Number(deleteButton.dataset.id);

            const expenseIndex = expenses.findIndex(function (expense) {
                return expense.id === id;
            })

            expenses.splice(expenseIndex, 1);

            saveExpenses();
            renderExpenses();
            updateTotal();

        });

        expensesContainer.appendChild(expenseElement);
    });
}

cancelEdit.addEventListener("click", function () {

    titleInput.value = "";
    amountInput.value = "";
    categoryInput.value = "Food";

    editingExpenseId = null;

    addExpense.textContent = "Add Expense";
    cancelEdit.style.display = "none";
    editMessage.style.display = "none";

});

filterCategory.addEventListener("change", function () {
    renderExpenses();
    updateTotal();
});

sortExpenses.addEventListener("change", function () {
    renderExpenses();
    updateTotal();
})


searchExpense.addEventListener("input", function () {
    renderExpenses();
    updateTotal();
});

addExpense.addEventListener('click', () => {

    if (
        titleInput.value.trim() == "" ||
        amountInput.value.trim() == ""
    ) {
        alert("Please fill all fields")
        return;
    }

    const amount = Number(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter the valid amount");
        return;
    }

    if (editingExpenseId !== null) {
        const expenseIndex = expenses.findIndex(function (expense) {
            return expense.id === editingExpenseId;
        });

        expenses[expenseIndex].title = titleInput.value;
        expenses[expenseIndex].amount = amount;
        expenses[expenseIndex].category = categoryInput.value;

        editingExpenseId = null;
        addExpense.textContent = "Add Expense";

        titleInput.value = "";
        amountInput.value = "";
        categoryInput.value = "Food";
        cancelEdit.style.display = "none";
        editMessage.style.display = "none";

        saveExpenses();
        renderExpenses();
        updateTotal();
        updateMonthFilter();
        updateCategorySummary();

        return;
    }



    const expense = {
        id: Date.now(),
        title: titleInput.value,
        amount: amount,
        category: categoryInput.value,
        date: new Date().toISOString()
    }

    expenses.push(expense);

    titleInput.value = "";
    amountInput.value = "";
    categoryInput.value = "Food";

    saveExpenses();

    renderExpenses();
    updateTotal();



})

clearExpenses.addEventListener("click", () => {
    const confirmClear = confirm("Are you aure you want to delete all expenses?");

    if (!confirmClear) {
        return;
    }

    expenses.length = 0;

    localStorage.removeItem("expenses");
    renderExpenses();
    updateTotal();
})

renderExpenses();
updateTotal();
updateMonthFilter();
updateCategorySummary();

