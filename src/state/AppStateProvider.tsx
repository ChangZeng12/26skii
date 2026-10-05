import { useReducer, type ReactNode } from 'react';
import { appReducer, initialAppState } from './app-reducer';
import { AppDispatchContext, AppStateContext } from './context';

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  return (
    <AppDispatchContext value={dispatch}>
      <AppStateContext value={state}>{children}</AppStateContext>
    </AppDispatchContext>
  );
}
