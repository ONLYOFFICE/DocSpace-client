/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ErrorInfo } from "react";

import Error520 from "../errors/Error520";
import {
  canReloadOnChunkError,
  scheduleChunkErrorReload,
} from "../../utils/chunk-load-error";

import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./ErrorBoundary.types";

// A lazy chunk that failed to load (dropped request in a background tab, or
// a deploy that replaced the chunks) is recovered by one bounded reload
// instead of the crash page. Without this the boundary swallows the error
// before the app's global-error.tsx, which holds the same recovery, sees it.
const CHUNK_RELOAD_KEY = "error-boundary.retry-chunk-reload";

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, isReloading: false };
  }

  public static getDerivedStateFromError(error?: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      error: error ?? new Error("Unhandled exception"),
      isReloading: canReloadOnChunkError(error, CHUNK_RELOAD_KEY),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service

    console.error(error, errorInfo);

    if (this.state.isReloading) {
      scheduleChunkErrorReload(CHUNK_RELOAD_KEY);
      return;
    }

    const { onError } = this.props;

    onError?.();
  }

  public render() {
    const { error, isReloading } = this.state;
    const {
      children,
      user,
      version,
      firebaseHelper,
      currentDeviceType,
      currentColorScheme,
    } = this.props;

    if (isReloading) return null;

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
