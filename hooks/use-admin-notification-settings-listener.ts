"use client";

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { useAuth } from '@/contexts/auth-context';
import type { NotificationSettings } from '@/app/actions/settings';

export function useAdminNotificationSettingsListener() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (!user || !userProfile || userProfile.role !== 'admin') {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const settingsRef = ref(db, 'settings/notifications');

    const unsubscribe = onValue(
      settingsRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setSettings(data);
          } else {
            // Use default settings if none exist
            setSettings({
              emailNotifications: true,
              smsNotifications: true,
              systemNotifications: true
            });
          }
          setError(null);
        } catch (err) {
          console.warn('Error parsing notification settings:', err);
          console.log('Using default notification settings due to parsing error');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn('Error listening to notification settings:', error);
        console.log('Notification settings listener failed - using default settings');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, userProfile]);

  return {
    settings,
    loading,
    error,
    systemNotificationsEnabled: settings?.systemNotifications ?? true,
    emailNotificationsEnabled: settings?.emailNotifications ?? true,
    smsNotificationsEnabled: settings?.smsNotifications ?? true
  };
}
