// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSSRSassClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next')
    const providerError = requestUrl.searchParams.get('error')
    const providerErrorCode = requestUrl.searchParams.get('error_code')

    if (providerError || providerErrorCode) {
        console.warn('Auth provider callback failed', {
            error: providerError,
            errorCode: providerErrorCode,
        })
        return NextResponse.redirect(new URL('/auth/login?error=auth_provider_failed', request.url))
    }

    if (code) {
        const supabase = await createSSRSassClient()
        const client = supabase.getSupabaseClient()

        const { error: exchangeError } = await supabase.exchangeCodeForSession(code)
        if (exchangeError) {
            console.warn('Auth callback code exchange failed', {
                message: exchangeError.message,
                status: exchangeError.status,
            })
            return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
        }

        // Check MFA status
        const { data: aal, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel()

        if (aalError) {
            console.error('Error checking MFA status:', aalError)
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // If user needs to complete MFA verification
        if (aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
            return NextResponse.redirect(new URL('/auth/2fa', request.url))
        }

        // If `next` was provided (e.g. invite flow → /auth/reset-password?invite=true),
        // honour it as long as it's a same-origin relative path.
        if (next && next.startsWith('/') && !next.startsWith('//')) {
            return NextResponse.redirect(new URL(next, request.url))
        }

        // If MFA is not required or already verified, proceed to app
        return NextResponse.redirect(new URL('/app', request.url))
    }

    // If no code or provider error was provided, redirect to a generic auth error.
    return NextResponse.redirect(new URL('/auth/login?error=auth_callback_missing_code', request.url))
}