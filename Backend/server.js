const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("./models/Expense");


const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connect successfully");
    })
    .catch((error) =>{
        console.log("MongoDB connection error:", error);
    });


const expenses = [];

app.use(express.json())

app.use(cors());

app.get("/", (req, res) => {
    console.log(req.method);
    console.log(req.url);
    res.send("Expense Tracker Backend is Working!");
});

app.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find().sort({date: -1});

        res.json(expenses);
    }catch(error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch expenses"
        });
    }
});

app.post("/expenses", async (req, res) => {
    try {
        const expense = await Expense.create(req.body);

        console.log("MongoDB me save hua:", expense);

        res.status(201).json({
            message: "Expense saved successfully",
            expense
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to save expense"
        });
    }
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