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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import { TNewFiles } from "@docspace/shared/api/rooms/types";
import { Portal } from "@docspace/shared/components/portal";
import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Nullable } from "@docspace/shared/types";
import { isDesktop, isMobile } from "@docspace/shared/utils";
import { ButtonKeys } from "@docspace/shared/enums";

import { Backdrop } from "@docspace/shared/components/backdrop";
import {
  NewFilesPanelInjectStore,
  NewFilesPanelProps,
} from "../NewFilesBadge.types";
import { StyledPanel } from "../NewFilesBadge.styled";

import { NewFilesPanelLoader } from "./NewFilesPanelLoader";
import { NewFilesPanelItem } from "./NewFilesPanelItem";

const MIN_LOADER_TIMER = 500;

export const NewFilesPanelComponent = ({
  position,
  folderId,
  onClose,

  isRoom,

  culture,
  markAsRead,
}: NewFilesPanelProps) => {
  const { t } = useTranslation(["Files"]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkAsReadRunning, setIsMarkAsReadRunning] = React.useState(false);
  const [data, setData] = React.useState<TNewFiles[]>([]);

  const requestRunning = React.useRef<boolean>(false);
  const dataFetched = React.useRef<boolean>(false);
  const timerRef = React.useRef<Nullable<NodeJS.Timeout>>(null);

  const isRooms = folderId === "rooms";

  const markAsReadAction = React.useCallback(async () => {
    if (isMarkAsReadRunning) return;

    setIsMarkAsReadRunning(true);

    const folderIDs: (string | number)[] = [];

    if (isRooms) {
      data.forEach(({ items }) => {
        items.forEach((item) => {
          if ("room" in item) folderIDs.push(item.room.id);
        });
      });
    } else {
      folderIDs.push(folderId);
    }

    await markAsRead?.(folderIDs, []);
    setIsMarkAsReadRunning(false);

    onClose();
  }, [folderId, isMarkAsReadRunning, isRooms, data, markAsRead, onClose]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!folderId || dataFetched.current || requestRunning.current) return;

    const getData = async () => {
      try {
        setIsLoading(true);
        const startLoaderTime = new Date();

        const newFiles = isRooms
          ? await api.files.getNewFiles(folderId)
          : await api.files.getNewFolderFiles(folderId);

        dataFetched.current = true;
        requestRunning.current = false;

        setData(newFiles);
        const currentDate = new Date();

        const ms = currentDate.getTime() - startLoaderTime.getTime();
        if (ms < MIN_LOADER_TIMER) {
          return (timerRef.current = setTimeout(() => {
            setIsLoading(false);
          }, MIN_LOADER_TIMER - ms));
        }

        setIsLoading(false);
      } catch (e) {
        requestRunning.current = false;
        onClose();
        setIsLoading(false);
        toastr.error(e as string);
      }
    };

    requestRunning.current = true;

    getData();
  }, [folderId, isRooms, onClose, setIsLoading]);

  React.useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.esc) {
        return onClose();
      }

      if (e.key === ButtonKeys.enter) {
        return markAsReadAction();
      }
    };

    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [markAsReadAction, onClose]);

  const isMobileDevice = !isDesktop();

  const markAsReadButton = (
    <Button
      className="mark-as-read-button"
      scale
      label={t("MarkRead")}
      size={isMobileDevice ? ButtonSize.normal : ButtonSize.small}
      onClick={markAsReadAction}
      isLoading={isMarkAsReadRunning}
    />
  );

  const content = isLoading ? (
    <NewFilesPanelLoader isRooms={isRooms} />
  ) : (
    <>
      {data.map(({ date, items }, index) => {
        return (
          <NewFilesPanelItem
            key={date}
            date={date}
            items={items}
            isRooms={isRooms}
            isFirst={index === 0}
            culture={culture}
            onClose={onClose}
          />
        );
      })}
    </>
  );

  const panel = (
    <>
      <StyledPanel className="new-files-panel" position={position}>
        <Scrollbar autoFocus>{content}</Scrollbar>
        {markAsReadButton}
      </StyledPanel>
      {!isMobile() ? (
        <Backdrop visible withoutBackground withoutBlur onClick={onClose} />
      ) : null}
    </>
  );

  const mobilePanel = (
    <ModalDialog
      visible
      isCloseable
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withFooterBorder
      withBodyScroll
    >
      <ModalDialog.Header>
        {isRooms ? t("NewInRooms") : isRoom ? t("NewInRoom") : t("NewInFolder")}
      </ModalDialog.Header>
      <ModalDialog.Body>{content}</ModalDialog.Body>
      <ModalDialog.Footer>{markAsReadButton}</ModalDialog.Footer>
    </ModalDialog>
  );

  const portal = <Portal element={panel} />;

  return isMobile() ? mobilePanel : portal;
};

export const NewFilesPanel = inject(
  ({ settingsStore, filesActionsStore }: NewFilesPanelInjectStore) => {
    const { culture } = settingsStore;
    const { markAsRead } = filesActionsStore;

    return { culture, markAsRead };
  },
)(observer(NewFilesPanelComponent));
