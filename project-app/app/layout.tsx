import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut
} from '@clerk/nextjs'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { SheetProvider } from '@/providers/sheet-provider'
import { Toaster } from '@/components/ui/sonner'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
          </SignedOut>
          <SignedIn>
          </SignedIn>
          <QueryProvider>
            <SheetProvider/>
            <Toaster/>
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}