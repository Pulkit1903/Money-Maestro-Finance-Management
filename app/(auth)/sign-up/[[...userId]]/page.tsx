import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-b from-stone-400 to-stone-600">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-3xl text-[#394149]">Welcome Back!</h1>
          <p className="text-base text-[#394149]">
            Log in or Create account to get back to your dashboard!
          </p>
        </div>
        <div className="flex items-center justify-center mt-8">
          <ClerkLoaded>
            <SignUp />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="animate-spin text-muted-foreground" />
          </ClerkLoading>
        </div>
      </div>
      <div className="h-full hidden lg:flex flex-col items-center justify-center">
        <div className="text-center">
          <Image src="/logo.svg" height={500} width={500} alt="Logo" />
          <h1 className="text-[#394149] text-6xl font-bold mt-6">Money Maestro</h1>
        </div>
      </div>
    </div>
  );
}
