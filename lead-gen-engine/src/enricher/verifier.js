
import dns from 'dns/promises';
import net from 'net';

/**
 * Premium SMTP Verifier
 * Performs deep verification: Syntax -> DNS MX -> SMTP Handshake
 */
export class SMTPVerifier {
    /**
     * Verify an email address
     * @param {string} email 
     * @returns {Promise<{valid: boolean, reason: string, catchAll: boolean}>}
     */
    static async verify(email) {
        console.log(`[SMTPVerifier] Verifying: ${email}`);

        // 1. Syntax Check
        if (!email || !email.includes('@')) {
            console.log(`[SMTPVerifier] Invalid syntax`);
            return { valid: false, reason: 'invalid_syntax', catchAll: false };
        }

        const [user, domain] = email.split('@');

        try {
            // 2. Resolve MX Records
            console.log(`[SMTPVerifier] Resolving MX for ${domain}...`);
            const mxRecords = await dns.resolveMx(domain);

            if (!mxRecords || mxRecords.length === 0) {
                console.log(`[SMTPVerifier] No MX records found`);
                return { valid: false, reason: 'no_mx_records', catchAll: false };
            }

            // Sort by priority (lowest number = highest priority)
            const bestMx = mxRecords.sort((a, b) => a.priority - b.priority)[0];
            console.log(`[SMTPVerifier] Best MX: ${bestMx.exchange} (Priority: ${bestMx.priority})`);

            // 3. SMTP Handshake
            return await this._performHandshake(email, bestMx.exchange);

        } catch (error) {
            console.log(`[SMTPVerifier] Error: ${error.message}`);
            // DNS failure usually means invalid domain
            if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
                return { valid: false, reason: 'invalid_domain', catchAll: false };
            }
            // Other system errors (network timeout, etc) - fail soft
            console.error(`SMTP Verification System Error for ${email}:`, error.message);
            return { valid: false, reason: `system_error: ${error.message}`, catchAll: false };
        }
    }

    static async _performHandshake(email, mxHost) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            let step = 0;
            let responseBuffer = '';
            let isCatchAll = false;
            let isValid = false;
            let reason = 'timeout';

            // Timeout after 5 seconds (fast fail)
            socket.setTimeout(5000);

            const send = (cmd) => {
                socket.write(cmd + '\r\n');
            };

            const cleanup = () => {
                socket.destroy();
                resolve({ valid: isValid, reason, catchAll: isCatchAll });
            };

            socket.on('connect', () => {
                // Connection established, wait for greeting
                // Step 0: Initial Greeting
            });

            socket.on('data', (data) => {
                responseBuffer = data.toString();
                const code = parseInt(responseBuffer.substring(0, 3));
                const randomUser = `pkg_verify_${Math.random().toString(36).substring(7)}@${email.split('@')[1]}`;

                // Deep Verification State Machine
                switch (step) {
                    case 0: // Greeting (220)
                        if (code === 220) {
                            step++;
                            send(`HELO lead-gen-suite.com`);
                        } else {
                            reason = 'greeting_refused';
                            cleanup();
                        }
                        break;

                    case 1: // HELO Response (250)
                        if (code === 250) {
                            step++;
                            send(`MAIL FROM:<check@lead-gen-suite.com>`);
                        } else {
                            reason = 'helo_refused';
                            cleanup();
                        }
                        break;

                    case 2: // MAIL FROM Response (250)
                        if (code === 250) {
                            step++;
                            // Check the REAL user first
                            send(`RCPT TO:<${email}>`);
                        } else {
                            reason = 'mail_from_refused';
                            cleanup();
                        }
                        break;

                    case 3: // RCPT TO (Target) Response
                        if (code === 250) {
                            // Target is valid! But is it catch-all?
                            // Proceed to check random user
                            step++;
                            send(`RCPT TO:<${randomUser}>`);
                        } else if (code === 550) {
                            // Target rejected explicitly -> Invalid
                            isValid = false;
                            reason = 'mailbox_not_found';
                            step = 99; // Jump to quit
                            send('QUIT');
                        } else {
                            isValid = false;
                            reason = `server_response_${code}`;
                            step = 99;
                            send('QUIT');
                        }
                        break;

                    case 4: // RCPT TO (Random/Catch-All Probe) Response
                        if (code === 250) {
                            // Random user accepted -> Catch-All detected!
                            isValid = true;
                            isCatchAll = true;
                            reason = 'catch_all_detected';
                        } else {
                            // Random user rejected -> Target was valid and NOT catch-all! (Gold Standard)
                            isValid = true;
                            isCatchAll = false;
                            reason = 'mailbox_confirmed_safe';
                        }
                        step++;
                        send('QUIT');
                        break;

                    case 5: // Quit (after Step 4)
                        cleanup();
                        break;

                    case 99: // Quit (after Rejection)
                        cleanup();
                        break;
                }
            });

            socket.on('timeout', () => {
                reason = 'timeout';
                cleanup();
            });

            socket.on('error', (err) => {
                reason = `socket_error: ${err.message}`;
                cleanup();
            });

            // Initiate connection
            console.log(`[SMTPVerifier] Connecting to ${mxHost}:25...`);
            socket.connect(25, mxHost);
        });
    }
}
