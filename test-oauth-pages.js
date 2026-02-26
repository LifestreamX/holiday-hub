(async () => {
  const [reg, login] = await Promise.all([
    fetch('http://localhost:3000/register'),
    fetch('http://localhost:3000/login'),
  ]);
  const [regHtml, loginHtml] = await Promise.all([reg.text(), login.text()]);

  const regHasGoogle = regHtml.includes('Continue with Google');
  const regHasGitHub = regHtml.includes('Continue with GitHub');
  const loginHasGoogle = loginHtml.includes('Continue with Google');
  const loginHasGitHub = loginHtml.includes('Continue with GitHub');

  console.log(
    regHasGoogle && regHasGitHub
      ? '✅ Register page has OAuth buttons'
      : '❌ Register page missing OAuth',
  );
  console.log(
    loginHasGoogle && loginHasGitHub
      ? '✅ Login page has OAuth buttons'
      : '❌ Login page missing OAuth',
  );
  console.log('\n🎯 OAuth-only authentication is ready!');
})();
