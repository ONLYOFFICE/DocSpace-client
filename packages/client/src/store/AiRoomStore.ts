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

import { makeAutoObservable } from "mobx";

import type { Nullable } from "@docspace/shared/types";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import type { TChatPlaylistImage } from "@docspace/ui-kit/ai-agent/chat/Chat.types";

class AiRoomStore {
  roomId: Nullable<number> = null;

  knowledgeId: Nullable<number> = null;
  resultId: Nullable<number> = null;

  currentTab: "chat" | "knowledge" | "result" = "chat";

  aiPlaylistImages: TChatPlaylistImage[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setAiPlaylistImages = (aiPlaylistImages: TChatPlaylistImage[]) => {
    this.aiPlaylistImages = aiPlaylistImages;
  };

  setRoomId = (roomId: Nullable<number>) => {
    this.roomId = roomId;
  };

  setCurrentTab = (currentTab: "chat" | "knowledge" | "result") => {
    this.currentTab = currentTab;
  };

  setKnowledgeId = (knowledgeId: Nullable<number>) => {
    if (
      this.knowledgeId &&
      this.knowledgeId !== knowledgeId &&
      SocketHelper?.socketSubscribers.has(`DIR-${knowledgeId}`)
    ) {
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: [`DIR-${this.knowledgeId}`],
        individual: true,
      });
    }

    this.knowledgeId = knowledgeId;

    setTimeout(() => {
      if (knowledgeId) {
        SocketHelper?.emit(SocketCommands.Subscribe, {
          roomParts: [`DIR-${knowledgeId}`],
          individual: true,
        });
      }
    }, 100);
  };

  setResultId = (resultId: Nullable<number>) => {
    if (
      this.resultId &&
      this.resultId !== resultId &&
      SocketHelper?.socketSubscribers.has(`DIR-${resultId}`)
    ) {
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: [`DIR-${this.resultId}`],
        individual: true,
      });
    }

    this.resultId = resultId;

    setTimeout(() => {
      if (resultId) {
        SocketHelper?.emit(SocketCommands.Subscribe, {
          roomParts: [`DIR-${resultId}`],
          individual: true,
        });
      }
    }, 100);
  };

  get isChatTab() {
    return this.currentTab === "chat";
  }

  get isKnowledgeTab() {
    return this.currentTab === "knowledge";
  }

  get isResultTab() {
    return this.currentTab === "result";
  }
}

export default AiRoomStore;
