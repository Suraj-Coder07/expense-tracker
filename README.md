# Expense Tracker

A full-stack expense management web application that helps users track, manage, filter, and analyze their personal expenses with secure authentication and AI-powered spending insights.

## Live Demo

https://expense-tracker-frontend-v54b.onrender.com

## Features

* User registration and login
* JWT-based authentication
* Add new expenses
* Edit existing expenses
* Delete expenses
* Delete all expenses
* Search expenses
* Filter expenses by category
* Filter expenses by month
* Sort expenses by latest and oldest
* Total expense calculation
* Total transaction count
* Highest expense tracking
* Average expense calculation
* Category-wise spending summary
* Interactive donut chart
* AI-powered spending insights
* AI-generated saving suggestions
* Responsive design for desktop, tablet, and mobile
* MongoDB database for persistent expense storage

## AI Spending Insights

The application uses Google's Gemini API to analyze the user's expenses and provide:

* Total spending
* Highest spending category
* Highest individual expense
* Spending patterns
* Personalized saving suggestions

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* LocalStorage

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt.js
* dotenv

### AI

* Google Gemini API

### Deployment

* Render

## Project Structure

```text
Expense-Tracker/
│
├── Backend/
│   ├── models/
│   │   ├── Expense.js
│   │   └── User.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── index.html
├── script.js
├── style.css
├── .gitignore
└── README.md
```

## Authentication

The application uses JWT authentication to protect user-specific expense data.

Passwords are securely hashed using bcrypt before being stored in the database.

Each authenticated request uses a JWT token to identify the logged-in user.

## Database

MongoDB is used to store:

* User accounts
* Expense records
* User-specific expense data

Each expense is associated with the authenticated user so users can access only their own expenses.

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Suraj-Coder07/expense-tracker.git
```

### 2. Open the project

```bash
cd expense-tracker
```

### 3. Install backend dependencies

```bash
cd Backend
npm install
```

### 4. Create `.env`

Inside the `Backend` folder, create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit the `.env` file to GitHub.

### 5. Start the backend

```bash
npm start
```

### 6. Open the frontend

Open `index.html` in the browser or use a local development server.

## Security

Sensitive environment variables are stored in `.env` and excluded from Git using `.gitignore`.

The application uses:

* bcrypt for password hashing
* JWT for authentication
* User-specific database queries
* Protected API routes

## Future Improvements

* React.js frontend
* Advanced expense analytics
* Charts and reports
* Export expenses to CSV/PDF
* Budget management
* Monthly spending goals
* More advanced AI financial insights

## Author

**Suraj Yadav**

GitHub: https://github.com/Suraj-Coder07
