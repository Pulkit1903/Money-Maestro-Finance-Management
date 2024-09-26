import React from 'react';
import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="center-container">
      <SignIn />
    </div>
  );
};

export default SignInPage;