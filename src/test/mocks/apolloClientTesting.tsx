import React from 'react';

export interface MockedProviderProps {
  children: React.ReactNode;
}

export function MockedProvider({ children }: MockedProviderProps) {
  return <>{children}</>;
}

export default MockedProvider;
