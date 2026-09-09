const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("./models/Expense");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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

app.post("/register", async (req, res) => {
    try{
        const {name, email, password} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(201).json({
            message: "User register successfully",
            user: safeUser
        });

    }catch(error){
        console.log(error);

        res.status(500).json({
            message: "Failed to register user"
        });
    }
});

app.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({ email: email });

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    }catch(error){
        console.log(erro)

        res.status(500).json({
            message: "Failed to login "
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

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Please enter valid expense details"
            });
        }

        res.status(500).json({
            message: "Failed to save expense"
        });
    }
});

app.patch("/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "Invalid expense id"
            });
        }

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

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Please enter valid expense details"
            });
        }

        res.status(500).json({
            message: "Failed to Update expense"
        })
    }
})

app.delete("/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "Invalid expense id"
            });
        }

        const deletedExpense = await Expense.findOneAndDelete({ id: id });

        if (!deletedExpense) {
            return res.status(404).json({
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
    try {
        await Expense.deleteMany({});

        res.status(200).json({
            message: "All expenses deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to delete all Expense"
        });
    }
});

app.listen(3000, () => {
    console.log("Server is running port 3000...")
});