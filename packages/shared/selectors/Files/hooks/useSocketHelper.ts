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

const useSocketHelper = ({
  socketHelper,
  socketSubscribers,
  disabledItems,
  filterParam,
  setItems,
  setBreadCrumbs,
  setTotal,
  getIcon,
}: UseSocketHelperProps) => {
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
      } else if (opt?.type === "folder" && "roomType" in data) {
        item =
          data.roomType && "tags" in data
            ? convertRoomsToItems([data])[0]
            : convertFoldersToItems([data], disabledItems, filterParam)[0];
      }

      setItems((value) => {
        if (!item || !value) return value;

        if (opt.type === "folder") {
          setTotal((v) => v + 1);

          return [item, ...value];
        }

        if (opt.type === "file") {
          let idx = 0;

          for (let i = 0; i < value.length - 1; i += 1) {
            if (!value[i].isFolder) break;

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
    [disabledItems, filterParam, getIcon, setItems, setTotal],
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
