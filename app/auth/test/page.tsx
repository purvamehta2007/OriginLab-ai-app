'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error('[v0] Auth check error:', error.message)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (err) {
        console.error('[v0] Auth check exception:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Status</CardTitle>
              <CardDescription>Check if you&apos;re logged in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {user ? (
                  <>
                    <div className="space-y-2 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="text-sm font-medium text-green-900 dark:text-green-300">
                        ✓ You are logged in!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Email: <span className="font-mono">{user.email}</span>
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        ID: <span className="font-mono">{user.id?.substring(0, 8)}...</span>
                      </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-300">
                        ⚠ You are not logged in
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-400">
                        Please sign up or log in to continue
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Link href="/auth/sign-up" className="w-full block">
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                      <Link href="/auth/login" className="w-full block">
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                    </div>
                  </>
                )}

                <Link href="/" className="text-center">
                  <p className="text-xs text-muted-foreground hover:underline">
                    Back to Home
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-xs text-muted-foreground">
                <li>1. Go to Supabase Dashboard</li>
                <li>2. Authentication → Providers → Email</li>
                <li>3. Toggle OFF: Email Rate Limiting</li>
                <li>4. Toggle OFF: Confirm email</li>
                <li>5. Save and refresh this page</li>
              </ol>
              <Link
                href="/AUTHENTICATION_FIX.md"
                className="mt-3 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                View detailed setup guide →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
