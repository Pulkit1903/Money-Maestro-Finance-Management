import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut
} from '@clerk/nextjs'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { SheetProvider } from '@/providers/sheet-provider'
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
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}