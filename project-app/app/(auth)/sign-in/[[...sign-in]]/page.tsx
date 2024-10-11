import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-stone-300 to-stone-600 relative">
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-20"
        style={{ backgroundImage: 'url(/logo.svg)' }}
      ></div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8">
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.svg" height={100} width={100} alt="Logo" />
          <h1 className="font-bold text-7xl text-[#394149] ml-2">Money Maestro</h1>
        </div>
        <div className="flex items-center justify-center w-full">
          <ClerkLoaded>
            <SignIn
              appearance={{
                elements: {
                  card: "bg-gradient-to-r from-stone-300 to-stone-400 shadow-none",
                  cardHeader: "hidden",
                  formButtonPrimary: "bg-[#394149] text-white hover:bg-[#3d3d3d]",
                  input: "bg-gradient-to-r from-stone-300 to-stone-400 border border-gray-300 text-[#394149] font-bold", // Email input box styling
                  inputLabel: "text-[##394149]",
                  headerTitle: "hidden",
                  footerActionLink: "text-[#394149]",
                },
              }}
            />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="animate-spin" />
          </ClerkLoading>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
