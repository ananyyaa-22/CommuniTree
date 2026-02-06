/**
 * Custom hook for UI state management
 * Provides UI state access and UI-related actions
 */

import { useCallback } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { ModalType, ViewMode, Notification } from '../types';

export const useUI = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [dispatch]);

  const showModal = useCallback((modal: ModalType) => {
    dispatch({ type: 'SHOW_MODAL', payload: modal });
  }, [dispatch]);

  const hideModal = useCallback(() => {
    dispatch({ type: 'HIDE_MODAL' });
  }, [dispatch]);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, [dispatch]);

  const toggleViewMode = useCallback(() => {
    const newMode = state.ui.viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
  }, [state.ui.viewMode, setViewMode]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  }, [dispatch]);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, [dispatch]);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    state.ui.notifications.forEach(notification => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
    });
  }, [dispatch, state.ui.notifications]);

  return {
    ui: state.ui,
    isLoading: state.ui.isLoading,
    activeModal: state.ui.activeModal,
    viewMode: state.ui.viewMode,
    theme: state.ui.theme,
    notifications: state.ui.notifications,
    unreadNotifications: state.ui.notifications.filter(n => !n.isRead),
    setLoading,
    showModal,
    hideModal,
    setViewMode,
    toggleViewMode,
    addNotification,
    removeNotification,
    markNotificationRead,
    clearAllNotifications,
    isModalOpen: (modal: ModalType) => state.ui.activeModal === modal,
    isGridView: state.ui.viewMode === 'grid',
    isListView: state.ui.viewMode === 'list',
    hasUnreadNotifications: state.ui.notifications.some(n => !n.isRead),
  };
};