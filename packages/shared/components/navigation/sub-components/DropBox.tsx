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

import React, { useCallback } from "react";
import { VariableSizeList } from "react-window";

import { DeviceType } from "../../../enums";

import { CustomScrollbarsVirtualList } from "../../scrollbar";

import styles from "../Navigation.module.scss";
import { TDropBoxProps } from "../Navigation.types";
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";

import NavigationLogo from "./LogoBlock";
import ArrowButton from "./ArrowBtn";
import ControlButtons from "./ControlBtn";
import Row from "./Row";

const DropBox = ({
  ref,
  sectionHeight,
  dropBoxWidth,
  isRootFolder,
  onBackToParentFolder,
  canCreate,
  navigationItems,
  getContextOptionsFolder,
  getContextOptionsPlus,
  toggleDropBox,
  toggleInfoPanel,
  onClickAvailable,
  isInfoPanelVisible,
  isDesktop,
  isDesktopClient,
  withLogo,
  burgerLogo,
  isFrame,
  currentDeviceType,
  navigationTitleContainerNode,
  onCloseDropBox,
  isContextButtonVisible,
  isPublicRoom,
  isPlusButtonVisible,
}: TDropBoxProps) => {
  const [dropBoxHeight, setDropBoxHeight] = React.useState(0);
  const { interfaceDirection } = useInterfaceDirection();

  const countItems = navigationItems.length;

  const getItemSize = useCallback(
    (index: number): number => {
      if (index === countItems - 1) return 51;
      return currentDeviceType !== DeviceType.desktop ? 36 : 30;
    },
    [countItems, currentDeviceType],
  );

  React.useEffect(() => {
    const itemsHeight = navigationItems.map((item, index) =>
      getItemSize(index),
    );

    const currentHeight = itemsHeight.reduce((a, b) => a + b);

    let navHeight = 41;

    if (currentDeviceType === DeviceType.tablet) {
      navHeight = 49;
    }

    if (currentDeviceType === DeviceType.mobile) {
      navHeight = 45;
    }

    setDropBoxHeight(
      currentHeight + navHeight > sectionHeight
        ? sectionHeight - navHeight - 20
        : currentHeight,
    );
  }, [sectionHeight, currentDeviceType, navigationItems, getItemSize]);

  const isTabletView = currentDeviceType === DeviceType.tablet;

  return (
    <div
      ref={ref}
      className={styles.box}
      data-with-logo={withLogo ? "true" : "false"}
      data-is-frame={isFrame ? "true" : "false"}
      style={
        {
          "--drop-box-width": `${dropBoxWidth}px`,
          "--drop-box-height":
            sectionHeight < dropBoxHeight ? `${sectionHeight}px` : null,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.container}
        data-is-drop-box-component="true"
        data-is-desktop-client={isDesktopClient ? "true" : "false"}
        data-with-logo={!!withLogo && isTabletView ? "true" : "false"}
        data-is-desktop={isDesktop ? "true" : "false"}
        data-is-frame={isFrame ? "true" : "false"}
        data-is-frame-logo={isFrame && withLogo ? "true" : "false"}
        data-is-root-folder={isRootFolder ? "true" : "false"}
      >
        {withLogo ? (
          <NavigationLogo
            burgerLogo={burgerLogo}
            className="navigation-logo drop-box-logo"
          />
        ) : null}
        <ArrowButton
          isRootFolder={isRootFolder}
          onBackToParentFolder={onBackToParentFolder}
        />

        {navigationTitleContainerNode}

        <ControlButtons
          isDesktop={isDesktop}
          isMobile={currentDeviceType !== DeviceType.desktop}
          isRootFolder={isRootFolder}
          canCreate={canCreate}
          getContextOptionsFolder={getContextOptionsFolder}
          getContextOptionsPlus={getContextOptionsPlus}
          toggleInfoPanel={toggleInfoPanel}
          toggleDropBox={toggleDropBox}
          isInfoPanelVisible={isInfoPanelVisible}
          onCloseDropBox={onCloseDropBox}
          showTitle
          isContextButtonVisible={isContextButtonVisible}
          isPublicRoom={isPublicRoom}
          isPlusButtonVisible={isPlusButtonVisible}
        />
      </div>

      <VariableSizeList
        direction={interfaceDirection}
        height={dropBoxHeight}
        width="auto"
        itemCount={countItems}
        itemSize={getItemSize}
        itemData={[
          navigationItems,
          onClickAvailable,
          { withLogo: !!withLogo, currentDeviceType },
        ]}
        outerElementType={CustomScrollbarsVirtualList}
      >
        {Row}
      </VariableSizeList>
    </div>
  );
};

DropBox.displayName = "DropBox";

export default React.memo(DropBox);
