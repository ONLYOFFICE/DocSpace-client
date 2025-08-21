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

import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";

import { DeviceType } from "../../../enums";
import { Portal } from "../../portal";
import { isMobile } from "../../../utils";

import { InfoPanelProps } from "../Section.types";
import styles from "../Section.module.scss";

const InfoPanel = ({
  children,
  isVisible,
  isMobileHidden,
  setIsVisible,
  canDisplay,
  anotherDialogOpen,
  viewAs,
  currentDeviceType,
  asideInfoPanel,
}: InfoPanelProps) => {
  const infoPanelRef = useRef<null | HTMLDivElement>(null);
  const [viewMobile, setViewMobile] = useState(false);

  const onCheckView = () => setViewMobile(isMobile());

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.id === "InfoPanelWrapper") setIsVisible?.(false);
    };

    if (viewAs === "row" || currentDeviceType !== DeviceType.desktop)
      document.addEventListener("mousedown", onMouseDown);

    window.onpopstate = () => {
      if (currentDeviceType !== DeviceType.desktop && isVisible)
        setIsVisible?.(false);
    };

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", onCheckView);
    };
  }, [currentDeviceType, isVisible, setIsVisible, viewAs]);

  const infoPanelComponent = (
    <div
      className={classNames("info-panel", styles.infoPanelWrapper, {
        [styles.asideInfoPanel]: asideInfoPanel && !viewMobile,
      })}
      id="InfoPanelWrapper"
      ref={infoPanelRef}
    >
      <div
        className={classNames(styles.infoPanel, {
          [styles.asideInfoPanel]: asideInfoPanel && !viewMobile,
        })}
      >
        {children}
      </div>
    </div>
  );

  const renderPortalInfoPanel = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={infoPanelComponent}
        appendTo={rootElement || undefined}
        visible={isVisible && !isMobileHidden ? !anotherDialogOpen : false}
      />
    );
  };

  const isMobileView =
    currentDeviceType === DeviceType.mobile ||
    currentDeviceType === DeviceType.tablet;

  return !isVisible ||
    !canDisplay ||
    (anotherDialogOpen && currentDeviceType !== DeviceType.desktop) ||
    (currentDeviceType !== DeviceType.desktop && isMobileHidden)
    ? null
    : isMobileView || (asideInfoPanel && !viewMobile)
      ? renderPortalInfoPanel()
      : infoPanelComponent;
};

export default InfoPanel;
