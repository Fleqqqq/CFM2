import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api'; // Your backend URL
const USE_BACKEND = false; // Set to true to use real API

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async login(email, password) {
    if (!USE_BACKEND) {
      await delay(500); // Simulate network delay
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const account = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password);
      if (!account) throw new Error('Invalid email or password');
      return { user: { name: account.name, email: account.email, isPremium: account.isPremium || false }, token: 'mock-jwt-token' };
    }

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async signup(email, password) {
    if (!USE_BACKEND) {
      await delay(500);
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) throw new Error('Account already exists');
      
      const newAccount = { email: email.toLowerCase(), password, name: email.split('@')[0], isPremium: false };
      accounts.push(newAccount);
      localStorage.setItem('accounts', JSON.stringify(accounts));
      return { user: { name: newAccount.name, email: newAccount.email, isPremium: newAccount.isPremium }, token: 'mock-jwt-token' };
    }

    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  async upgradeToPremium(email) {
    if (!USE_BACKEND) {
      await delay(300);
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const accountIndex = accounts.findIndex(acc => acc.email.toLowerCase() === email.toLowerCase());
      if (accountIndex === -1) throw new Error('Account not found');
      
      const account = accounts[accountIndex];
      account.isPremium = true;
      localStorage.setItem('accounts', JSON.stringify(accounts));
      return { name: account.name, email: account.email, isPremium: account.isPremium };
    }
    // Backend implementation would go here
  },

  async getProjects(user) {
    if (!USE_BACKEND) {
      await delay(300);
      const stored = localStorage.getItem(`projects_${user.email}`);
      return stored ? JSON.parse(stored) : [];
    }

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const res = await fetch(`${API_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async saveProjects(user, projects) {
    if (!USE_BACKEND) {
      localStorage.setItem(`projects_${user.email}`, JSON.stringify(projects));
      return;
    }

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    // Example: Bulk save. In a real app, you might save individual projects.
    await fetch(`${API_URL}/projects/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(projects)
    });
  },
  
  async deleteAccount(email) {
    if (!USE_BACKEND) {
        const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        const updatedAccounts = accounts.filter(acc => acc.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
        localStorage.removeItem(`projects_${email}`);
        localStorage.removeItem(`activeProjectId_${email}`);
        return;
    }
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    await fetch(`${API_URL}/user`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};