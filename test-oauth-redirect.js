const testOAuth = async () => {
  try {
    console.log('Testing Google OAuth endpoint...');
    const url = 'http://localhost:3000/api/auth/signin/google?callbackUrl=/dashboard';
    
    const response = await fetch(url, {
      redirect: 'manual' // Don't follow redirects
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const location = response.headers.get('location');
    if (location) {
      console.log('Redirects to:', location);
      console.log('✅ OAuth redirect is working!');
      
      // Check if it's Google's OAuth URL
      if (location.includes('accounts.google.com')) {
        console.log('✅ Redirect is to Google OAuth');
      } else {
        console.log('❌ Unexpected redirect URL');
      }
    } else {
      console.log('❌ No redirect found');
      const text = await response.text();
      console.log('Response:', text.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testOAuth();
