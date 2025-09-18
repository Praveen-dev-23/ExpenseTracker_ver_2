import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { transactionAPI } from '../utils/api.js';

const TransactionContext = createContext();

const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t._id === action.payload._id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t._id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export function TransactionProvider({ children }) {
  const [state, dispatch] = useReducer(transactionReducer, {
    transactions: [],
    loading: false,
    error: null,
  });

  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await transactionAPI.getAll(filters);
      dispatch({ type: 'SET_TRANSACTIONS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch transactions' });
    }
  }, []);

  const addTransaction = async (transactionData) => {
    try {
      const response = await transactionAPI.create(transactionData);
      dispatch({ type: 'ADD_TRANSACTION', payload: response.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to add transaction' });
      return { success: false, error: error.response?.data?.message || 'Failed to add transaction' };
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await transactionAPI.update(id, transactionData);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: response.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update transaction' });
      return { success: false, error: error.response?.data?.message || 'Failed to update transaction' };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionAPI.delete(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete transaction' });
      return { success: false, error: error.response?.data?.message || 'Failed to delete transaction' };
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};