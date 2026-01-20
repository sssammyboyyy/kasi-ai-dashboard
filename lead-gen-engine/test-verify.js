
import { SMTPVerifier } from './src/enricher/verifier.js';

async function test() {
    console.log('🧪 Testing SMTP Verification...');

    // 1. Valid Email (Github Support)
    console.log('\n➤ Checking valid email (support@github.com)...');
    const valid = await SMTPVerifier.verify('support@github.com');
    console.log('Result:', valid);

    // 2. Invalid Email (Random string)
    console.log('\n➤ Checking invalid email (nonexistent_user_12345@github.com)...');
    const invalid = await SMTPVerifier.verify('nonexistent_user_12345@github.com');
    console.log('Result:', invalid);

    // 3. Invalid Domain
    console.log('\n➤ Checking invalid domain (user@nonexistent-domain-xyz.com)...');
    const badDomain = await SMTPVerifier.verify('user@nonexistent-domain-xyz.com');
    console.log('Result:', badDomain);
}

test();
