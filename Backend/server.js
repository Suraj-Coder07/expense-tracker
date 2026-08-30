const express = require("express");

const app = express();

const expenses = [];

app.use(express.json())

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

    res.status(200).json({
        message: "Expense received successfully",
        expense
    });
});

app.delete("/expenses/:id", (req, res) => {
    const id = req.params.id;

    if(id < 0 || id >= expenses.length){
        return res.status(404).json({
            message: "Expense not found"
        })
    }

    expenses.splice(id, 1)

    res.status(200).json({
        message: "Expense Deleted successfully"
    })
})

app.listen(3000, () => {
    console.log("Server is running port 3000...")
});