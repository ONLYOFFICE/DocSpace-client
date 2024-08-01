// (c) Copyright Ascensio System SIA 2009-2024
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

import { TSelectorItem } from "../../../components/selector";
import { TFile, TFolder } from "../../../api/files/types";
import { TRoom } from "../../../api/rooms/types";
import { TOptSocket } from "../../../utils/socket";

import {
  convertFilesToItems,
  convertFoldersToItems,
  convertRoomsToItems,
} from "../FilesSelector.utils";
import { UseSocketHelperProps } from "../FilesSelector.types";
import { SettingsContext } from "../contexts/Settings";

const useSocketHelper = ({
  socketHelper,
  socketSubscribers,
  disabledItems,
  filterParam,
  withCreate,
  setItems,
  setBreadCrumbs,
  setTotal,
}: UseSocketHelperProps) => {
  const { getIcon } = React.useContext(SettingsContext);

  const initRef = React.useRef(false);

  const subscribedId = React.useRef<null | number>(null);

  const unsubscribe = React.useCallback(
    (id: number, clear = true) => {
      if (clear) {
        subscribedId.current = null;
      }

      if (id && !socketSubscribers.has(`DIR-${id}`)) {
        socketHelper.emit({
          command: "unsubscribe",
          data: {
            roomParts: `DIR-${id}`,
            individual: true,
          },
        });
      }
    },
    [socketHelper, socketSubscribers],
  );

  const subscribe = React.useCallback(
    (id: number) => {
      const roomParts = `DIR-${id}`;

      if (socketSubscribers.has(roomParts)) return (subscribedId.current = id);

      if (subscribedId.current && !socketSubscribers.has(roomParts)) {
        unsubscribe(subscribedId.current, false);
      }

      socketHelper.emit({
        command: "subscribe",
        data: {
          roomParts: `DIR-${id}`,
          individual: true,
        },
      });

      subscribedId.current = id;
    },
    [socketHelper, socketSubscribers, unsubscribe],
  );

  const addItem = React.useCallback(
    (opt: TOptSocket) => {
      if (!opt?.data) return;

      const data: TFile | TFolder | TRoom = JSON.parse(opt.data);

      if (
        "folderId" in data && data.folderId
          ? data.folderId !== subscribedId.current
          : "parentId" in data && data.parentId !== subscribedId.current
      )
        return;

      let item: TSelectorItem = {} as TSelectorItem;

      if (opt?.type === "file" && "folderId" in data) {
        item = convertFilesToItems([data], getIcon, filterParam)[0];
      } else if (opt?.type === "folder" && !("folderId" in data)) {
        item =
          "roomType" in data && data.roomType && "tags" in data
            ? convertRoomsToItems([data])[0]
            : convertFoldersToItems([data], disabledItems, filterParam)[0];
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
    [disabledItems, filterParam, getIcon, setItems, setTotal, withCreate],
  );

  const updateItem = React.useCallback(
    (opt: TOptSocket) => {
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
        item = convertFilesToItems([data], getIcon, filterParam)[0];
      } else if (opt?.type === "folder" && "roomType" in data) {
        item =
          data.roomType && "tags" in data
            ? convertRoomsToItems([data])[0]
            : convertFoldersToItems([data], disabledItems, filterParam)[0];
      }

      if (item?.id === subscribedId.current) {
        return setBreadCrumbs((value) => {
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

          setBreadCrumbs((breadCrumbsValue) => {
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
    [disabledItems, filterParam, getIcon, setBreadCrumbs, setItems],
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

    socketHelper.on("s:modify-folder", (opt?: TOptSocket) => {
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
  }, [addItem, updateItem, deleteItem, socketHelper]);

  return { subscribe, unsubscribe };
};

export default useSocketHelper;
