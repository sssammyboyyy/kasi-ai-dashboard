
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { notifications } from '@/lib/notifications';

// Service Role Client for Admin Access (Bypass RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            businessName,
            yourName,
            email,
            whatsappNumber,
            // ... other fields can be stored in onboarding_data
            ...surveyData
        } = body;

        // 1. Validation (Basic)
        if (!email || !whatsappNumber || !businessName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 2. Insert into Users Table
        const { data: user, error: dbError } = await supabase
            .from('users')
            .insert({
                email,
                phone: whatsappNumber,
                business_name: businessName,
                niche: surveyData.businessType,
                location: surveyData.location,
                onboarding_data: surveyData, // Store the rest as JSON
                credits: 25,
                status: 'active'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database Insert Error:', dbError);
            // Handle duplicate email gracefuly
            if (dbError.code === '23505') { // Unique violation
                return NextResponse.json(
                    { error: 'Email already registered' },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: 'Failed to create account' },
                { status: 500 }
            );
        }

        // 3. Send Omni-Channel Notifications (Parallel)
        const notificationPayload = {
            name: yourName,
            email,
            phone: whatsappNumber,
            businessName,
            leadLimit: 25
        };

        const [emailResult, whatsappResult] = await Promise.all([
            notifications.sendWelcomeEmail(notificationPayload),
            notifications.sendWhatsApp(notificationPayload)
        ]);

        return NextResponse.json({
            success: true,
            user,
            notifications: {
                email: emailResult.success,
                whatsapp: whatsappResult.success
            }
        });

    } catch (error) {
        console.error('Signup API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
