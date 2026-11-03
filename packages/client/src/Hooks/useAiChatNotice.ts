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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavigateFunction } from "react-router";

import SocketHelper, { SocketEvents } from "@onlyoffice/apps-ui-kit/utils/socket";
import type { ComposerNotice } from "@onlyoffice/ai-chat";
import {
  getServiceLimitChatError,
  getServiceLimitDescription,
} from "@docspace/shared/utils/ai";
import type { TTranslation } from "@docspace/shared/types";

import { PAYMENT_ROUTES } from "SRC_DIR/pages/PortalSettings/categories/payments/utils";

/** The DocSpace AI gateway: its 402 is the portal wallet running dry. */
const GATEWAY_PROVIDER = "onlyoffice";

const AI_LIMITS_ROUTE = "/portal-settings/ai-settings/limits";

/**
 * What keeps the chat from working right now:
 * - `wallet` - the portal wallet ran out mid-answer;
 * - `limit` - the AI spending limit was reached (`until` is when it resets,
 *   null for a lifetime limit);
 * - `provider` - a provider with its own key ran out of credits, which the
 *   portal cannot see being topped up.
 */
export type TAiChatBlock =
  | { kind: "wallet" }
  | { kind: "limit"; until: string | null }
  | { kind: "provider" };

type TStreamError = {
  error: { code?: string; message?: string };
  providerType?: string;
};

type UseAiChatNoticeProps = {
  t: TTranslation;
  language: string;
  standalone: boolean;
  isAdmin: boolean;
  isPayer: boolean;
  isChatOpen: boolean;
  navigate: NavigateFunction;
  fetchWalletBalance?: (isRefresh?: boolean) => Promise<number>;
};

/**
 * Which money state an errored round reports, or null when the error is
 * not about money (it then only leaves its note in the history).
 */
export const getAiChatBlock = (
  { error, providerType }: TStreamError,
  standalone: boolean,
): TAiChatBlock | null => {
  // Standalone pays its providers directly: no wallet and no spending
  // limits, only a provider of its own running out.
  if (!standalone) {
    const serviceLimit = getServiceLimitChatError(error);
    if (serviceLimit) return { kind: "limit", until: serviceLimit.until };
  }

  if (error.code !== "insufficient_funds") return null;

  return !standalone && providerType === GATEWAY_PROVIDER
    ? { kind: "wallet" }
    : { kind: "provider" };
};

/**
 * The AI chat's state notice above the composer (see
 * `WidgetConfig.composerNotice`). An interrupted answer keeps its own note
 * in the history; this is the state behind it, shown while it lasts:
 *
 * - set when a round fails for lack of money;
 * - the wallet one is cleared by the top-up socket event, which reaches
 *   every user of the portal, and on opening the chat - for an admin after
 *   the balance is read back, for anyone else optimistically, since a
 *   regular user cannot read the balance (a send that still fails sets it
 *   again);
 * - the limit one is cleared when the limit resets and on opening the chat
 *   (an admin may have raised it meanwhile);
 * - the provider one is cleared by the next answer that completes: the
 *   portal never sees a top-up at the provider, so it does not block
 *   sending either.
 */
export const useAiChatNotice = ({
  t,
  language,
  standalone,
  isAdmin,
  isPayer,
  isChatOpen,
  navigate,
  fetchWalletBalance,
}: UseAiChatNoticeProps) => {
  const [block, setBlock] = useState<TAiChatBlock | null>(null);
  const blockRef = useRef(block);
  blockRef.current = block;

  const onStreamError = useCallback(
    (event: TStreamError) => {
      const next = getAiChatBlock(event, standalone);
      if (next) setBlock(next);
    },
    [standalone],
  );

  const onStreamEnd = useCallback(() => {
    if (blockRef.current?.kind === "provider") setBlock(null);
  }, []);

  // The wallet was topped up: the state is over for everyone.
  useEffect(() => {
    if (block?.kind !== "wallet") return;

    const onTopUp = () => setBlock(null);
    SocketHelper?.on(SocketEvents.TopUpWallet, onTopUp);

    return () => {
      SocketHelper?.off(SocketEvents.TopUpWallet, onTopUp);
    };
  }, [block?.kind]);

  // A limit with a reset date lifts by itself.
  useEffect(() => {
    if (block?.kind !== "limit" || !block.until) return;

    const delay = new Date(block.until).getTime() - Date.now();
    if (Number.isNaN(delay)) return;

    const timer = setTimeout(() => setBlock(null), Math.max(delay, 0));
    return () => clearTimeout(timer);
  }, [block]);

  // Opening the chat re-checks the state instead of waiting for the next
  // message.
  const wasChatOpen = useRef(isChatOpen);
  useEffect(() => {
    const opened = isChatOpen && !wasChatOpen.current;
    wasChatOpen.current = isChatOpen;
    if (!opened || !blockRef.current) return;

    const { kind } = blockRef.current;
    if (kind === "limit") {
      setBlock(null);
      return;
    }
    if (kind !== "wallet") return;

    if (!isAdmin || !fetchWalletBalance) {
      setBlock(null);
      return;
    }
    fetchWalletBalance(true)
      .then((balance) => {
        if (balance > 0 && blockRef.current?.kind === "wallet") setBlock(null);
      })
      .catch((e) => console.error(e));
  }, [isChatOpen, isAdmin, fetchWalletBalance]);

  const composerNotice = useMemo<ComposerNotice | null>(() => {
    if (!block) return null;

    if (block.kind === "wallet") {
      return {
        title: t("Common:AIPaused"),
        description: isPayer
          ? t("Common:AIPausedWalletEmpty")
          : t("Common:AIPausedWalletEmptyContactPayer"),
        action: isPayer
          ? {
              text: t("Common:TopUpWallet"),
              onClick: () => navigate(PAYMENT_ROUTES.wallet),
            }
          : undefined,
        blocksSending: true,
      };
    }

    if (block.kind === "limit") {
      return {
        title: t("Common:AILimitReached"),
        description: getServiceLimitDescription(
          t,
          language,
          { until: block.until },
          isAdmin,
        ),
        action: isAdmin
          ? {
              text: t("Common:ChangeAILimit"),
              onClick: () => navigate(AI_LIMITS_ROUTE),
            }
          : undefined,
        blocksSending: true,
      };
    }

    return {
      title: t("Common:AIProviderOutOfCredits"),
      description: t("Common:AIProviderOutOfCreditsTopUp"),
    };
  }, [block, t, language, isAdmin, isPayer, navigate]);

  return { composerNotice, onStreamError, onStreamEnd };
};
