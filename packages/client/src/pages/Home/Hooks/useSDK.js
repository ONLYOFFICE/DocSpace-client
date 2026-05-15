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

import { useEffect, useCallback } from "react";

import { Events } from "@docspace/shared/enums";
import {
  frameCallbackData,
  frameCallCommand,
  createPasswordHash,
  frameHandlePing,
} from "@docspace/shared/utils/common";

const useSDK = ({
  frameConfig,
  setFrameConfig,
  selectedFolderStore,
  folders,
  files,
  filesList,
  selection,
  userId,
  createFile,
  createFolder,
  createRoom,
  refreshFiles,
  setViewAs,
  getSettings,
  logout,
  login,
  addTagsToRoom,
  createTag,
  removeTagsFromRoom,
  loadCurrentUser,
  updateProfileCulture,
  getRooms,
  isLoading,
}) => {
  const handleMessage = async (e) => {
    if (window.self === window.parent || e.source !== window.parent) return;

    const eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;

    if (frameHandlePing(eventData)) return;

    if (eventData.data) {
      const { data, methodName, callId } = eventData.data;

      let res;

      try {
        switch (methodName) {
          case "setConfig":
            {
              const requests = await Promise.all([
                setFrameConfig(data),
                userId &&
                  data.locale &&
                  updateProfileCulture(userId, data.locale),
              ]);
              res = requests[0];
            }
            break;
          case "getFolderInfo":
            res = selectedFolderStore;
            break;
          case "getFolders":
            res = folders;
            break;
          case "getFiles":
            res = files;
            break;
          case "getList":
            res = filesList;
            break;
          case "getSelection":
            res = selection;
            break;
          case "getUserInfo":
            res = await loadCurrentUser();
            break;
          case "getRooms":
            res = await getRooms(data);
            break;
          case "openModal":
            {
              const { type, options } = data;

              const eventType =
                type === "CreateFile" || type === "CreateFolder"
                  ? Events.CREATE
                  : Events.ROOM_CREATE;

              const eventDetail =
                type === "CreateFile" || type === "CreateFolder"
                  ? { extension: options, id: -1 }
                  : undefined;

              window.dispatchEvent(
                new CustomEvent(eventType, { detail: eventDetail }),
              );
            }
            break;
          case "createFile":
            {
              const { folderId, title, templateId, formId } = data;
              res = await createFile(folderId, title, templateId, formId);

              refreshFiles();
            }
            break;
          case "createFolder":
            {
              const { parentFolderId, title } = data;
              res = await createFolder(parentFolderId, title.trimEnd());

              refreshFiles();
            }
            break;
          case "createRoom":
            res = await createRoom(data);
            refreshFiles();
            break;
          case "createTag":
            {
              const { name } = data;
              const tagName = typeof data === "string" ? data : name;

              res = await createTag(tagName);
            }
            break;
          case "addTagsToRoom":
            {
              const { roomId, tags } = data;
              res = await addTagsToRoom(roomId, tags);
            }
            break;
          case "removeTagsFromRoom":
            {
              const { roomId, tags } = data;
              res = await removeTagsFromRoom(roomId, tags);
            }
            break;
          case "setListView":
            {
              const { viewType } = data;
              const type = typeof data === "string" ? data : viewType;

              res = await setViewAs(type);
            }
            break;
          case "createHash":
            {
              const { password, hashSettings } = data;
              res = createPasswordHash(password, hashSettings);
            }
            break;
          case "getHashSettings":
            {
              const settings = await getSettings();
              res = settings.passwordHash;
            }
            break;
          case "login":
            {
              const { email, passwordHash } = data;
              res = await login(email, passwordHash);
            }
            break;
          case "logout":
            res = logout();
            break;
          default:
            res = "Wrong method for this mode";
        }
      } catch (err) {
        res = err;
      }

      frameCallbackData(res, callId);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [handleMessage]);

  const callSetConfig = useCallback(
    () => frameCallCommand("setConfig", { src: window.location.origin }),
    [frameCallCommand, frameConfig?.frameId],
  );

  const callSetIsLoad = useCallback(
    () => frameCallCommand("setIsLoaded"),
    [frameCallCommand],
  );

  useEffect(() => {
    if (window.parent && !frameConfig?.frameId) callSetConfig();
  }, [callSetConfig, frameConfig?.frameId]);

  useEffect(() => {
    if (!isLoading) callSetIsLoad();
  }, [callSetIsLoad, isLoading]);
};

export default useSDK;
