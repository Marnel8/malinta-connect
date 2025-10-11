"use client";

import { useEffect, useState } from 'react';
import { ensureServiceWorkerRegistered } from '@/app/firebase/firebase';

interface FCMInitializerProps {
  children: React.ReactNode;
}

export function FCMInitializer({ children }: FCMInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCM = async () => {
      try {
        console.log("Initializing FCM service worker...");
        await ensureServiceWorkerRegistered();
        console.log("FCM service worker initialized successfully");
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize FCM service worker:", error);
        setError("Failed to initialize notifications. Some features may not work properly.");
        // Still set as initialized to not block the app
        setIsInitialized(true);
      }
    };

    initializeFCM();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg max-w-sm">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
