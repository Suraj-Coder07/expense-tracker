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
    .catch((error) => {
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
        const expenses = await Expense.find().sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
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

app.patch("/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)

        const updatedExpenses = await Expense.findOneAndUpdate(
            { id: id },
            req.body,
            { returnDocument: "after" }
        );

        if (!updatedExpenses) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }
        res.status(200).json({
            message: "Expense updated successfully",
            expense: updatedExpenses
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to Update expense"
        })
    }
})

app.delete("/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const deletedExpense = await Expense.findOneAndDelete({ id: id });

        if (!deletedExpense) {
            res.status(404).json({
                message: "Expense not found"
            });
        }
        res.status(200).json({
            message: "Expense deleted successfully",
            expense: deletedExpense
        });

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Failed to delete expense"
        });
    }
});

app.delete("/expenses", async (req, res) => {
    try{
        await Expense.deleteMany({});

        res.status(200).json({
            message: "All expense deleted successfully"
        });

    }catch(error){
        console.log(error);

        res.status(500).json({
            message: "Failed to delete all Expense"
        });
    }
});

app.listen(3000, () => {
    console.log("Server is running port 3000...")
});