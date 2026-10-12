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

"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

import type {
  TFrameConfig,
  TFrameCustomActions,
} from "@docspace/shared/types/Frame";

import { useSDKConfig } from "./SDKConfigProvider";

const CUSTOM_ACTIONS_MODES: ReadonlySet<string> = new Set(["personal", "forms"]);

type TSdkCustomActionsContext = {
  customActions: TFrameCustomActions | null;
  setCustomActions: (config: TFrameCustomActions) => void;
};

const SdkCustomActionsContext = createContext<TSdkCustomActionsContext>({
  customActions: null,
  setCustomActions: () => {},
});

export const SdkCustomActionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { sdkConfig } = useSDKConfig();
  const [state, setState] = useState<{
    source: TFrameConfig | null;
    actions: TFrameCustomActions | null;
  }>({ source: sdkConfig, actions: sdkConfig?.customActions ?? null });

  if (state.source !== sdkConfig) {
    setState({ source: sdkConfig, actions: sdkConfig?.customActions ?? null });
  }

  const customActions = state.actions;

  const setCustomActions = useCallback((actions: TFrameCustomActions) => {
    setState((prev) => ({ ...prev, actions }));
  }, []);

  const enabled = !!sdkConfig?.mode && CUSTOM_ACTIONS_MODES.has(sdkConfig.mode);

  const value = React.useMemo(
    () => ({
      customActions: enabled ? customActions : null,
      setCustomActions,
    }),
    [enabled, customActions, setCustomActions],
  );

  return (
    <SdkCustomActionsContext.Provider value={value}>
      {children}
    </SdkCustomActionsContext.Provider>
  );
};

export const useSdkCustomActions = () => useContext(SdkCustomActionsContext);
