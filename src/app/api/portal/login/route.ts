import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { email, token } = await request.json()

    const { data, error } = await supabase
      .from('employee_portal_access')
      .select('*, employee:employee_id(*)')
      .eq('email', email)
      .eq('access_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await supabase
      .from('employee_portal_access')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id)

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}