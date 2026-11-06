
/* ==========================================
   SPENDWISE
   Week 6 + Web Hosting and Deployment
   Personal Budget Management Application
========================================== */


/* ==========================================
   1. SELECT HTML ELEMENTS
========================================== */

const expenseForm = document.getElementById("expenseForm");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");

const expenseList = document.getElementById("expenseList");

const totalBudgetElement = document.getElementById("totalBudget");
const totalExpensesElement = document.getElementById("totalExpenses");
const remainingBalanceElement = document.getElementById("remainingBalance");
const expenseCountElement = document.getElementById("expenseCount");

const budgetInput = document.getElementById("budgetInput");
const updateBudgetBtn = document.getElementById("updateBudgetBtn");

const budgetStatus = document.getElementById("budgetStatus");
const budgetProgress = document.getElementById("budgetProgress");
const budgetPercentage = document.getElementById("budgetPercentage");
const budgetMessage = document.getElementById("budgetMessage");
const progressTrack = document.getElementById("progressTrack");

const formMessage = document.getElementById("formMessage");
const emptyMessage = document.getElementById("emptyMessage");
const clearExpensesBtn = document.getElementById("clearExpensesBtn");


/* ==========================================
   2. APPLICATION DATA
========================================== */

function loadSavedBudget() {

    try {
        const savedBudget = localStorage.getItem("spendwiseBudget");

        if (savedBudget === null) {
            return 20000;
        }

        const value = Number(savedBudget);

        if (Number.isFinite(value) && value >= 0) {
            return value;
        }

        return 20000;

    } catch (error) {
        console.error("Unable to load budget:", error);
        return 20000;
    }

}


function loadSavedExpenses() {

    try {

        const savedData = localStorage.getItem("spendwiseExpenses");

        if (savedData === null) {
            return [];
        }

        const records = JSON.parse(savedData);

        if (!Array.isArray(records)) {
            return [];
        }

        return records.filter(function(expense) {

            return (
                expense &&
                typeof expense.id === "string" &&
                typeof expense.name === "string" &&
                typeof expense.category === "string" &&
                typeof expense.date === "string" &&
                Number.isFinite(Number(expense.amount)) &&
                Number(expense.amount) > 0
            );

        });

    } catch (error) {

        console.error("Unable to load expenses:", error);

        return [];

    }

}


let budget = loadSavedBudget();

let expenses = loadSavedExpenses();


/* ==========================================
   3. CURRENCY FORMATTER
========================================== */

function formatCurrency(amount) {

    return "KSh " + Number(amount).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


/* ==========================================
   4. SAVE APPLICATION DATA
========================================== */

function saveData() {

    try {

        localStorage.setItem("spendwiseBudget", String(budget));

        localStorage.setItem(
            "spendwiseExpenses",
            JSON.stringify(expenses)
        );

        return true;

    } catch (error) {

        console.error("Unable to save data:", error);

        showMessage(
            "Unable to save data. Check your browser storage.",
            "error"
        );

        return false;

    }

}


/* ==========================================
   5. CALCULATE TOTAL EXPENSES
   Using a FOR...OF LOOP
========================================== */

function calculateTotalExpenses() {

    let total = 0;

    for (const expense of expenses) {

        total += Number(expense.amount);

    }

    return total;

}


/* ==========================================
   6. DISPLAY MESSAGES
========================================== */

function showMessage(message, type) {

    formMessage.textContent = message;

    formMessage.className = "form-message";

    if (type === "success") {

        formMessage.classList.add("success-message");

    } else {

        formMessage.classList.add("error-message");

    }

}


/* ==========================================
   7. UPDATE DASHBOARD
   Using DOM Manipulation
========================================== */

function updateDashboard() {

    const total = calculateTotalExpenses();

    const remaining = budget - total;

    // Update dashboard cards

    totalBudgetElement.textContent = formatCurrency(budget);

    totalExpensesElement.textContent = formatCurrency(total);

    remainingBalanceElement.textContent = formatCurrency(remaining);

    expenseCountElement.textContent = expenses.length;

    budgetInput.value = budget;


    // Calculate budget utilization

    let percentage = 0;

    if (budget > 0) {

        percentage = (total / budget) * 100;

    }

    const progressWidth = Math.min(percentage, 100);

    budgetProgress.style.width = progressWidth + "%";

    budgetPercentage.textContent = percentage.toFixed(1) + "%";

    progressTrack.setAttribute(
        "aria-valuenow",
        progressWidth.toFixed(1)
    );


    // Reset previous status styles

    budgetStatus.className = "status-badge";

    budgetProgress.className = "progress-bar";


    /* ==================================
       8. CONDITIONAL STATEMENTS

       Evaluate budget conditions
    ================================== */

    if (budget === 0) {

        budgetStatus.textContent = "Set Your Budget";

        budgetMessage.textContent =
            "Set a monthly budget to monitor your spending.";

        budgetStatus.classList.add("status-warning");

        budgetProgress.classList.add("warning");

    }

    else if (total > budget) {

        budgetStatus.textContent = "Over Budget";

        budgetMessage.textContent =
            "You have exceeded your budget by " +
            formatCurrency(total - budget) + ".";

        budgetStatus.classList.add("status-danger");

        budgetProgress.classList.add("danger");

    }

    else if (percentage >= 80) {

        budgetStatus.textContent = "Almost Reached";

        budgetMessage.textContent =
            "Warning! You have used " +
            percentage.toFixed(1) +
            "% of your monthly budget.";

        budgetStatus.classList.add("status-warning");

        budgetProgress.classList.add("warning");

    }

    else {

        budgetStatus.textContent = "Within Budget";

        budgetMessage.textContent =
            "Excellent! You are managing your budget well.";

    }


    // Update remaining balance color

    if (remaining < 0) {

        remainingBalanceElement.style.color = "#dc4c54";

    } else {

        remainingBalanceElement.style.color = "#102a56";

    }

}


/* ==========================================
   9. DISPLAY EXPENSE RECORDS
   Using ARRAYS, LOOPS AND DOM
========================================== */

function displayExpenses() {

    // Clear existing records

    expenseList.replaceChildren();


    // Check if there are records

    if (expenses.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    // Display newest expenses first

    const sortedExpenses = [...expenses].sort(function(a, b) {

        return b.date.localeCompare(a.date);

    });


    // Process records using forEach()

    sortedExpenses.forEach(function(expense) {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");

        const categoryCell = document.createElement("td");

        const dateCell = document.createElement("td");

        const amountCell = document.createElement("td");

        const actionCell = document.createElement("td");


        // Expense name

        nameCell.textContent = expense.name;


        // Category

        const categoryBadge = document.createElement("span");

        categoryBadge.className = "category-label";

        categoryBadge.textContent = expense.category;

        categoryCell.appendChild(categoryBadge);


        // Date

        dateCell.textContent = expense.date;


        // Amount

        amountCell.textContent = formatCurrency(expense.amount);


        // Delete button

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-button";

        deleteButton.dataset.id = expense.id;

        deleteButton.setAttribute(
            "aria-label",
            "Delete " + expense.name
        );


        actionCell.appendChild(deleteButton);


        // Add cells to row

        row.append(
            nameCell,
            categoryCell,
            dateCell,
            amountCell,
            actionCell
        );


        // Add row to table

        expenseList.appendChild(row);

    });

}


/* ==========================================
   10. ADD NEW EXPENSE
   Using EVENT LISTENERS
========================================== */

expenseForm.addEventListener("submit", function(event) {

    // Prevent browser page reload

    event.preventDefault();


    // Collect user input

    const name = expenseName.value.trim();

    const amount = Number(expenseAmount.value);

    const category = expenseCategory.value;

    const date = expenseDate.value;


    // Validate user input

    if (!name) {

        showMessage("Please enter an expense name.", "error");

        return;

    }

    if (!Number.isFinite(amount) || amount <= 0) {

        showMessage("Enter a valid amount greater than zero.", "error");

        return;

    }

    if (!category) {

        showMessage("Please select an expense category.", "error");

        return;

    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {

        showMessage("Please select a valid expense date.", "error");

        return;

    }


    // Create a new expense object

    const newExpense = {

        id: crypto.randomUUID(),

        name: name,

        amount: amount,

        category: category,

        date: date

    };


    // Store object inside expenses array

    expenses.push(newExpense);


    // Save data

    if (!saveData()) {

        expenses.pop();

        return;

    }


    // Refresh dashboard and transaction table

    updateDashboard();

    displayExpenses();


    // Reset form

    expenseForm.reset();

    setTodayDate();


    // Display success message

    showMessage("Expense added successfully!", "success");

});


/* ==========================================
   11. UPDATE MONTHLY BUDGET
========================================== */

updateBudgetBtn.addEventListener("click", function() {

    const newBudget = Number(budgetInput.value);


    // Validate budget

    if (
        budgetInput.value.trim() === "" ||
        !Number.isFinite(newBudget) ||
        newBudget < 0
    ) {

        showMessage("Please enter a valid budget.", "error");

        return;

    }


    // Store previous budget

    const previousBudget = budget;

    budget = newBudget;


    // Save updated budget

    if (!saveData()) {

        budget = previousBudget;

        return;

    }


    // Update dashboard

    updateDashboard();

    showMessage("Monthly budget updated successfully!", "success");

});


/* ==========================================
   12. DELETE EXPENSE
   Using EVENT DELEGATION
========================================== */

expenseList.addEventListener("click", function(event) {

    if (event.target.classList.contains("delete-button")) {

        const expenseId = event.target.dataset.id;


        // Find selected expense

        const expenseToDelete = expenses.find(function(expense) {

            return expense.id === expenseId;

        });


        if (!expenseToDelete) {

            return;

        }


        // Ask for confirmation

        const confirmation = confirm(
            "Delete the expense: " + expenseToDelete.name + "?"
        );


        if (confirmation) {

            const previousExpenses = [...expenses];


            // Remove expense from array

            expenses = expenses.filter(function(expense) {

                return expense.id !== expenseId;

            });


            // Save updated records

            if (!saveData()) {

                expenses = previousExpenses;

                return;

            }


            // Update dashboard

            updateDashboard();

            displayExpenses();

            showMessage("Expense deleted successfully!", "success");

        }

    }

});


/* ==========================================
   13. CLEAR ALL EXPENSES
========================================== */

clearExpensesBtn.addEventListener("click", function() {

    if (expenses.length === 0) {

        showMessage("There are no expenses to clear.", "error");

        return;

    }


    const confirmation = confirm(
        "Are you sure you want to delete all expenses?"
    );


    if (confirmation) {

        const previousExpenses = [...expenses];

        expenses = [];


        if (!saveData()) {

            expenses = previousExpenses;

            return;

        }


        updateDashboard();

        displayExpenses();

        showMessage("All expenses cleared successfully!", "success");

    }

});


/* ==========================================
   14. SET TODAY'S DATE
========================================== */

function setTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    expenseDate.value = `${year}-${month}-${day}`;

}


/* ==========================================
   15. INITIALIZE APPLICATION
========================================== */

function initializeSpendWise() {

    setTodayDate();

    updateDashboard();

    displayExpenses();

    console.log("SpendWise successfully initialized!");

}


// Start application

initializeSpendWise();
