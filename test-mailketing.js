// Test script untuk Mailketing API
const testMailketing = async () => {
  const apiToken = 'ecf1b66b8ca97dcfaff3045fa1993b57';
  const fromName = 'VibeCodingPOS';
  const fromEmail = 'go.jdkofficial@gmail.com';
  const apiUrl = 'https://api.mailketing.co.id/api/v1/send';

  console.log('🧪 Testing Mailketing API...');
  console.log('📧 Config:', {
    fromName,
    fromEmail,
    apiTokenLength: apiToken.length,
    apiUrl
  });

  try {
    const formData = new FormData();
    formData.append('api_token', apiToken);
    formData.append('from_name', fromName);
    formData.append('from_email', fromEmail);
    formData.append('recipient', fromEmail); // Send to self for testing
    formData.append('subject', 'Test Email - VibePOS');
    formData.append('content', '<p>Test email dari VibePOS</p>');

    console.log('📤 Sending request...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 Response data:', result);
    
    if (result.status === 'success') {
      console.log('✅ Test berhasil!');
    } else {
      console.log('❌ Test gagal:', result.response);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
  }
};

testMailketing();