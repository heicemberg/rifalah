'use client';

import React, { useState, useEffect } from 'react';

interface HydrationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function HydrationWrapper({ children, fallback }: HydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 animate-pulse">
          <div className="h-16 bg-gray-200 mb-4"></div>
          <div className="container mx-auto px-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}