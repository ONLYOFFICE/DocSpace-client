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

import SocketHelper, { SocketEvents } from "@onlyoffice/apps-ui-kit/utils/socket";
import {
  getAiChatBlock,
  getServiceLimitDescription,
  type TAiChatBlock,
  type TAiChatStreamError,
} from "../utils/ai";
import type { TTranslation } from "../types";

/**
 * The notice the chat shows above its composer - `ComposerNotice` of
 * `@onlyoffice/ai-chat`, spelled out here because shared does not depend on
 * the chat library; the apps pass it on as `composerNotice`.
 */
export type TComposerNotice = {
  title: string;
  description?: string;
  action?: { text: string; onClick: () => void };
  blocksSending?: boolean;
};

type UseAiChatNoticeProps = {
  t: TTranslation;
  language: string;
  standalone: boolean;
  isAdmin: boolean;
  isPayer: boolean;
  isChatOpen: boolean;
  /** Opens the wallet; the Payer gets a "Top up wallet" button for it. */
  onTopUpWallet?: () => void;
  /** Opens the AI limits; an admin gets a "Change AI limit" button for it. */
  onChangeAiLimit?: () => void;
  /** Reads the balance back for an admin when the chat is opened again. */
  fetchWalletBalance?: (isRefresh?: boolean) => Promise<number>;
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
 *
 * Shared by the portal and the SDK frames; a host without a wallet page or
 * AI settings to send the user to (the SDK) leaves the actions out and the
 * notice only says what is going on.
 */
export const useAiChatNotice = ({
  t,
  language,
  standalone,
  isAdmin,
  isPayer,
  isChatOpen,
  onTopUpWallet,
  onChangeAiLimit,
  fetchWalletBalance,
}: UseAiChatNoticeProps) => {
  const [block, setBlock] = useState<TAiChatBlock | null>(null);
  const blockRef = useRef(block);
  blockRef.current = block;

  const onStreamError = useCallback(
    (event: TAiChatStreamError) => {
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

  const composerNotice = useMemo<TComposerNotice | null>(() => {
    if (!block) return null;

    if (block.kind === "wallet") {
      return {
        title: t("Common:AIPaused"),
        description: isPayer
          ? t("Common:AIPausedWalletEmpty")
          : t("Common:AIPausedWalletEmptyContactPayer"),
        action:
          isPayer && onTopUpWallet
            ? { text: t("Common:TopUpWallet"), onClick: onTopUpWallet }
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
        action:
          isAdmin && onChangeAiLimit
            ? { text: t("Common:ChangeAILimit"), onClick: onChangeAiLimit }
            : undefined,
        blocksSending: true,
      };
    }

    return {
      title: t("Common:AIProviderOutOfCredits"),
      description: t("Common:AIProviderOutOfCreditsTopUp"),
    };
  }, [block, t, language, isAdmin, isPayer, onTopUpWallet, onChangeAiLimit]);

  return { composerNotice, onStreamError, onStreamEnd };
};
