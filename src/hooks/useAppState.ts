/**
 * Custom hook for accessing global application state
 * Provides convenient access to AppContext state and dispatch
 */

import { useAppContext } from '../context/AppContext';
import { AppState, AppActions } from '../types';

export const useAppState = (): AppState => {
  const { state } = useAppContext();
  return state;
};

export const useAppDispatch = (): React.Dispatch<AppActions> => {
  const { dispatch } = useAppContext();
  return dispatch;
};