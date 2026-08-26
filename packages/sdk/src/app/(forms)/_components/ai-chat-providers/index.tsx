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

import React from "react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit";
import { toastr } from "@docspace/ui-kit/components/toast";
import AiAgentProviders from "@docspace/ui-kit/ai-agent/providers";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@docspace/ui-kit/ai-agent/providers/themes";
import type { TUser } from "@docspace/shared/api/people/types";

type AiAgentProvidersProps = React.ComponentProps<typeof AiAgentProviders>;

type FormsAiChatProvidersProps = {
  roomId: string | number;
  user: TUser | undefined | null;
  isStandalone: boolean;
  children: React.ReactNode;
};

const FormsAiChatProviders = ({
  roomId,
  user,
  isStandalone,
  children,
}: FormsAiChatProvidersProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const canUseAi = !!user && !user.isVisitor;
  const entityId = roomId ? String(roomId) : undefined;

  const formatChatError = React.useCallback<
    NonNullable<AiAgentProvidersProps["formatChatError"]>
  >(
    (payload) => {
      if (payload?.code !== "insufficient_funds") return null;

      return {
        title: t("Common:WalletBalanceTooLow"),
        description: t("Common:InsufficientFundsContactPayerShort"),
        action: null,
      };
    },
    [t],
  );

  const callbacks = React.useMemo<AiAgentProvidersProps["callbacks"]>(
    () => ({
      onWebSearchSaved: () =>
        toastr.success(t("Common:ChangesSavedSuccessfully")),
      onError: ({ type, error, context }) => {
        console.error(`[forms-ai-chat] ${context ?? type} failed`, error);
        const err = error as
          | { response?: { status?: number }; status?: number; message?: string }
          | undefined;
        const status = err?.response?.status ?? err?.status;
        const isForbidden =
          status === 403 || /\bHTTP\s+403\b/.test(err?.message ?? "");
        if (!isForbidden) toastr.error(t("Common:UnexpectedError"));
      },
    }),
    [t],
  );

  return (
    <AiAgentProviders
      key={entityId ?? "no-room"}
      theme={isBase ? PORTAL_BASE_THEME_ID : PORTAL_DARK_THEME_ID}
      locale={i18n.language}
      isStandalone={isStandalone}
      isAvailable={canUseAi}
      canUseAi={canUseAi}
      entityId={entityId}
      callbacks={callbacks}
      formatChatError={formatChatError}
      hideProfilePicker={false}
    >
      {children}
    </AiAgentProviders>
  );
};

export default FormsAiChatProviders;
