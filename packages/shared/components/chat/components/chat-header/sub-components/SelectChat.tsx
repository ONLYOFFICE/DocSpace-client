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
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";
import classNames from "classnames";

import SelectSessionReactSvg from "PUBLIC_DIR/images/select.session.react.svg";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import SaveToFileIconUrl from "PUBLIC_DIR/images/message.save.svg?url";

import { RectangleSkeleton } from "../../../../../skeletons";
import { exportChat } from "../../../../../api/ai";

import { DropDown } from "../../../../drop-down";
import { TBreadCrumb } from "../../../../selector/Selector.types";
import { toastr } from "../../../../toast";
import { Link, LinkType, LinkTarget } from "../../../../link";

import { useChatStore } from "../../../store/chatStore";
import { useMessageStore } from "../../../store/messageStore";

import { SelectChatProps } from "../../../Chat.types";

import ExportSelector from "../../export-selector";

import styles from "../ChatHeader.module.scss";

import RenameChat from "./RenameChat";
import {
  CHAT_LIST_MAX_HEIGHT,
  CHAT_LIST_ROW_HEIGHT,
  CHAT_LIST_WIDTH,
} from "../constants";
import { ChatList } from "./ChatList";

const SelectChat = ({ isLoadingProp, roomId, getIcon }: SelectChatProps) => {
  const { t } = useTranslation(["Common"]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState("");
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const {
    chats,
    isLoading,
    currentChat,
    fetchChat,
    deleteChat,
    totalChats,
    fetchNextChats,
    hasNextChats,
    updateUrlChatId,
  } = useChatStore();
  const { fetchMessages, startNewChat, isRequestRunning } = useMessageStore();

  const closeExportSelector = () => setIsExportOpen(false);

  const toggleOpen = () => {
    if (isRequestRunning) return;
    setIsOpen((value) => !value);
    setHoveredItem("");
  };

  const onSelectAction = (id: string) => {
    if (isRequestRunning) return;
    fetchChat(id);
    fetchMessages(id);
    toggleOpen();
  };

  const onRenameToggle = React.useCallback(() => {
    if (isRequestRunning) return;
    setIsOpen(false);
    setIsRenameOpen((value) => !value);
  }, [isRequestRunning]);

  const onDeleteAction = React.useCallback(async () => {
    if (isRequestRunning) return;
    await deleteChat(hoveredItem);
    if (hoveredItem === currentChat?.id) {
      startNewChat();
      updateUrlChatId("");
    }
    setIsOpen(false);
    setHoveredItem("");
  }, [
    hoveredItem,
    deleteChat,
    isRequestRunning,
    currentChat?.id,
    startNewChat,
    updateUrlChatId,
  ]);

  const onSaveToFileAction = React.useCallback(async () => {
    if (isRequestRunning) return;
    setIsExportOpen(true);
    setIsOpen(false);
  }, [hoveredItem, chats, isRequestRunning, t]);

  const getFileName = () => {
    const title = chats.find((chat) => chat.id === hoveredItem)?.title;

    return title ?? "";
  };

  const onSubmit = React.useCallback(
    async (
      selectedItemId: string | number | undefined,
      folderTitle: string,
      isPublic: boolean,
      breadCrumbs: TBreadCrumb[],
      fileName: string,
    ) => {
      if (!selectedItemId) return;

      const res = await exportChat(hoveredItem, selectedItemId, fileName);

      const title = chats.find((chat) => chat.id === hoveredItem)?.title;
      const toastMsg = (
        <Trans
          ns="Common"
          i18nKey="ChatExported"
          t={t}
          values={{ fileName, title }}
          components={{
            1: <b />,
            2: (
              <Link
                type={LinkType.page}
                target={LinkTarget.blank}
                href={res?.webUrl}
              />
            ),
          }}
        />
      );

      toastr.success(toastMsg);
      setIsExportOpen(false);
    },
    [hoveredItem, chats, isRequestRunning, t],
  );

  const contextModel = React.useMemo(() => {
    return [
      {
        key: "rename",
        label: t("Common:Rename"),
        icon: RenameReactSvgUrl,
        onClick: onRenameToggle,
      },
      {
        key: "save_to_file",
        label: t("Common:SaveToFile"),
        icon: SaveToFileIconUrl,
        onClick: onSaveToFileAction,
      },
      { key: "separator", isSeparator: true },
      {
        key: "remove",
        label: t("Common:Delete"),
        icon: RemoveSvgUrl,
        onClick: onDeleteAction,
      },
    ];
  }, [t, onDeleteAction, onRenameToggle, onSaveToFileAction]);

  const maxHeight =
    chats.length > 7
      ? CHAT_LIST_MAX_HEIGHT
      : CHAT_LIST_ROW_HEIGHT * chats.length;

  React.useEffect(() => {
    if (isRequestRunning) {
      setIsOpen(false);
    }
  }, [isRequestRunning]);

  if (isLoadingProp) {
    return (
      <RectangleSkeleton
        width="32px"
        height="32px"
        borderRadius="3px"
        style={{ minWidth: "32px" }}
      />
    );
  }

  if (!chats.length) return null;

  return (
    <>
      <div
        className={classNames(styles.selectChat, { [styles.open]: isOpen })}
        onClick={toggleOpen}
        ref={parentRef}
      >
        <SelectSessionReactSvg />
      </div>
      {isOpen ? (
        <DropDown
          open={isOpen}
          // isDefaultMode
          zIndex={500}
          clickOutsideAction={() => setIsOpen(false)}
          directionY="bottom"
          directionX="right"
          forwardedRef={parentRef}
          maxHeight={maxHeight}
          manualWidth={`${CHAT_LIST_WIDTH}px`}
          isNoFixedHeightOptions
        >
          <ChatList
            chats={chats}
            activeChatId={currentChat?.id}
            contextModel={contextModel}
            onSelectChat={onSelectAction}
            hoveredChatId={hoveredItem}
            setHoveredChatId={setHoveredItem}
            loadNextPage={fetchNextChats}
            hasNextPage={hasNextChats}
            isNextPageLoading={isLoading}
            total={totalChats}
          />
        </DropDown>
      ) : null}
      {isRenameOpen ? (
        <RenameChat
          chatId={hoveredItem}
          prevTitle={chats.find((chat) => chat.id === hoveredItem)?.title || ""}
          onRenameToggle={onRenameToggle}
        />
      ) : null}
      {isExportOpen ? (
        <ExportSelector
          getIcon={getIcon}
          showFolderSelector={isExportOpen}
          onCloseFolderSelector={closeExportSelector}
          roomId={roomId}
          getFileName={getFileName}
          onSubmit={onSubmit}
        />
      ) : null}
    </>
  );
};

export default observer(SelectChat);
