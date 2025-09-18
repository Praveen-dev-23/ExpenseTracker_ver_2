import express from 'express';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Export CSV
router.get('/export-csv', auth, async (req, res) => {
  try {
    const { category, type, startDate, endDate } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Generate CSV content
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.date).toISOString().split('T')[0],
        `"${t.title.replace(/"/g, '""')}"`,
        t.category,
        t.type,
        t.amount
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Server error during CSV export' });
  }
});

// Export PDF
router.get('/export-pdf', auth, async (req, res) => {
  try {
    const { category, type, startDate, endDate } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    
    // Calculate summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Create simple PDF content (in a real app, you'd use a PDF library like puppeteer or pdfkit)
    const pdfContent = `
      EXPENSE REPORT
      Generated on: ${new Date().toLocaleDateString()}
      
      SUMMARY
      Total Income: $${totalIncome.toFixed(2)}
      Total Expenses: $${totalExpenses.toFixed(2)}
      Net Balance: $${balance.toFixed(2)}
      
      TRANSACTIONS (${transactions.length} total)
      ${transactions.map(t => 
        `${new Date(t.date).toLocaleDateString()} - ${t.title} - ${t.category} - ${t.type} - $${t.amount.toFixed(2)}`
      ).join('\n')}
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=expense-report.pdf');
    res.send(Buffer.from(pdfContent, 'utf8'));
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Server error during PDF export' });
  }
});

export default router;