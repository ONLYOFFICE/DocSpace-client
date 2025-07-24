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
import HorizontalDotsIcon from "PUBLIC_DIR/images/icons/16/horizontal-dots.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import SaveToFileIconUrl from "PUBLIC_DIR/images/message.save.svg?url";

import { isDesktop } from "../../../../../utils";
import { RectangleSkeleton } from "../../../../../skeletons";
import { exportChat } from "../../../../../api/ai";

import { DropDown } from "../../../../drop-down";
import { DropDownItem } from "../../../../drop-down-item";
import { IconButton } from "../../../../icon-button";
import { toastr } from "../../../../toast";
import { ContextMenu, ContextMenuRefType } from "../../../../context-menu";
import { Text } from "../../../../text";
import { Link, LinkType, LinkTarget } from "../../../../link";

import { useChatStore } from "../../../store/chatStore";
import { useMessageStore } from "../../../store/messageStore";

import RenameChat from "./RenameChat";

import styles from "../ChatHeader.module.scss";

const SelectChat = ({ isLoadingProp }: { isLoadingProp?: boolean }) => {
  const { t } = useTranslation(["Common"]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState("");
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);
  const contextMenuRef = React.useRef<ContextMenuRefType>(null);

  const { chats, isLoading, currentChat, fetchChat, deleteChat } =
    useChatStore();
  const { fetchMessages } = useMessageStore();

  const toggleOpen = () => {
    setIsOpen((value) => !value);
    setHoveredItem("");
  };

  const onSelectAction = (id: string) => {
    fetchChat(id);
    fetchMessages(id);
    toggleOpen();
  };

  const onRenameToggle = React.useCallback(() => {
    setIsOpen(false);
    setIsRenameOpen((value) => !value);
  }, []);

  const onDeleteAction = React.useCallback(() => {
    deleteChat(hoveredItem);
  }, [hoveredItem, deleteChat]);

  const onSaveToFileAction = React.useCallback(async () => {
    const res = await exportChat(hoveredItem);

    const title = chats.find((chat) => chat.id === hoveredItem)?.title;
    const toastMsg = (
      <Trans
        ns="Common"
        i18nKey="ChatExported"
        t={t}
        values={{ fileName: res?.title, title }}
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
  }, [hoveredItem, chats, t]);

  const model = React.useMemo(() => {
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

  const onShowContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    contextMenuRef.current?.show(e);
  };

  const maxHeight = chats.length > 7 ? { maxHeight: 224 } : {};

  if (isLoading || isLoadingProp) {
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

  const desktop = isDesktop();

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
          {...maxHeight}
          manualWidth="280px"
          isNoFixedHeightOptions
        >
          {chats.map(({ title, id }) => {
            return (
              <DropDownItem
                key={id}
                onClick={(e) => {
                  e.stopPropagation();

                  const target = e.target as HTMLElement;
                  const iconButtonWrapper = target.closest(
                    `.${styles.iconButtonWrapper}`,
                  );

                  if (iconButtonWrapper) {
                    return;
                  }

                  onSelectAction(id);
                }}
                className={classNames("drop-down-item")}
                isActive={id === currentChat?.id}
                data-id={id}
              >
                <div
                  className={styles.dropdowItemWrapper}
                  onMouseEnter={() => setHoveredItem(id)}
                >
                  <Text truncate>{title}</Text>
                  {hoveredItem === id || !desktop ? (
                    <div
                      className={styles.iconButtonWrapper}
                      onClick={onShowContextMenu}
                    >
                      <IconButton
                        iconName={HorizontalDotsIcon}
                        size={16}
                        isClickable
                        isFill
                        onClick={() => {}}
                      />
                      <ContextMenu ref={contextMenuRef} model={model} />
                    </div>
                  ) : null}
                </div>
              </DropDownItem>
            );
          })}
        </DropDown>
      ) : null}
      {isRenameOpen ? (
        <RenameChat
          chatId={hoveredItem}
          prevTitle={chats.find((chat) => chat.id === hoveredItem)?.title || ""}
          onRenameToggle={onRenameToggle}
        />
      ) : null}
    </>
  );
};

export default observer(SelectChat);
