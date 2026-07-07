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

// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { makeAutoObservable } from "mobx";

import type { Nullable } from "@docspace/shared/types";
import type { TChatPlaylistImage } from "@docspace/ui-kit/ai-agent/chat/Chat.types";

export type AiRoomTab = "chat" | "knowledge" | "result";

class AiRoomStore {
  roomId: Nullable<number> = null;

  title: string = "";

  knowledgeId: Nullable<number> = null;

  resultId: Nullable<number> = null;

  currentTab: AiRoomTab = "chat";

  selectedResultFileId: Nullable<number> = null;

  isErrorAIAgentNotAvailable = false;

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

  setTitle = (title: string) => {
    this.title = title;
  };

  setCurrentTab = (currentTab: AiRoomTab) => {
    this.currentTab = currentTab;
    if (currentTab !== "result") this.selectedResultFileId = null;
  };

  setSelectedResultFileId = (id: Nullable<number>) => {
    this.selectedResultFileId = id;
  };

  setKnowledgeId = (knowledgeId: Nullable<number>) => {
    this.knowledgeId = knowledgeId;
  };

  setResultId = (resultId: Nullable<number>) => {
    this.resultId = resultId;
  };

  setIsErrorAIAgentNotAvailable = (value: boolean) => {
    this.isErrorAIAgentNotAvailable = value;
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

const AiRoomStoreContext = React.createContext<AiRoomStore | null>(null);

export const AiRoomStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AiRoomStore(), []);
  return (
    <AiRoomStoreContext.Provider value={store}>
      {children}
    </AiRoomStoreContext.Provider>
  );
};

export const useAiRoomStore = () => {
  const store = React.useContext(AiRoomStoreContext);
  if (!store)
    throw new Error(
      "useAiRoomStore must be used within AiRoomStoreContextProvider",
    );
  return store;
};

export default AiRoomStore;
