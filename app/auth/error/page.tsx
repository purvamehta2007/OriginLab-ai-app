import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong during sign in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <p className="text-sm text-muted-foreground bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  An unspecified error occurred. Please try again.
                </p>
              )}
              <Link
                href="/auth/login"
                className="block w-full text-center text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
              >
                Back to Login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

