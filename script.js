const API_URL = "https://expense-tracker-bur3.onrender.com";

const amountInput = document.getElementById('expenseAmount');
const categoryInput = document.getElementById('expenseCategory');
const titleInput = document.getElementById('expenseTitle');

const expensesContainer = document.getElementById("expenses");

const addExpense = document.getElementById('addExpense');

let editingExpenseId = null;

const cancelEdit = document.getElementById("cancelEdit");

const editMessage = document.getElementById("editMessage");

const totalTransactions = document.getElementById("totalTransactions");
const highestExpense = document.getElementById("highestExpense");
const averageExpense = document.getElementById("averageExpense");

const monthFilter = document.getElementById("monthFilter");

const categorySummary = document.getElementById("categorySummary");

const clearExpenses = document.getElementById("clearExpenses");

const filterCategory = document.getElementById("filterCategory");

const searchExpense = document.getElementById("searchExpense")

const sortExpenses = document.getElementById("sortExpenses");

const categoryChart = document.getElementById("categoryChart");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
retryButton.style.display = "none";

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const registerButton = document.getElementById("registerButton");

const authMessage = document.getElementById("authMessage");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const loginButton = document.getElementById("loginButton");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegisterButton = document.getElementById("showRegisterButton");
const showLoginButton = document.getElementById("showLoginButton");

const authBox = document.querySelector(".auth-box");
const dashboard = document.getElementById("dashboard");
const logoutButton = document.getElementById("logoutButton");

const analyzeButton = document.getElementById("analyzeButton");
const aiResult = document.getElementById("aiResult");

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
});

showRegisterButton.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
});

showLoginButton.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "block";
});

registerButton.addEventListener("click", async () => {

    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!name || !email || !password) {
        authMessage.textContent = "Please fill all fields";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            authMessage.textContent = data.message;
            return;
        }

        authMessage.textContent = "Registration successful";
        authMessage.className = "auth-success";

        registerName.value = "";
        registerEmail.value = "";
        registerPassword.value = "";

    } catch (error) {
        console.log(error);
        authMessage.textContent = "Unable to connect to server";
    }
});

loginButton.addEventListener("click", async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        authMessage.textContent = "Please enter email and password";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await response.json()

        if (!response.ok) {
            authMessage.textContent = data.message;
            return;
        }

        localStorage.setItem("token", data.token);

        authMessage.textContent = "Login successful";
        authMessage.className = "auth-success";
        authBox.style.display = "none";
        dashboard.style.display = "block";
        getExpenses();

        loginEmail.value = "";
        loginPassword.value = "";

    } catch (error) {
        console.log(error);

        authMessage.textContent = "Unable to connect to server";
    }
})

monthFilter.addEventListener("change", function () {
    updateUI();
});

let expenses = [];

function getFilteredExpenses() {
    let filteredExpenses = [...expenses];

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
        return expense.title.toLowerCase().includes(searchText) ||
            expense.category.toLowerCase().includes(searchText);
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

    document.getElementById("totalExpense").textContent = `₹${total.toFixed(2)}`;

    totalTransactions.textContent = filteredExpenses.length;

    let highest = 0;

    filteredExpenses.forEach(function (expense) {
        if (Number(expense.amount) > highest) {
            highest = Number(expense.amount);
        }
    })
    highestExpense.textContent = `₹${highest.toFixed(2)}`;

    let average = 0;

    if (filteredExpenses.length > 0) {
        average = total / filteredExpenses.length;
    }
    averageExpense.textContent = `₹${average.toFixed(2)}`;
}

function updateCategorySummary() {

    const categoryTotals = {};

    const filteredExpenses = getFilteredExpenses();

    filteredExpenses.forEach(function (expense) {

        const category = expense.category;
        const amount = Number(expense.amount);

        if (categoryTotals[category]) {
            categoryTotals[category] += amount;
        } else {
            categoryTotals[category] = amount;
        }

    });

    let maxAmount = 0;

    for (const category in categoryTotals) {

        if (categoryTotals[category] > maxAmount) {
            maxAmount = categoryTotals[category];
        }

    }

    const sortedCategories = Object.entries(categoryTotals)
        .sort(function (a, b) {
            return b[1] - a[1];
        });

    categoryChart.innerHTML = "";
    categorySummary.innerHTML = "";

    if (maxAmount === 0) {
        return;
    }

    const totalSpending = filteredExpenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    for (const [category, amount] of sortedCategories) {

        const barContainer = document.createElement("div");

        const bar = document.createElement("div");

        const totalPercentage = ((amount / totalSpending) * 100).toFixed(1);

        const barPercentage = (amount / maxAmount) * 100;

        bar.style.width = `${barPercentage}%`;

        barContainer.textContent = category;
        bar.textContent = `₹${amount.toFixed(2)} (${totalPercentage}%)`;

        barContainer.appendChild(bar);

        categoryChart.appendChild(barContainer);
    }

    for (const [category, amount] of sortedCategories) {

        const categoryElement = document.createElement("p");

        categoryElement.textContent =
            `${category}: ₹${amount.toFixed(2)}`;

        categorySummary.appendChild(categoryElement);
    }

}

function updateUI() {
    renderExpenses();
    updateTotal();
    updateCategorySummary();
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
    monthFilter.value = "all";

}

function renderExpenses() {

    expensesContainer.innerHTML = "";

    const filteredExpenses = getFilteredExpenses();

    if (filteredExpenses.length === 0) {

        if (expenses.length === 0) {
            expensesContainer.innerHTML = `
            <div class="empty-state">
                <p>No expenses found</p>
                <small>Add your first expense to get started.</small>
            </div>
        `;
        } else {
            expensesContainer.innerHTML = `
            <div class="empty-state">
                <p>No matching expenses found</p>
                <small>Try changing your search or filters.</small>
            </div>
        `;
        }

        return;
    }

    filteredExpenses.forEach(function (expense) {

        const expenseElement = document.createElement("div");
        expenseElement.classList.add('expense-card')
        expenseElement.classList.add(expense.category.toLowerCase());

        expenseElement.innerHTML = `
    <div class="expense-info">
        <h3>${expense.title}</h3>
        <p>${expense.category}</p>
        <small>${new Date(expense.date).toLocaleString()}</small>
    </div>

    <div class="expense-right">
        <strong>₹${Number(expense.amount).toFixed(2)}</strong>
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

            titleInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            titleInput.focus();
        });


        deleteButton.addEventListener("click", async function () {

            const id = Number(deleteButton.dataset.id);

            const confirmDelete = confirm("Are you sure you want to delete this expense?");

            if (!confirmDelete) {
                return;
            }

            try {

                const response = await fetch(`${API_URL}/expenses/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }

                });

                if (!response.ok) {
                    const data = await response.json();
                    console.log("Delete error:", data);
                    alert("Failed to delete expense");
                    return;
                }

                const data = await response.json()

                await getExpenses();


            } catch (errro) {
                console.log(error);
                alert("Something went wrong")
            }

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
    updateUI();
});

sortExpenses.addEventListener("change", function () {
    updateUI();

})


searchExpense.addEventListener("input", function () {
    updateUI();
});

addExpense.addEventListener('click', async () => {

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

        const updatedExpense = {
            title: titleInput.value,
            amount: amount,
            category: categoryInput.value
        };

        try {
            const response = await fetch(
                `${API_URL}/expenses/${editingExpenseId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify(updatedExpense)
                }
            );

            if (!response.ok) {
                alert("Failed to load expense");
                return;
            }

            const data = await response.json();


        } catch (error) {
            console.log(error);
            alert("Something went wrong");
        }



        editingExpenseId = null;
        addExpense.textContent = "Add Expense";

        titleInput.value = "";
        amountInput.value = "";
        categoryInput.value = "Food";
        cancelEdit.style.display = "none";
        editMessage.style.display = "none";

        await getExpenses()
        return;
    }

    const expense = {
        id: Date.now(),
        title: titleInput.value,
        amount: amount,
        category: categoryInput.value,
        date: new Date().toISOString()
    }

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            alert("Failed to add expense");
            return;
        }

        const data = await response.json()
        console.log(data);
    } catch (error) {
        console.log(error);
        alert("Something went wrong");
    }


    titleInput.value = "";
    amountInput.value = "";
    categoryInput.value = "Food";

    await getExpenses();

})

clearExpenses.addEventListener("click", async () => {

    if (expenses.length === 0) {
        alert("There are no expenses to clear.");
        return;
    }

    const confirmClear = confirm("Are you sure you want to delete all expenses?");

    if (!confirmClear) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/expenses`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) {
            alert("Failed to delete all expenses");
            return;
        }

        const data = await response.json()
        console.log(data);

        await getExpenses();
    } catch (error) {
        console.log(error);
        alert("Something went wrong")
    }

});

renderExpenses();
updateTotal();
updateMonthFilter();
updateCategorySummary();

retryButton.addEventListener("click", () => {
    getExpenses();
})


async function getExpenses() {
    loadingMessage.style.display = "block";
    errorMessage.style.display = "none";
    try {
        const response = await fetch(`${API_URL}/expenses`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();

        errorMessage.style.display = "none";
        loadingMessage.style.display = "none";
        retryButton.style.display = "none";

        expenses.length = 0;
        expenses.push(...data)

        updateUI();
        updateMonthFilter();
    } catch (error) {
        console.log(error);

        errorMessage.textContent = "Failed to load expenses";
        errorMessage.style.display = "block";
        retryButton.style.display = "block";
    } finally {
        loadingMessage.style.display = "none";
    }
}

// getExpenses();

const token = localStorage.getItem("token");

if (token) {
    authBox.style.display = "none";
    dashboard.style.display = "block";
    getExpenses();
}

analyzeButton.addEventListener("click", async () => {

    aiResult.textContent = "Analyzing your spending...";

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing...";

    try {

        const response = await fetch(
            `${API_URL}/expenses/analyze`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            aiResult.textContent = data.message;
            return;
        }

        aiResult.innerHTML = `
    <div class="ai-result-content">

        <div class="ai-card">
            <h3>💰 Total Spending</h3>
            <p>₹${data.insights.totalSpending}</p>
        </div>

        <div class="ai-card">
            <h3>📊 Highest Spending Category</h3>
            <p>${data.insights.highestCategory}</p>
        </div>

        <div class="ai-card">
            <h3>💸 Highest Individual Expense</h3>
            <p>${data.insights.highestExpense}</p>
        </div>

        <div class="ai-card">
            <h3>🔎 Spending Pattern</h3>
            <p>${data.insights.spendingPattern}</p>
        </div>

        <div class="ai-card">
            <h3>💡 Saving Suggestions</h3>
            <ul>
                <li>${data.insights.savingSuggestions[0]}</li>
                <li>${data.insights.savingSuggestions[1]}</li>
            </ul>
        </div>

    </div>
`;

    } catch (error) {

        console.log(error);
        aiResult.textContent = "Failed to analyze expenses";

    } finally {

        analyzeButton.disabled = false;
        analyzeButton.textContent = "Analyze My Spending";
    }
});

