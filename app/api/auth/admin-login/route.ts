import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[v0] Admin login attempt for:', email);

    // Get user via admin API
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(
      email
    ).catch(async () => {
      // If direct lookup fails, try fetching all users and finding by email
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) return { data: null, error };
      const user = data.users?.find(u => u.email === email);
      return { data: user, error: null };
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a session for the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[v0] Login error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.log('[v0] Login successful for:', email);

    return NextResponse.json({
      success: true,
      session: data.session,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Admin login error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
