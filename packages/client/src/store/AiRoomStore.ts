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

import { makeAutoObservable } from "mobx";

import { Nullable } from "@docspace/shared/types";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";

class AiRoomStore {
  roomId: Nullable<number> = null;

  knowledgeId: Nullable<number> = null;
  resultId: Nullable<number> = null;

  currentTab: "chat" | "knowledge" | "result" = "chat";

  constructor() {
    makeAutoObservable(this);
  }

  setRoomId = (roomId: Nullable<number>) => {
    this.roomId = roomId;
  };

  setCurrentTab = (currentTab: "chat" | "knowledge" | "result") => {
    console.log("set", currentTab);
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
        console.log(resultId, "sub");
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
