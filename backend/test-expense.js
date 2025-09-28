// Test script to identify expense creation error
const fetch = require('node-fetch');

async function testExpenseCreation() {
  try {
    // First, register a test user
    console.log('1. Testing user registration...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    if (!registerData.token) {
      console.log('Registration failed, trying login...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123'
        })
      });
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      if (!loginData.token) {
        throw new Error('Both registration and login failed');
      }
      var token = loginData.token;
    } else {
      var token = registerData.token;
    }
    
    // Now test expense creation
    console.log('\n2. Testing expense creation...');
    const expenseResponse = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        description: 'Test expense',
        amount: 25.50,
        category: 'Food & Dining',
        date: new Date().toISOString()
      })
    });
    
    const expenseData = await expenseResponse.json();
    console.log('Expense creation response:', expenseData);
    console.log('Status:', expenseResponse.status);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testExpenseCreation();
