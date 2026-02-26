// Browser console test script for registration form
// Run this in the browser console at http://localhost:3000/register

console.log('🧪 Starting registration form UI validation tests...\n');

// Helper to wait for a short time
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to simulate user input
function fillInput(selector, value) {
  const input = document.querySelector(selector);
  if (!input) {
    console.error(`❌ Could not find input: ${selector}`);
    return false;
  }
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

// Helper to click a button
function clickButton(selector) {
  const button = document.querySelector(selector);
  if (!button) {
    console.error(`❌ Could not find button: ${selector}`);
    return false;
  }
  button.click();
  return true;
}

// Helper to check if error is displayed
function checkError(expectedError) {
  const errorDiv = document.querySelector('.bg-red-50.border.border-red-200');
  if (errorDiv && errorDiv.textContent.includes(expectedError)) {
    return true;
  }
  return false;
}

async function runUITests() {
  console.log('\n📝 Test 1: Empty form submission');
  clickButton('button[type="submit"]');
  await wait(100);
  if (checkError('Email is required')) {
    console.log('✅ PASS: Shows "Email is required"');
  } else {
    console.log('❌ FAIL: Did not show correct error');
  }

  console.log('\n📝 Test 2: Invalid email format');
  fillInput('input[type="email"]', 'not-an-email');
  clickButton('button[type="submit"]');
  await wait(100);
  if (checkError('valid email')) {
    console.log('✅ PASS: Shows invalid email error');
  } else {
    console.log('❌ FAIL: Did not show email validation error');
  }

  console.log('\n📝 Test 3: Password too short');
  fillInput('input[type="email"]', 'test@example.com');
  fillInput('#password', '12345');
  clickButton('button[type="submit"]');
  await wait(100);
  if (checkError('at least 6 characters')) {
    console.log('✅ PASS: Shows password length error');
  } else {
    console.log('❌ FAIL: Did not show password length error');
  }

  console.log('\n📝 Test 4: Mismatched passwords (YOUR REPORTED ISSUE)');
  fillInput('input[type="email"]', 'test@example.com');
  fillInput('#password', 'password123');
  fillInput('#confirmPassword', 'different456');
  await wait(100);

  // Check if visual indicator appears
  const confirmInput = document.querySelector('#confirmPassword');
  const hasRedBorder = confirmInput?.classList.contains('border-red-500');
  if (hasRedBorder) {
    console.log('✅ Visual feedback: Red border on confirm password');
  } else {
    console.log('⚠️ Visual feedback: No red border (should appear)');
  }

  // Check if inline error message appears
  const inlineError = document.querySelector('.text-red-600.text-sm');
  if (inlineError && inlineError.textContent.includes('do not match')) {
    console.log('✅ Visual feedback: Inline "Passwords do not match" message');
  } else {
    console.log('⚠️ Visual feedback: No inline error (should appear)');
  }

  // Check if button is disabled
  const submitButton = document.querySelector('button[type="submit"]');
  if (submitButton?.disabled) {
    console.log('✅ Button is DISABLED (prevents submission)');
  } else {
    console.log('⚠️ Button is enabled (will try to submit)');
  }

  clickButton('button[type="submit"]');
  await wait(100);

  if (checkError('Passwords do not match')) {
    console.log(
      '✅ PASS: Shows "Passwords do not match" error after clicking submit',
    );
  } else {
    console.log('❌ FAIL: Did not show password mismatch error');
  }

  // Check if form values are preserved
  const emailValue = document.querySelector('input[type="email"]')?.value;
  const passwordValue = document.querySelector('#password')?.value;
  const confirmValue = document.querySelector('#confirmPassword')?.value;

  if (emailValue && passwordValue && confirmValue) {
    console.log('✅ Form values are PRESERVED (not cleared)');
  } else {
    console.log('❌ FAIL: Form was cleared (THIS WAS YOUR ISSUE!)');
  }

  console.log('\n📝 Test 5: Matching passwords');
  fillInput('#confirmPassword', 'password123');
  await wait(100);

  if (!submitButton?.disabled) {
    console.log('✅ Button is enabled when passwords match');
  } else {
    console.log('❌ Button is still disabled');
  }

  if (!checkError('do not match')) {
    console.log('✅ Error message cleared when passwords match');
  } else {
    console.log('⚠️ Error message still showing');
  }

  console.log('\n🎉 All UI tests completed!');
  console.log('\n📌 KEY FIXES:');
  console.log('  1. Form NO LONGER clears when validation fails');
  console.log('  2. Error messages stay visible until corrected');
  console.log('  3. Button disables when passwords mismatch');
  console.log('  4. Visual feedback with red border and inline error');
  console.log(
    '\n👉 Try it yourself: Enter mismatched passwords and click "Create Account"',
  );
}

// Run the tests
runUITests();
