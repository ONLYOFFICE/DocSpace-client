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

import React from "react";
import { useTranslation } from "react-i18next";

import SocketHelper, {
  SocketCommands,
  SocketEvents,
  TOptSocket,
} from "../../../utils/socket";

import { getFileInfo, getFolderInfo } from "../../../api/files";
import { getRoomInfo } from "../../../api/rooms";
import { TSelectorItem } from "../../../components/selector";
import { TFile, TFolder } from "../../../api/files/types";
import { TRoom } from "../../../api/rooms/types";
import {
  convertRoomsToItems,
  convertFilesToItems,
  convertFoldersToItems,
} from "..";

import { UseSocketHelperProps } from "../types";
import { SettingsContext } from "../contexts/Settings";

const useSocketHelper = ({
  disabledItems,
  filterParam,
  withCreate,
  setItems,
  setBreadCrumbs,
  setTotal,
}: UseSocketHelperProps) => {
  const { t } = useTranslation(["Common"]);
  const { getIcon } = React.use(SettingsContext);

  const folderSubscribers = React.useRef(new Set<string>());

  const initRef = React.useRef(false);
  const subscribedId = React.useRef<null | number>(null);

  const unsubscribe = React.useCallback((id?: number | string) => {
    if (!id) {
      const roomParts = [...Array.from(folderSubscribers.current)];

      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts,
        individual: true,
      });

      folderSubscribers.current = new Set<string>();

      return;
    }

    const path = `DIR-${id}`;

    if (
      SocketHelper?.socketSubscribers.has(path) &&
      folderSubscribers.current.has(path)
    ) {
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: path,
        individual: true,
      });

      folderSubscribers.current.delete(path);
    }
  }, []);

  const subscribe = React.useCallback(
    (id: number) => {
      const roomParts = `DIR-${id}`;

      if (SocketHelper?.socketSubscribers.has(roomParts)) {
        subscribedId.current = id;

        return;
      }

      if (subscribedId.current) unsubscribe(subscribedId.current);

      folderSubscribers.current.add(roomParts);
      subscribedId.current = id;

      SocketHelper?.emit(SocketCommands.Subscribe, {
        roomParts,
        individual: true,
      });
    },
    [unsubscribe],
  );

  const addItem = React.useCallback(
    async (opt: TOptSocket) => {
      if (!opt?.data) return;
      const data: TFile | TFolder | TRoom = JSON.parse(opt.data);

      if (
        "folderId" in data && data.folderId
          ? data.folderId !== subscribedId.current
          : "parentId" in data && data.parentId !== subscribedId.current
      ) {
        return;
      }

      let item: TSelectorItem = {} as TSelectorItem;

      if (opt?.type === "file" && "folderId" in data) {
        const file = await getFileInfo(data.id);
        [item] = convertFilesToItems([file], getIcon, filterParam);
      } else if (opt?.type === "folder" && !("folderId" in data)) {
        if ("roomType" in data) {
          const room = await getRoomInfo(data.id);
          item = convertRoomsToItems([room], t)[0];
        } else {
          const folder = await getFolderInfo(data.id);
          item = convertFoldersToItems([folder], disabledItems, filterParam)[0];
        }
      }

      setItems((value) => {
        if (!item || !value) return value;

        if (opt.type === "folder") {
          setTotal((v) => v + 1);

          if (withCreate) {
            const newValue = [...value];

            let idx = 1;

            if (value[0]?.isInputItem) idx = 0;

            newValue.splice(idx, 1, item);

            return newValue;
          }

          return [item, ...value];
        }

        if (opt.type === "file") {
          let idx = 0;

          for (let i = 0; i < value.length - 1; i += 1) {
            if (
              !value[i]?.isFolder &&
              !value[i]?.isCreateNewItem &&
              !value[i]?.isInputItem
            )
              break;

            idx = i + 1;
          }

          const newValue = [...value];

          newValue.splice(idx, 0, item);

          setTotal((v) => v + 1);

          return newValue;
        }

        return value;
      });
    },
    [disabledItems, filterParam, getIcon, setItems, setTotal, t, withCreate],
  );

  const updateItem = React.useCallback(
    async (opt: TOptSocket) => {
      if (!opt?.data) return;

      const data: TFile | TFolder | TRoom = JSON.parse(opt.data);

      if (
        (("folderId" in data &&
          data.folderId &&
          data.folderId !== subscribedId.current) ||
          ("parentId" in data &&
            data.parentId &&
            data.parentId !== subscribedId.current)) &&
        data.id !== subscribedId.current
      )
        return;

      let item: TSelectorItem = {} as TSelectorItem;

      if (opt?.type === "file" && "folderId" in data) {
        const file = await getFileInfo(data.id);
        [item] = convertFilesToItems([file], getIcon, filterParam);
      } else if (opt?.type === "folder") {
        if ("roomType" in data) {
          const room = await getRoomInfo(data.id);
          item = convertRoomsToItems([room], t)[0];
        } else {
          const folder = await getFolderInfo(data.id);
          item = convertFoldersToItems([folder], disabledItems, filterParam)[0];
        }
      }

      if (item?.id === subscribedId.current) {
        return setBreadCrumbs?.((value) => {
          if (!value) return value;

          const newValue = [...value];

          if (newValue[newValue.length - 1].id === item?.id) {
            newValue[newValue.length - 1].label = item.label;
          }

          return newValue;
        });
      }

      setItems((value) => {
        if (!item || !value) return value;

        if (opt.type === "folder") {
          const idx = value.findIndex((v) => v.id === item?.id && v.isFolder);

          if (idx > -1) {
            const newValue = [...value];

            newValue.splice(idx, 1, item);

            return newValue;
          }

          setBreadCrumbs?.((breadCrumbsValue) => {
            return breadCrumbsValue;
          });
        }

        if (opt.type === "file") {
          const idx = value.findIndex((v) => v.id === item?.id && !v.isFolder);

          if (idx > -1) {
            const newValue = [...value];

            newValue.splice(idx, 1, item);

            return [...newValue];
          }
        }

        return value;
      });
    },
    [disabledItems, filterParam, getIcon, setBreadCrumbs, setItems, t],
  );

  const deleteItem = React.useCallback(
    (opt: TOptSocket) => {
      setItems((value) => {
        if (!value) return value;

        if (opt.type === "folder") {
          const newValue = value.filter(
            (v) => v?.id !== opt?.id || !v.isFolder,
          );

          if (newValue.length !== value.length) {
            setTotal((v) => v - 1);
          }

          return newValue;
        }
        if (opt.type === "file") {
          const newValue = value.filter((v) => v?.id !== opt?.id || v.isFolder);

          if (newValue.length !== value.length) {
            setTotal((v) => v - 1);
          }

          return newValue;
        }

        return value;
      });
    },
    [setItems, setTotal],
  );

  React.useEffect(() => {
    if (initRef.current) return;

    initRef.current = true;

    SocketHelper?.on(SocketEvents.ModifyFolder, (opt?: TOptSocket) => {
      switch (opt?.cmd) {
        case "create":
          addItem(opt);
          break;
        case "update":
          updateItem(opt);
          break;
        case "delete":
          deleteItem(opt);
          break;
        default:
      }
    });
  }, [addItem, updateItem, deleteItem]);

  React.useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return { subscribe, unsubscribe };
};

export default useSocketHelper;
