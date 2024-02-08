import type { PropsWithChildren } from "react";

export interface ErrorBoundaryProps extends PropsWithChildren {
  onError?: VoidFunction;
}

export interface ErrorBoundaryState {
  error: Error | null;
}
