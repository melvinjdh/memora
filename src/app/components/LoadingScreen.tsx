import React from 'react';
import { BrandLogo } from './BrandLogo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999] flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(181,154,91,0.16),transparent_22rem),linear-gradient(180deg,#0d2b23_0%,#0a1f1a_100%)] px-6 text-[#f0ebe3]">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo tagline size="lg" className="flex-col gap-5 text-center" variant="white" />
        </div>

        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#b59a5b] to-transparent" />

      </div>
    </div>
  );
};
