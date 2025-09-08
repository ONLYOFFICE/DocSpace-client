// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { ErrorInfo } from "react";

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
      currentColorScheme,
    } = this.props;

    if (error) {
      // You can render any custom fallback UI

      return (
        <Error520
          user={user}
          errorLog={error}
          version={version}
          firebaseHelper={firebaseHelper}
          currentDeviceType={currentDeviceType}
          currentColorScheme={currentColorScheme}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
