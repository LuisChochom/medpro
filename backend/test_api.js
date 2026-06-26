async function run() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@lcmedica.com',
        password: 'SecurePassword123!'
      })
    });
    const loginData = await loginRes.json();
    
    if (!loginRes.ok) {
      console.error('Login Error:', loginData);
      return;
    }

    console.log('Login exitoso. Token:', loginData.token.substring(0, 20) + '...');
    const token = loginData.token;

    const usersRes = await fetch('http://localhost:5000/api/v1/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const usersData = await usersRes.json();
    console.log('Usuarios obtenidos (status):', usersRes.status);
    if (!usersRes.ok) {
      console.error('Users Error:', usersData);
    } else {
      console.log('Usuarios count:', usersData.data.length);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
