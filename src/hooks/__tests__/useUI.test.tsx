/**
 * Unit tests for useUI hook
 * Tests UI state management and UI-related actions
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { useUI } from '../useUI';
import { Notification } from '../../types';

// Mock notification data
const mockNotification: Omit<Notification, 'id'> = {
  type: 'trust-points',
  title: 'Test Notification',
  message: 'This is a test notification',
  timestamp: new Date(),
  isRead: false,
};

const mockReadNotification: Notification = {
  id: 'notif_read',
  type: 'event-reminder',
  title: 'Read Notification',
  message: 'This notification is read',
  timestamp: new Date(),
  isRead: true,
};

const mockUnreadNotification: Notification = {
  id: 'notif_unread',
  type: 'chat-message',
  title: 'Unread Notification',
  message: 'This notification is unread',
  timestamp: new Date(),
  isRead: false,
};

// Wrapper component for testing hooks with context
const createWrapper = (initialNotifications: Notification[] = []) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ 
      ui: { 
        isLoading: false,
        activeModal: null,
        notifications: initialNotifications,
        theme: 'impact',
        viewMode: 'grid',
      }
    }}>
      {children}
    </AppProvider>
  );
};

describe('useUI', () => {
  it('should return UI state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.activeModal).toBeNull();
    expect(result.current.viewMode).toBe('grid');
    expect(result.current.theme).toBe('impact');
    expect(result.current.notifications).toHaveLength(0);
  });

  it('should set loading state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should show and hide modal', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.showModal('verification');
    });

    expect(result.current.activeModal).toBe('verification');
    expect(result.current.isModalOpen('verification')).toBe(true);
    expect(result.current.isModalOpen('chat')).toBe(false);

    act(() => {
      result.current.hideModal();
    });

    expect(result.current.activeModal).toBeNull();
    expect(result.current.isModalOpen('verification')).toBe(false);
  });

  it('should set and toggle view mode', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.viewMode).toBe('grid');
    expect(result.current.isGridView).toBe(true);
    expect(result.current.isListView).toBe(false);

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
    expect(result.current.isGridView).toBe(false);
    expect(result.current.isListView).toBe(true);

    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('grid');
    expect(result.current.isGridView).toBe(true);
    expect(result.current.isListView).toBe(false);
  });

  it('should add notification with generated ID', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.addNotification(mockNotification);
    });

    expect(result.current.notifications).toHaveLength(1);
    const addedNotification = result.current.notifications[0];
    expect(addedNotification.title).toBe('Test Notification');
    expect(addedNotification.id).toBeDefined();
    expect(addedNotification.id).toMatch(/^notif_\d+_[a-z0-9]+$/);
  });

  it('should remove notification', () => {
    const wrapper = createWrapper([mockReadNotification, mockUnreadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.removeNotification('notif_read');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('notif_unread');
  });

  it('should mark notification as read', () => {
    const wrapper = createWrapper([mockUnreadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.notifications[0].isRead).toBe(false);

    act(() => {
      result.current.markNotificationRead('notif_unread');
    });

    expect(result.current.notifications[0].isRead).toBe(true);
  });

  it('should clear all notifications', () => {
    const wrapper = createWrapper([mockReadNotification, mockUnreadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearAllNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should filter unread notifications', () => {
    const wrapper = createWrapper([mockReadNotification, mockUnreadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.unreadNotifications).toHaveLength(1);
    expect(result.current.unreadNotifications[0].id).toBe('notif_unread');
    expect(result.current.hasUnreadNotifications).toBe(true);
  });

  it('should handle no unread notifications', () => {
    const wrapper = createWrapper([mockReadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.unreadNotifications).toHaveLength(0);
    expect(result.current.hasUnreadNotifications).toBe(false);
  });

  it('should maintain stable function references', () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(() => useUI(), { wrapper });

    const initialSetLoading = result.current.setLoading;
    const initialShowModal = result.current.showModal;
    const initialHideModal = result.current.hideModal;
    const initialSetViewMode = result.current.setViewMode;
    const initialToggleViewMode = result.current.toggleViewMode;
    const initialAddNotification = result.current.addNotification;
    const initialRemoveNotification = result.current.removeNotification;
    const initialMarkNotificationRead = result.current.markNotificationRead;
    const initialClearAllNotifications = result.current.clearAllNotifications;
    const initialIsModalOpen = result.current.isModalOpen;

    rerender();

    expect(result.current.setLoading).toBe(initialSetLoading);
    expect(result.current.showModal).toBe(initialShowModal);
    expect(result.current.hideModal).toBe(initialHideModal);
    expect(result.current.setViewMode).toBe(initialSetViewMode);
    expect(result.current.toggleViewMode).toBe(initialToggleViewMode);
    expect(result.current.addNotification).toBe(initialAddNotification);
    expect(result.current.removeNotification).toBe(initialRemoveNotification);
    expect(result.current.markNotificationRead).toBe(initialMarkNotificationRead);
    expect(result.current.clearAllNotifications).toBe(initialClearAllNotifications);
    expect(result.current.isModalOpen).toBe(initialIsModalOpen);
  });

  it('should handle multiple modal types', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    const modalTypes = ['verification', 'chat', 'rsvp', 'profile', 'trust-warning'] as const;

    modalTypes.forEach(modalType => {
      act(() => {
        result.current.showModal(modalType);
      });

      expect(result.current.activeModal).toBe(modalType);
      expect(result.current.isModalOpen(modalType)).toBe(true);

      // Check that other modals are not open
      modalTypes.filter(type => type !== modalType).forEach(otherType => {
        expect(result.current.isModalOpen(otherType)).toBe(false);
      });
    });
  });

  it('should handle notification ID generation uniqueness', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    const ids = new Set<string>();

    // Add multiple notifications and check ID uniqueness
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.addNotification({
          ...mockNotification,
          title: `Notification ${i}`,
        });
      });
    }

    result.current.notifications.forEach(notification => {
      expect(ids.has(notification.id)).toBe(false);
      ids.add(notification.id);
    });

    expect(ids.size).toBe(10);
  });

  it('should handle removing non-existent notification gracefully', () => {
    const wrapper = createWrapper([mockReadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification('non_existent_id');
    });

    // Should not affect existing notifications
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('notif_read');
  });

  it('should handle marking non-existent notification as read gracefully', () => {
    const wrapper = createWrapper([mockUnreadNotification]);
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.notifications[0].isRead).toBe(false);

    act(() => {
      result.current.markNotificationRead('non_existent_id');
    });

    // Should not affect existing notifications
    expect(result.current.notifications[0].isRead).toBe(false);
  });

  it('should handle different notification types', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUI(), { wrapper });

    const notificationTypes = [
      'trust-points',
      'event-reminder',
      'chat-message',
      'verification',
      'system'
    ] as const;

    notificationTypes.forEach((type, index) => {
      act(() => {
        result.current.addNotification({
          type,
          title: `${type} notification`,
          message: `Message for ${type}`,
          timestamp: new Date(),
          isRead: false,
        });
      });
    });

    expect(result.current.notifications).toHaveLength(5);
    notificationTypes.forEach(type => {
      const notification = result.current.notifications.find(n => n.type === type);
      expect(notification).toBeDefined();
      expect(notification?.title).toBe(`${type} notification`);
    });
  });
});