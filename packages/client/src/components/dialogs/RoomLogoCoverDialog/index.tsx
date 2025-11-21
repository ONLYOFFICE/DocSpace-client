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
import styled, { css, useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import {
  mobile,
  tablet,
  isMobile,
  isDesktop,
  isTablet,
  size,
} from "@docspace/shared/utils";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import RoomLogoCover from "./sub-components/RoomLogoCover";
import { CoverDialogProps, ILogoCover } from "./RoomLogoCoverDialog.types";

const PADDING_HEIGHT = 84;
const HEIGHT_WITHOUT_BODY = 158;
const CONTENT_SCROLL_DIFF = 260;

const DESKTOP_HEIGHT = 648;
const TABLET_HEIGHT = 854;

const BREAKPOINT_GENERAL_SCROLL = 640;
const HEADER = 70;
const BUTTONS = 80;

const StyledModalDialog = styled(ModalDialog)<{
  heightProp?: string;
  scrollBodyHeight?: null | number;
}>`
  #modal-dialog {
    width: 422px;
    height: ${(props) => props.heightProp};

    @media ${tablet} {
      width: 464px;
    }

    .modal-header {
      height: 54px;
      min-height: 54px;
    }
    .modal-body {
      padding: 0;
      padding-inline-start: 16px;

      ${(props) =>
        props.scrollBodyHeight &&
        css`
          height: ${`${props.scrollBodyHeight}px`};

          .room-logo-container {
            padding-left: 15px;
          }

          .icon-container {
            padding-right: 1px;
          }
        `}
    }

    .modal-footer {
      margin-top: 8px;
    }

    @media ${mobile} {
      margin-bottom: 16px;
      width: 100vw;

      .modal-body {
        padding: 0px 16px 8px;
      }

      .modal-footer {
        margin-top: 0px;
      }

      .modal-header {
        margin-bottom: 16px;
      }
    }
  }
`;

const RoomLogoCoverDialog = ({
  setRoomLogoCoverDialogVisible,
  getCovers,
  covers,
  setRoomLogoCover,
  createRoomDialogVisible,
  editRoomDialogPropsVisible,
  templateEventVisible,
  setCover,
  setRoomCoverDialogProps,
  roomCoverDialogProps,
  roomLogoCoverDialogVisible,
  setEnabledHotkeys,
  createAgentDialogVisible,
  editAgentDialogVisible,
  uploadedFile,
  setUploadedFile,
  isAIAgentsFolderRoot,
}: CoverDialogProps) => {
  const { t } = useTranslation(["Common", "RoomLogoCover"]);
  const theme = useTheme();

  const defaultHeight = isDesktop() ? DESKTOP_HEIGHT : TABLET_HEIGHT;

  const [height, setHeight] = React.useState(`${defaultHeight}px`);
  const [view, setView] = React.useState(isDesktop() ? "desktop" : "tablet");
  const [openColorPicker, setOpenColorPicker] = React.useState<boolean>(false);
  const [scrollBodyHeight, setScrollBodyHeight] = React.useState<null | number>(
    null,
  );

  const contentRef = React.useRef<HTMLDivElement>(null);

  const recalculateHeight = React.useCallback(() => {
    const screenHeight = document.documentElement.clientHeight;

    const horizontalScreenOrientation =
      screenHeight < document.documentElement.clientWidth;

    const useGeneralScroll =
      horizontalScreenOrientation && screenHeight < BREAKPOINT_GENERAL_SCROLL;

    if (useGeneralScroll)
      setScrollBodyHeight(screenHeight - HEADER - BUTTONS - PADDING_HEIGHT);
    else if (scrollBodyHeight) setScrollBodyHeight(null);

    if (contentRef.current) {
      const contentHeight =
        contentRef?.current?.getBoundingClientRect()?.height;
      const h = contentHeight + HEIGHT_WITHOUT_BODY;

      const maxH = isDesktop() ? DESKTOP_HEIGHT : TABLET_HEIGHT;

      const isMaxHeight =
        (isDesktop() && DESKTOP_HEIGHT <= h) ||
        (isTablet() && TABLET_HEIGHT <= h);

      if (size.desktop > window.innerWidth && view === "desktop") {
        setView("tablet");
        setHeight(`${maxH}px`);
        return;
      }

      if (size.desktop < window.innerWidth && view === "tablet") {
        setView("desktop");
        setHeight(`${maxH}px`);
        return;
      }

      if (h + PADDING_HEIGHT >= window.innerHeight) {
        setHeight(`${window.innerHeight - PADDING_HEIGHT}px`);
      } else if (isMaxHeight) {
        return setHeight(`${maxH}px`);
      } else if (window.innerHeight >= h + PADDING_HEIGHT && !isMaxHeight) {
        setHeight(`${window.innerHeight - PADDING_HEIGHT}px`);
      } else setHeight(`${h}px`);
    }
  }, [view, roomLogoCoverDialogVisible, scrollBodyHeight]);

  const scrollH = React.useMemo(() => {
    return `${Number(height.replace("px", "")) - CONTENT_SCROLL_DIFF}px`;
  }, [height]);

  React.useLayoutEffect(() => {
    if (contentRef.current) {
      const { height: h } = contentRef.current.getBoundingClientRect();
      setHeight(`${h}px`);
    }
  }, [roomLogoCoverDialogVisible]);

  React.useLayoutEffect(() => {
    recalculateHeight();
  }, [roomLogoCoverDialogVisible, recalculateHeight, contentRef.current]);

  React.useEffect(() => {
    window.addEventListener("resize", recalculateHeight);
    return () => {
      window.removeEventListener("resize", recalculateHeight);
    };
  }, [recalculateHeight]);

  React.useEffect(() => {
    getCovers();
  }, [getCovers]);

  const onCloseRoomLogo = (e?: React.MouseEvent, withSelection = true) => {
    if (openColorPicker) return;
    setRoomCoverDialogProps({
      ...roomCoverDialogProps,
      withoutIcon: true,
      withSelection,
    });
    setRoomLogoCoverDialogVisible(false);

    if (uploadedFile) setUploadedFile(null);
  };

  const handleSubmit = () => {
    const icon = roomCoverDialogProps.withoutIcon
      ? ""
      : roomCoverDialogProps.icon;

    setCover(roomCoverDialogProps.color!, icon as string);

    if (
      createRoomDialogVisible ||
      editRoomDialogPropsVisible ||
      createAgentDialogVisible ||
      editAgentDialogVisible ||
      templateEventVisible
    ) {
      onCloseRoomLogo(undefined, false);
      if (uploadedFile) setUploadedFile(null);
      return;
    }

    setRoomLogoCover();
    onCloseRoomLogo(undefined);
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Esc" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onCloseRoomLogo();
      }
    };

    document.addEventListener("keyup", onKeyDown, true);

    return () => {
      document.removeEventListener("keyup", onKeyDown, true);
    };
  }, []);

  React.useEffect(() => {
    setEnabledHotkeys?.(false);

    return () => {
      setEnabledHotkeys?.(true);
    };
  }, [roomLogoCoverDialogVisible]);

  return (
    <StyledModalDialog
      visible
      autoMaxHeight
      heightProp={height}
      onClose={onCloseRoomLogo}
      displayType={isMobile() ? ModalDialogType.aside : ModalDialogType.modal}
      withBodyScroll
      scrollBodyHeight={scrollBodyHeight}
      withBodyScrollForcibly={!!scrollBodyHeight}
      isScrollLocked={openColorPicker}
      dataTestId="room_logo_cover_dialog"
    >
      <ModalDialog.Header>
        {isAIAgentsFolderRoot
          ? t("RoomLogoCover:AgentCover")
          : t("RoomLogoCover:RoomCover")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <RoomLogoCover
          forwardedRef={contentRef}
          scrollHeight={scrollH}
          covers={covers}
          openColorPicker={openColorPicker}
          setOpenColorPicker={setOpenColorPicker}
          generalScroll={!!scrollBodyHeight}
          isScrollLocked={openColorPicker}
          setCover={setCover}
          cover={roomCoverDialogProps.icon as unknown as ILogoCover}
          currentColorScheme={theme.currentColorScheme!}
          setRoomCoverDialogProps={setRoomCoverDialogProps}
          roomCoverDialogProps={roomCoverDialogProps}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          tabIndex={0}
          size={ButtonSize.normal}
          label={t("Common:ApplyButton")}
          onClick={handleSubmit}
          testId="room_logo_cover_apply_button"
        />
        <Button
          scale
          tabIndex={0}
          onClick={onCloseRoomLogo}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          testId="room_logo_cover_cancel_button"
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject<TStore>(
  ({ dialogsStore, filesStore, avatarEditorDialogStore, treeFoldersStore }) => {
    const {
      setCover,
      getCovers,
      createRoomDialogProps,
      editRoomDialogProps,
      createAgentDialogProps,
      editAgentDialogProps,
      setRoomLogoCoverDialogVisible,
      roomLogoCoverDialogVisible,

      covers,
      setRoomLogoCover,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      templateEventVisible,
    } = dialogsStore;

    const {
      uploadedFile,

      setUploadedFile,
    } = avatarEditorDialogStore;

    const { isAIAgentsFolderRoot } = treeFoldersStore;
    return {
      setRoomLogoCoverDialogVisible,
      roomLogoCoverDialogVisible,
      getCovers,
      covers,
      setCover,
      setRoomLogoCover,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      createRoomDialogVisible: createRoomDialogProps.visible,
      editRoomDialogPropsVisible: editRoomDialogProps.visible,
      createAgentDialogVisible: createAgentDialogProps.visible,
      editAgentDialogVisible: editAgentDialogProps.visible,
      templateEventVisible,
      setEnabledHotkeys: filesStore.setEnabledHotkeys,
      uploadedFile,

      setUploadedFile,
      isAIAgentsFolderRoot,
    };
  },
)(observer(RoomLogoCoverDialog));
