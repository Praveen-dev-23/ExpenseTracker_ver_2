import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Other'];
const TRANSACTION_TYPES = ['income', 'expense'];

const sampleTransactions = [
  // Income
  { title: 'Monthly Salary', amount: 5000, category: 'Salary', type: 'income' },
  { title: 'Freelance Project', amount: 1200, category: 'Other', type: 'income' },
  { title: 'Investment Return', amount: 300, category: 'Other', type: 'income' },
  
  // Expenses
  { title: 'Grocery Shopping', amount: 150, category: 'Food', type: 'expense' },
  { title: 'Restaurant Dinner', amount: 85, category: 'Food', type: 'expense' },
  { title: 'Coffee Shop', amount: 12, category: 'Food', type: 'expense' },
  { title: 'Electric Bill', amount: 120, category: 'Bills', type: 'expense' },
  { title: 'Internet Bill', amount: 60, category: 'Bills', type: 'expense' },
  { title: 'Phone Bill', amount: 45, category: 'Bills', type: 'expense' },
  { title: 'Flight Tickets', amount: 450, category: 'Travel', type: 'expense' },
  { title: 'Hotel Booking', amount: 200, category: 'Travel', type: 'expense' },
  { title: 'New Laptop', amount: 1200, category: 'Shopping', type: 'expense' },
  { title: 'Clothing', amount: 150, category: 'Shopping', type: 'expense' },
  { title: 'Books', amount: 45, category: 'Shopping', type: 'expense' },
  { title: 'Gas Station', amount: 60, category: 'Other', type: 'expense' },
  { title: 'Car Maintenance', amount: 300, category: 'Other', type: 'expense' },
];

// Generate random date within last 6 months
const getRandomDate = () => {
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user
    const user = new User({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
    });
    await user.save();
    console.log('Created demo user');

    // Create sample transactions
    const transactions = sampleTransactions.map(t => ({
      ...t,
      date: getRandomDate(),
      userId: user._id,
    }));

    // Add more random transactions
    for (let i = 0; i < 30; i++) {
      const isIncome = Math.random() < 0.3; // 30% chance of income
      transactions.push({
        title: `${isIncome ? 'Income' : 'Expense'} ${i + 1}`,
        amount: Math.floor(Math.random() * 500) + 10,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        type: isIncome ? 'income' : 'expense',
        date: getRandomDate(),
        userId: user._id,
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} sample transactions`);

    console.log('\n=== Seed completed successfully! ===');
    console.log('Demo user credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();