/**
 * Master Test Runner
 * Runs all comprehensive tests for the Holiday Hub application
 */

const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(script, name) {
  return new Promise((resolve, reject) => {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`🚀 Running: ${name}`, 'cyan');
    log('='.repeat(60), 'cyan');

    const startTime = Date.now();
    const child = spawn('node', [script], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        log(`\n✓ ${name} completed successfully in ${duration}s`, 'green');
        resolve({ name, success: true, duration });
      } else {
        log(`\n✗ ${name} failed with code ${code} after ${duration}s`, 'red');
        resolve({ name, success: false, duration, code });
      }
    });

    child.on('error', (error) => {
      log(`\n✗ ${name} error: ${error.message}`, 'red');
      resolve({ name, success: false, error: error.message });
    });
  });
}

async function runAllTests() {
  log('\n🎯 HOLIDAY HUB - COMPREHENSIVE TEST SUITE', 'magenta');
  log('Running all tests sequentially...\n', 'magenta');

  const tests = [
    { script: 'comprehensive-settings-tests.js', name: 'Settings & Configuration Tests (30 tests)' },
    { script: 'comprehensive-email-tests.js', name: 'Email Notification Tests (55 tests)' },
    { script: 'comprehensive-push-tests.js', name: 'Push Notification Tests (55 tests)' },
  ];

  const results = [];
  const overallStart = Date.now();

  for (const test of tests) {
    const result = await runTest(test.script, test.name);
    results.push(result);
  }

  const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(2);

  // Final Summary
  log('\n' + '='.repeat(60), 'magenta');
  log('📊 MASTER TEST SUMMARY', 'magenta');
  log('='.repeat(60), 'magenta');

  results.forEach((result, index) => {
    const icon = result.success ? '✓' : '✗';
    const color = result.success ? 'green' : 'red';
    log(`${icon} ${result.name} - ${result.duration}s`, color);
  });

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  log('\n' + '='.repeat(60), 'cyan');
  log(`✓ Test Suites Passed: ${successCount}`, successCount > 0 ? 'green' : 'red');
  log(`✗ Test Suites Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  log(`⏱️  Total Duration: ${overallDuration}s`, 'cyan');
  log(`📧 Total Tests: 140 (30 settings + 55 email + 55 push)`, 'cyan');

  const allPassed = successCount === tests.length;
  log(
    `\n${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}`,
    allPassed ? 'green' : 'yellow'
  );

  process.exit(allPassed ? 0 : 1);
}

// Run all tests
runAllTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
