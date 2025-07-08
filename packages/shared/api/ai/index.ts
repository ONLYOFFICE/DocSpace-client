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

import { request } from "../client";
import {
  TCreateAiProvider,
  TAiProvider,
  TGetAiProviders,
  TUpdateAiProviders,
  TDeleteAiProviders,
  TModelList,
  TCurrentModel,
} from "./types";

const baseUrl = "/ai";

export const createProvider = async (provider: TCreateAiProvider) => {
  const res = (await request({
    method: "post",
    url: `${baseUrl}/providers`,
    data: provider,
  })) as TAiProvider;

  return res;
};

export const getProviders = async () => {
  const res = (await request({
    method: "get",
    url: `${baseUrl}/providers`,
  })) as TGetAiProviders;

  return res;
};

export const updateProvider = async (
  providerId: Pick<TAiProvider, "id">,
  data: TUpdateAiProviders,
) => {
  const res = (await request({
    method: "put",
    url: `${baseUrl}/providers/${providerId.id}`,
    data,
  })) as TAiProvider;

  return res;
};

export const deleteProvider = async (data: TDeleteAiProviders) => {
  const res = (await request({
    method: "delete",
    url: `${baseUrl}/providers`,
    data,
  })) as TDeleteAiProviders;

  return res;
};

export const getModels = async (providerId?: Pick<TAiProvider, "id">) => {
  const searchParams = new URLSearchParams();
  if (providerId) {
    searchParams.append("providerId", providerId.id.toString());
  }

  const strSearch = providerId ? `?${searchParams.toString()}` : "";

  const res = (await request({
    method: "get",
    url: `${baseUrl}/chats/models${strSearch}`,
  })) as TModelList;

  return res;
};

export const getCurrentModel = async () => {
  const res = (await request({
    method: "get",
    url: `${baseUrl}/chats/configuration`,
  })) as TCurrentModel | undefined;

  return res;
};

export const setCurrentModel = async (data: TCurrentModel) => {
  const res = (await request({
    method: "put",
    url: `${baseUrl}/chats/configuration`,
    data,
  })) as TCurrentModel;

  return res;
};

export const startNewChat = (roomId: number | string) => {};

export const sendMessageToChat = (chatId: string) => {};

export const getChats = (
  roomId: number | string,
  startIndex: number,
  count: number = 100,
) => {};

export const getChatMessages = (
  chatId: string,
  startIndex: number,
  count: number = 100,
) => {};

export const renameChat = (chatId: string, name: string) => {};

export const deleteChat = (chatId: string) => {};
