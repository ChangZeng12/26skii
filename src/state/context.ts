import { createContext, useContext, type Dispatch } from 'react';
import { initialAppState, type AppAction, type AppState } from './app-reducer';

export const AppStateContext = createContext<AppState>(initialAppState);
export const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {
  throw new Error('useAppDispatch 必须在 AppStateProvider 内使用');
});

export const useAppState = (): AppState => useContext(AppStateContext);
export const useAppDispatch = (): Dispatch<AppAction> => useContext(AppDispatchContext);
