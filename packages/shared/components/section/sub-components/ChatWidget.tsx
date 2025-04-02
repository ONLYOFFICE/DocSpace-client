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

import { memo, useEffect, useState } from "react";
import classNames from "classnames";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import ScreenSmallReactSvgUrl from "PUBLIC_DIR/images/icons/17/screen.small.react.svg?url";
import ScreenFullReactSvgUrl from "PUBLIC_DIR/images/icons/17/screen.full.react.svg?url";

import { DeviceType } from "../../../enums";
import { TViewAs } from "../../../types";

import { Portal } from "../../portal";
import { IconButton } from "../../icon-button";
import { Text } from "../../text";

import styles from "../Section.module.scss";

type HeaderProps = {
  isFullScreen: boolean;
  isMobile: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: VoidFunction;
};

const Header = ({
  isFullScreen,
  isMobile,
  setIsFullScreen,
  onClose,
}: HeaderProps) => {
  return (
    <div className={styles.chatPanelHeader}>
      <Text lineHeight="24px" fontSize="18px" isBold>
        AI Chat
      </Text>
      <div className={styles.chatPanelHeaderButtons}>
        {!isMobile ? (
          <IconButton
            iconName={
              isFullScreen ? ScreenSmallReactSvgUrl : ScreenFullReactSvgUrl
            }
            size={16}
            isClickable
            isFill={false}
            isStroke
            onClick={() => setIsFullScreen((value) => !value)}
          />
        ) : null}
        <IconButton
          iconName={CrossReactSvgUrl}
          size={16}
          isClickable
          isFill={false}
          isStroke
          onClick={onClose}
        />
      </div>
    </div>
  );
};

type ChatWidgetProps = {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  anotherDialogOpen: boolean;
  viewAs: TViewAs;
  currentDeviceType: DeviceType;
};

export const ChatWidget = memo(
  ({
    isVisible,
    setIsVisible,
    anotherDialogOpen,
    viewAs,
    currentDeviceType,
  }: ChatWidgetProps) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target?.id === "chatPanelWrapper") setIsVisible?.(false);
      };

      if (viewAs === "row" || currentDeviceType !== DeviceType.desktop)
        document.addEventListener("mousedown", onMouseDown);

      window.onpopstate = () => {
        if (currentDeviceType !== DeviceType.desktop && isVisible)
          setIsVisible?.(false);
      };

      return () => document.removeEventListener("mousedown", onMouseDown);
    }, [currentDeviceType, isVisible, setIsVisible, viewAs]);

    const onClose = () => setIsVisible?.(false);

    const panel = (
      <div
        className={classNames(styles.chatPanel, {
          [styles.fullScreen]: isFullScreen,
        })}
      >
        <Header
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          onClose={onClose}
          isMobile={currentDeviceType === DeviceType.mobile}
        />
        Work
      </div>
    );

    const renderPortal = () => {
      const rootElement = document.getElementById("root");

      return (
        <Portal
          element={<div className={styles.chatWrapper}>{panel}</div>}
          appendTo={rootElement || undefined}
          visible={isVisible ? !anotherDialogOpen : false}
        />
      );
    };

    const isMobileView =
      currentDeviceType === DeviceType.mobile ||
      currentDeviceType === DeviceType.tablet;

    return !isVisible ||
      (anotherDialogOpen && currentDeviceType !== DeviceType.desktop)
      ? null
      : isMobileView
        ? renderPortal()
        : panel;
  },
);

ChatWidget.displayName = "ChatWidget";
