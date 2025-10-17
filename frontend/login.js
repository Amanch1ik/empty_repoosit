const { execSync } = require('child_process');

async function loginToExpo() {
  try {
    // Выполнение входа через npx
    execSync('npx expo login', { stdio: 'inherit' });
    console.log('Успешный вход в Expo');
  } catch (error) {
    console.error('Ошибка входа:', error.message);
  }
}

loginToExpo();
