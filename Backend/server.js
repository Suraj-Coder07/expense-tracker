const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("./models/Expense");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})


const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connect successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });


app.use(express.json())

app.use(cors());

app.get("/", (req, res) => {
    console.log(req.method);
    console.log(req.url);
    res.send("Expense Tracker Backend is Working!");
});


app.get("/expenses", authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.userId
        }).sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch expenses"
        });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

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

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to register user"
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            name: user.name
        });

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Failed to login "
        });
    }
});

app.post("/expenses", authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            userId: req.userId
        });


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

app.post("/expenses/analyze", authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.userId
        });
        if (expenses.length === 0) {
            return res.status(400).json({
                message: "No expenses  available for analysis"
            });
        }
        const expenseData = expenses.map((expense) => ({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date
        }));

        const prompt = `
        You are a personal finance assistant.

        Analyze the user's expenses below.
         provide: 
         1. Total spending
         2. Highest spending category
         3. Highest individual expense
         4. Spending pattern  or observation 
         5. Two practical saving suggestions

         keep the answer simple and concise.
         Do not invent any information.

         Return the result as valid JSON with exactly these keys:
        totalSpending,
        highestCategory,
        highestExpense,
        spendingPattern,
        savingSuggestions

        savingSuggestions must be an array containing exactly two suggestions.
        Do not use Markdown.
        Return JSON only.

         user expenses: 
         ${JSON.stringify(expenseData)}
        `;

        let response;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents: prompt
                });
                break;

            } catch (error) {
                if (error.status !== 503 || attempt === 3) {
                    throw error;
                }
                await new Promise((resolve) => {
                    setTimeout(resolve, attempt * 2000);
                });
            }
        }

        let responseText = response.text.trim();

        responseText = responseText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let insights;
        try {

            insights = JSON.parse(responseText);

        } catch (error) {

            console.log("AI response JSON parse error:", error);

            return res.status(500).json({
                message: "AI returned an invalid response. Please try again."
            });
        }

        res.status(200).json({
            insights
        });

    } catch (error) {
        console.log(error);

        if (error.status === 429) {
            return res.status(429).json({
                message: "AI quota reached for today. Please try again after the quota resets."
            });
        }

        res.status(500).json({
            message: "Failed to Analyze expenses"
        });
    }
});

app.patch("/expenses/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updateData = { ...req.body };
        delete updateData.userId;

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "Invalid expense id"
            });
        }

        const updatedExpenses = await Expense.findOneAndUpdate(
            {
                id: id,
                userId: req.userId
            },
            updateData,
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

app.delete("/expenses/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: "Invalid expense id"
            });
        }

        const deletedExpense = await Expense.findOne({
            id: id,
            userId: req.userId
        });

        if (!deletedExpense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        await Expense.deleteOne({
            _id: deletedExpense._id
        });

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

app.delete("/expenses", authMiddleware, async (req, res) => {
    try {
        await Expense.deleteMany({
            userId: req.userId
        });

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});