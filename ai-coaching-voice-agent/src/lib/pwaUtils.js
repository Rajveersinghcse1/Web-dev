/**
 * 📱 PWA SERVICE WORKER MANAGER
 * 
 * Progressive Web App capabilities:
 * - Offline support
 * - Cache management
 * - Background sync
 * - Push notifications
 * - Install prompt
 * - Update detection
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

// Service Worker registration and lifecycle management
export function useServiceWorker() {
  const [registration, setRegistration] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered:', reg);
          setRegistration(reg);
          setIsInstalled(true);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  const unregister = useCallback(async () => {
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        setIsInstalled(false);
        setRegistration(null);
      }
      return success;
    }
    return false;
  }, [registration]);

  return {
    registration,
    isOnline,
    updateAvailable,
    isInstalled,
    updateServiceWorker,
    unregister,
  };
}

// PWA Install Prompt Hook
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      return { outcome: 'not-available' };
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }

    return { outcome };
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
}

// Push Notifications Hook
export function usePushNotifications() {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async (registration) => {
    if (!registration || permission !== 'granted') {
      return null;
    }

    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });
      
      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, [permission]);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  const sendNotification = useCallback((title, options = {}) => {
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/logo.svg',
          badge: '/logo.svg',
          vibrate: [200, 100, 200],
          ...options,
        });
      });
    }
  }, [permission]);

  return {
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
  };
}

// Cache Management Hook
export function useCacheManagement() {
  const [cacheSize, setCacheSize] = useState(0);
  const [cacheNames, setCacheNames] = useState([]);

  const getCaches = useCallback(async () => {
    if ('caches' in window) {
      const names = await caches.keys();
      setCacheNames(names);
      return names;
    }
    return [];
  }, []);

  const clearCache = useCallback(async (cacheName) => {
    if ('caches' in window) {
      if (cacheName) {
        const deleted = await caches.delete(cacheName);
        if (deleted) {
          await getCaches();
        }
        return deleted;
      } else {
        // Clear all caches
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
        await getCaches();
        return true;
      }
    }
    return false;
  }, [getCaches]);

  const estimateStorage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      setCacheSize(used);
      return {
        used,
        quota,
        percentage: quota > 0 ? (used / quota) * 100 : 0,
      };
    }
    return null;
  }, []);

  useEffect(() => {
    getCaches();
    estimateStorage();
  }, [getCaches, estimateStorage]);

  return {
    cacheSize,
    cacheNames,
    getCaches,
    clearCache,
    estimateStorage,
  };
}

// Offline Status Hook
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { isOffline, wasOffline };
}

// Background Sync Hook
export function useBackgroundSync() {
  const syncData = useCallback(async (tag, data) => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Store data in IndexedDB for sync
        await storeDataForSync(tag, data);
        
        // Request background sync
        await registration.sync.register(tag);
        
        return true;
      } catch (error) {
        console.error('Background sync registration failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  return { syncData };
}

// Helper function to store data for sync
async function storeDataForSync(tag, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDatabase', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncData'], 'readwrite');
      const store = transaction.objectStore('syncData');
      
      store.put({ tag, data, timestamp: Date.now() });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncData')) {
        db.createObjectStore('syncData', { keyPath: 'tag' });
      }
    };
  });
}

export default {
  useServiceWorker,
  useInstallPrompt,
  usePushNotifications,
  useCacheManagement,
  useOfflineStatus,
  useBackgroundSync,
};
