const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;