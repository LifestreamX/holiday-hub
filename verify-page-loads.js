// Quick test to verify the new registration page is working
(async () => {
  try {
    const res = await fetch('http://localhost:3000/register');
    const text = await res.text();

    if (text.includes('Create your account')) {
      console.log('✅ Registration page is loading correctly');
      console.log('✅ Page title found in HTML');
    } else {
      console.log('❌ Page title not found');
    }

    if (text.includes('At least 6 characters')) {
      console.log('✅ Form fields are present');
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Open http://localhost:3000/register in your browser');
    console.log('2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
    console.log('3. Open DevTools Console (F12)');
    console.log('4. Fill in the form and click "Create Account"');
    console.log('5. Watch the Console for validation messages');
    console.log('\nExpected behavior:');
    console.log(
      '  • Red borders appear on invalid fields after you click away',
    );
    console.log('  • "Passwords do not match" shows in real-time');
    console.log('  • Console shows "🚀 Form submit triggered"');
    console.log('  • No page refresh occurs');
    console.log('  • Success or error message appears at top of form');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
