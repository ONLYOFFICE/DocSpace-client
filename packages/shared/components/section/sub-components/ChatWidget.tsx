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

// import { useEffect } from "react";
import { memo } from "react";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import { TFile } from "../../../api/files/types";
import { DeviceType } from "../../../enums";
import { Portal } from "../../portal";
import { IconButton } from "../../icon-button";
import styles from "../Section.module.scss";

export const ChatWidget = memo(
  ({
    isVisible,
    setIsVisible,
    anotherDialogOpen,
    // viewAs,
    currentDeviceType,
    chatFiles,
  }: {
    isVisible: boolean;
    setIsVisible: (isVisible: boolean) => void;
    anotherDialogOpen?: boolean;
    // viewAs,
    currentDeviceType?: DeviceType;
    chatFiles: TFile[];
  }) => {
    const toChatFiles = () => {
      const files = chatFiles.filter((f) => f.fileExst === ".docx");

      return files.map((f) => {
        return { id: f.id, title: f.title };
      });
    };

    const files = toChatFiles();

    // console.log("files", files);

    // useEffect(() => {
    //   const onMouseDown = (e: MouseEvent) => {
    //     const target = e.target as HTMLElement;
    //     if (target?.id === "InfoPanelWrapper") setIsVisible?.(false);
    //   };

    //   if (viewAs === "row" || currentDeviceType !== DeviceType.desktop)
    //     document.addEventListener("mousedown", onMouseDown);

    //   window.onpopstate = () => {
    //     if (currentDeviceType !== DeviceType.desktop && isVisible)
    //       setIsVisible?.(false);
    //   };

    //   return () => document.removeEventListener("mousedown", onMouseDown);
    // }, [currentDeviceType, isVisible, setIsVisible, viewAs]);

    const onClose = () => setIsVisible(false);

    const infoPanelComponent = (
      <div className={styles.chatWrapper}>
        <IconButton
          style={{
            position: "absolute",
            right: "16px",
            top: "16px",
            zIndex: 9999,
          }}
          size={17}
          // className={styles.closeButton}
          iconName={CrossReactSvgUrl}
          onClick={onClose}
          isClickable
          isStroke
          aria-label="close"
        />
        <langflow-chat-widget
          // api_key: "string",
          // output_type: "string",
          // input_type: "string",
          // output_component: "string",
          // host_url: "string",
          // flow_id: "string",
          // tweaks: "json",
          list_files={JSON.stringify(files)}
        />
      </div>
    );

    const renderPortalInfoPanel = () => {
      const rootElement = document.getElementById("root");

      return (
        <Portal
          element={infoPanelComponent}
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
        ? renderPortalInfoPanel()
        : infoPanelComponent;
  },
);

ChatWidget.displayName = "ChatWidget";
