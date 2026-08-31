const express = require("express");

const cors = require("cors");

const app = express();

const expenses = [];

app.use(express.json())

app.use(cors());

app.get("/", (req, res) => {
    console.log(req.method);
    console.log(req.url);
    res.send("Expense Tracker Backend is Working!");
});

app.get("/expenses", (req, res) => {
    res.json(expenses);
});

app.post("/expenses", (req, res) => {
    const expense = req.body

    expenses.push(expense);
    console.log(expense)

    res.status(201).json({
        message: "Expense received successfully",
        expense
    });
});

app.delete("/expenses/:id", (req, res) => {
    const id = Number(req.params.id);

    const expenseIndex = expenses.findIndex(function(expense) {
        return expense.id === id;
    });

    if(expenseIndex === -1) {
        return res.status(404).json({
            message: "Expense not found"
        })
    }

    expenses.splice(expenseIndex, 1)

    res.status(200).json({
        message: "Expense Deleted successfully"
    })
})

app.delete("/expenses", (req, res) => {
    expenses.length = 0;

    res.status(200).json({
        message: "All expenses deleted successfully"
    });
})

app.patch("/expenses/:id", (req, res) => {
    const id = Number(req.params.id);

    const expense = expenses.find(function (expense){
        return expense.id === id;
    });

    if(!expense){
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    expense.title = req.body.title;
    expense.amount = req.body.amount;
    expense.category = req.body.category;

    res.status(200).json({
        message: "Expense Update Successfully",
        expense
    });
})

app.listen(3000, () => {
    console.log("Server is running port 3000...")
});