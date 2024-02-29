import React, { ErrorInfo } from "react";

import { I18nextProvider } from "react-i18next";

import Error520 from "../errors/Error520";

import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./ErrorBoundary.types";

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error?: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { error: error ?? new Error("Unhandled exception") };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
    const { onError } = this.props;

    onError?.();
  }

  public render() {
    const { error } = this.state;
    const {
      children,
      user,
      version,
      firebaseHelper,
      currentDeviceType,
      whiteLabelLogoUrls,
      currentColorScheme,
      isNextJS,
      theme,
      i18n,
    } = this.props;

    if (error) {
      // You can render any custom fallback UI

      if (isNextJS && theme && i18n) {
        return (
          <I18nextProvider i18n={i18n}>
            <Error520
              user={user}
              errorLog={error}
              version={version}
              firebaseHelper={firebaseHelper}
              currentDeviceType={currentDeviceType}
              whiteLabelLogoUrls={whiteLabelLogoUrls}
              currentColorScheme={theme.currentColorScheme}
            />
          </I18nextProvider>
        );
      }
      return (
        <Error520
          user={user}
          errorLog={error}
          version={version}
          firebaseHelper={firebaseHelper}
          currentDeviceType={currentDeviceType}
          whiteLabelLogoUrls={whiteLabelLogoUrls}
          currentColorScheme={currentColorScheme}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
