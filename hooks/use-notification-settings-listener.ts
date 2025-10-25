"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getSettings } from '@/app/actions/settings';
import type { NotificationSettings } from '@/app/actions/settings';

export function useNotificationSettingsListener() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        setLoading(true);
        const allSettings = await getSettings();
        if (allSettings) {
          setSettings(allSettings.notifications);
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
        console.warn('Error loading notification settings:', err);
        console.log('Using default notification settings due to loading error');
        // Use default settings on error
        setSettings({
          emailNotifications: true,
          smsNotifications: true,
          systemNotifications: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
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
