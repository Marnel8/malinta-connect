"use client";

import { useEffect, useState } from 'react';
import { ensureServiceWorkerRegistered, setupForegroundMessageHandling } from '@/app/firebase/firebase';
import { useNotificationSettingsListener } from '@/hooks/use-notification-settings-listener';

interface FCMInitializerProps {
  children: React.ReactNode;
}

export function FCMInitializer({ children }: FCMInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { systemNotificationsEnabled, loading: settingsLoading } = useNotificationSettingsListener();

  useEffect(() => {
    const initializeFCM = async () => {
      // Don't initialize if system notifications are disabled
      if (!systemNotificationsEnabled) {
        console.log("FCM initialization skipped: System notifications are disabled");
        setIsInitialized(true);
        return;
      }

      try {
        console.log("Initializing FCM service worker...");
        await ensureServiceWorkerRegistered();
        console.log("FCM service worker initialized successfully");
        
        // Set up foreground message handling
        console.log("Setting up foreground message handling...");
        await setupForegroundMessageHandling();
        
        console.log("FCM initialization completed successfully");
        setIsInitialized(true);
      } catch (error) {
        console.warn("Failed to initialize FCM:", error);
        console.log("FCM initialization failed - notifications may not be available due to browser permissions or security settings");
        // Don't show error to user, just log it and continue
        setIsInitialized(true);
      }
    };

    // Wait for settings to load before initializing
    if (!settingsLoading) {
      initializeFCM();
    }
  }, [systemNotificationsEnabled, settingsLoading]);

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

  return <>{children}</>;
}
