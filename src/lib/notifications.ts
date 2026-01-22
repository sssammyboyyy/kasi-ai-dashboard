
import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize Clients (Safety check for missing keys)
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

interface NotificationPayload {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    leadLimit?: number;
}

export const notifications = {
    /**
     * Send Welcome Email with Magic Link
     */
    async sendWelcomeEmail({ name, email, businessName }: NotificationPayload) {
        if (!resend) {
            console.warn('⚠️ Resend API Key missing. Skipping email.');
            return { success: false, error: 'Configuration missing' };
        }

        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Kasi AI <onboarding@kasi.ai>',
                to: email,
                subject: `Welcome to Kasi AI, ${name}! 🚀`,
                html: `
                    <h1>Welcome to the Revolution, ${name}!</h1>
                    <p>Your account for <strong>${businessName}</strong> is ready.</p>
                    <p>We are currently establishing your lead pipeline. Expect your first 25 leads to drop shortly.</p>
                    <br/>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kasi.ai'}/dashboard" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                `
            });
            console.log(`📧 Welcome email sent to ${email}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Email failed:', error);
            return { success: false, error };
        }
    },

    /**
     * Send WhatsApp Welcome Message
     */
    async sendWhatsApp({ name, phone, leadLimit = 25 }: NotificationPayload) {
        if (!twilioClient) {
            console.warn('⚠️ Twilio Credentials missing. Skipping WhatsApp.');
            return { success: false, error: 'Configuration missing' };
        }

        const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`;
        // Ensure phone is in E.164 format (e.g. +27...)
        const to = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone.replace(/\s/g, '')}`;

        try {
            await twilioClient.messages.create({
                from,
                to,
                body: `🚀 *Welcome to Kasi AI, ${name}!*
                
We've started your engine. Your first *${leadLimit} FREE leads* are being prepared.

Check your dashboard here: ${process.env.NEXT_PUBLIC_APP_URL || 'https://kasi.ai'}

_Reply STOP to unsubscribe._`
            });
            console.log(`📱 WhatsApp sent to ${to}`);
            return { success: true };
        } catch (error) {
            console.error('❌ WhatsApp failed:', error);
            return { success: false, error };
        }
    }
};
