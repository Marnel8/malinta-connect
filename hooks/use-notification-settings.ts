"use client";

import { useState, useEffect } from 'react';
import { getSettings } from '@/app/actions/settings';
import type { NotificationSettings } from '@/app/actions/settings';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const allSettings = await getSettings();
        if (allSettings) {
          setSettings(allSettings.notifications);
        }
      } catch (err) {
        console.warn('Error loading notification settings:', err);
        console.log('Notification settings loading failed - using defaults');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await getSettings();
      if (allSettings) {
        setSettings(allSettings.notifications);
      }
    } catch (err) {
      console.warn('Error refreshing notification settings:', err);
      console.log('Notification settings refresh failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    refreshSettings,
    systemNotificationsEnabled: settings?.systemNotifications ?? true,
    emailNotificationsEnabled: settings?.emailNotifications ?? true,
    smsNotificationsEnabled: settings?.smsNotifications ?? true
  };
}
