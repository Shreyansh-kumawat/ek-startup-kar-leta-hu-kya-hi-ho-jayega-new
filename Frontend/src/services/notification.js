// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Notification positions
export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
};

// Default notification configuration
const DEFAULT_CONFIG = {
  duration: 5000, // 5 seconds
  position: NOTIFICATION_POSITIONS.TOP_RIGHT,
  closeable: true,
  showIcon: true,
  maxNotifications: 5,
};

// Notification store
class NotificationStore {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.config = { ...DEFAULT_CONFIG };
  }

  // Subscribe to notification changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Generate unique ID
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  // Add notification
  add(notification) {
    const id = this.generateId();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      duration: this.config.duration,
      closeable: this.config.closeable,
      showIcon: this.config.showIcon,
      timestamp: new Date(),
      ...notification,
    };

    // Add to the beginning of array
    this.notifications.unshift(newNotification);

    // Limit max notifications
    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.config.maxNotifications);
    }

    this.notify();

    // Auto remove if duration is set
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  // Remove notification
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  // Clear all notifications
  clear() {
    this.notifications = [];
    this.notify();
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create global store instance
const notificationStore = new NotificationStore();

// Notification service functions
export const notificationService = {
  // Subscribe to notifications
  subscribe: (listener) => notificationStore.subscribe(listener),

  // Add success notification
  success: (message, options = {}) => {
    return notificationStore.add({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options,
    });
  },

  // Add error notification
  error: (message, options = {}) => {
    return notificationStore.add({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 7000, // Longer duration for errors
      ...options,
    });
  },

  // Add warning notification
  warning: (message, options = {}) => {
    return notificationStore.add({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options,
    });
  },

  // Add info notification
  info: (message, options = {}) => {
    return notificationStore.add({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options,
    });
  },

  // Add custom notification
  add: (notification) => {
    return notificationStore.add(notification);
  },

  // Remove notification
  remove: (id) => {
    notificationStore.remove(id);
  },

  // Clear all notifications
  clear: () => {
    notificationStore.clear();
  },

  // Update configuration
  configure: (config) => {
    notificationStore.updateConfig(config);
  },

  // Get current notifications
  getNotifications: () => {
    return notificationStore.notifications;
  },
};

// Browser notification API wrapper
export const browserNotifications = {
  // Check if browser notifications are supported
  isSupported: () => {
    return 'Notification' in window;
  },

  // Request permission
  requestPermission: async () => {
    if (!browserNotifications.isSupported()) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Send browser notification
  send: async (title, options = {}) => {
    const permission = await browserNotifications.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Browser notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon: options.icon || '/images/logo.png',
      badge: options.badge || '/images/badge.png',
      body: options.body || '',
      tag: options.tag || 'default',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      ...options,
    });

    // Auto close after duration
    if (options.duration) {
      setTimeout(() => {
        notification.close();
      }, options.duration);
    }

    return notification;
  },
};

// Push notification helpers (for future use)
export const pushNotifications = {
  // Register service worker
  registerServiceWorker: async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      // console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  },

  // Subscribe to push notifications
  subscribe: async (registration) => {
    if (!registration) {
      console.warn('No service worker registration');
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      // console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  },
};

// Utility functions
export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return notificationTime.toLocaleDateString();
  }
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return '✅';
    case NOTIFICATION_TYPES.ERROR:
      return '❌';
    case NOTIFICATION_TYPES.WARNING:
      return '⚠️';
    case NOTIFICATION_TYPES.INFO:
      return 'ℹ️';
    default:
      return 'ℹ️';
  }
};

export default notificationService;