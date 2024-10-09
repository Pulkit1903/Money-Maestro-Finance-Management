import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { SignUp, ClerkLoaded, ClerkLoading} from '@clerk/nextjs';

const SignUpPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="h-full bg-gradient-to-r from-emerald-100 to-emerald-400 lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-3xl text-[#0F0F0F]">
            Welcome Back!
          </h1>
          <p className="text-base text-[#0F0F0F]">
            Log In or Create an account to view your dashboard.
          </p>
        </div>
        <div className="flex items-center justify-center mt-8">
        <ClerkLoaded>
          <SignUp/>
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2/>
        </ClerkLoading>
        </div>
      </div>
      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 lg:flex items-center justify-center">
        <Image src = "/logo.svg" height={300} width={300} alt="Logo"></Image>
      </div>
    </div>
  );
};
export default SignUpPage;