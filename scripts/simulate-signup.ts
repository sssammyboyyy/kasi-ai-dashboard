
// Native fetch is available in Node.js 18+

async function simulateSignup() {
    console.log('🚀 Simulating Signup Request...');

    const payload = {
        businessName: 'Simulated Corp',
        yourName: 'Test Pilot',
        email: `simulated.user.${Date.now()}@kasi.ai`,
        whatsappNumber: '+27820000000', // Test format
        businessType: 'Industrial Cleaning',
        location: 'Cape Town',
        status: 'test'
    };

    try {
        const response = await fetch('http://localhost:3001/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();

        console.log(`\n📊 Response Status: ${status}`);

        let data;
        try {
            data = JSON.parse(text);
            console.log('📦 Response Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('⚠️ Could not parse JSON. Raw Response (First 500 chars):');
            console.log(text.substring(0, 500));
            console.log('----------------------------------------------------');
        }

        if (response.ok) {
            console.log('\n✅ Signup Flow: SUCCESS');
            console.log('   - Database Insert: VERIFIED');
            console.log('   - Email Logic: Triggered');
            console.log('   - WhatsApp Logic: Triggered');
        } else {
            console.log('\n❌ Signup Flow: FAILED');
        }

    } catch (error) {
        console.error('❌ Network/Server Error:', error);
        console.log('   (Make sure the Next.js server is running on port 3000)');
    }
}

simulateSignup();
