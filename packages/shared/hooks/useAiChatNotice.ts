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

import { useCallback, useEffect, useMemo, useState } from "react";

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

// The wallet service group whose limits the chat runs into (`ServiceLimitGroups.AiServices`).
const AI_SERVICES = "ai-services";

type UseAiChatNoticeProps = {
  t: TTranslation;
  language: string;
  standalone: boolean;
  isAdmin: boolean;
  isPayer: boolean;
  /** Opens the wallet; the Payer gets a "Top up wallet" button for it. */
  onTopUpWallet?: () => void;
  /** Opens the AI limits; an admin gets a "Change AI limit" button for it. */
  onChangeAiLimit?: () => void;
};

/**
 * The AI chat's state notice above the composer (see
 * `WidgetConfig.composerNotice`). An interrupted answer keeps its own note
 * in the history; this is the state behind it:
 *
 * - set when a round fails for lack of money;
 * - cleared only by a fact that the state is over, never by a guess: the
 *   next answer that completes (any kind), the top-up socket event (wallet)
 *   and the limits-changed socket event (limit) - the server sends the
 *   latter to everyone who may read the changed limit, the admin who changed
 *   it included. A reload starts without it.
 *
 * None of them blocks sending: a limit also resets with its period, and a
 * regular user is not told when an admin raises the portal's limit, so a
 * blocked composer could outlive the state. A send made while it still
 * holds fails the same way and keeps the notice.
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
  onTopUpWallet,
  onChangeAiLimit,
}: UseAiChatNoticeProps) => {
  const [block, setBlock] = useState<TAiChatBlock | null>(null);

  const onStreamError = useCallback(
    (event: TAiChatStreamError) => {
      const next = getAiChatBlock(event, standalone);
      if (next) setBlock(next);
    },
    [standalone],
  );

  const onStreamEnd = useCallback(() => setBlock(null), []);

  // The wallet was topped up: the state is over for everyone.
  useEffect(() => {
    if (block?.kind !== "wallet") return;

    const onTopUp = () => setBlock(null);
    SocketHelper?.on(SocketEvents.TopUpWallet, onTopUp);

    return () => {
      SocketHelper?.off(SocketEvents.TopUpWallet, onTopUp);
    };
  }, [block?.kind]);

  // The AI limits changed (raised, removed): the next send tells whether
  // this one still holds.
  useEffect(() => {
    if (block?.kind !== "limit") return;

    const onLimitsChange = ({ serviceName }: { serviceName: string }) => {
      if (serviceName === AI_SERVICES) setBlock(null);
    };
    SocketHelper?.on(SocketEvents.ChangeServiceLimits, onLimitsChange);

    return () => {
      SocketHelper?.off(SocketEvents.ChangeServiceLimits, onLimitsChange);
    };
  }, [block?.kind]);

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
      };
    }

    return {
      title: t("Common:AIProviderOutOfCredits"),
      description: t("Common:AIProviderOutOfCreditsTopUp"),
    };
  }, [block, t, language, isAdmin, isPayer, onTopUpWallet, onChangeAiLimit]);

  return { composerNotice, onStreamError, onStreamEnd };
};
