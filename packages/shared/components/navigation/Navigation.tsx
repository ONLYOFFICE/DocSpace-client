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

import React, { useCallback } from "react";
import { ReactSVG } from "react-svg";

import { Consumer, DomHelpers } from "../../utils";
import { DeviceType } from "../../enums";

import { Backdrop } from "../backdrop";

import ArrowButton from "./sub-components/ArrowBtn";
import Text from "./sub-components/Text";
import ControlButtons from "./sub-components/ControlBtn";
import ToggleInfoPanelButton from "./sub-components/ToggleInfoPanelBtn";
import NavigationLogo from "./sub-components/LogoBlock";
import DropBox from "./sub-components/DropBox";

import { StyledContainer } from "./Navigation.styled";
import { INavigationProps } from "./Navigation.types";

const Navigation = ({
  tReady,
  showText,
  isRootFolder,
  title,
  canCreate,
  isTabletView,

  onClickFolder,
  navigationItems,
  getContextOptionsPlus,
  getContextOptionsFolder,
  onBackToParentFolder,
  isTrashFolder,
  isEmptyFilesList,
  clearTrash,
  showFolderInfo,
  isCurrentFolderInfo,
  toggleInfoPanel,
  isInfoPanelVisible,
  titles,
  withMenu,
  onPlusClick,
  isEmptyPage,
  isDesktop: isDesktopClient,
  isRoom,
  isFrame,
  hideInfoPanel,
  showRootFolderTitle,
  withLogo,
  burgerLogo,
  isPublicRoom,
  titleIcon,
  currentDeviceType,
  rootRoomTitle,
  showTitle,
  navigationButtonLabel,
  onNavigationButtonClick,
  tariffBar,
  showNavigationButton,
  ...rest
}: INavigationProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [firstClick, setFirstClick] = React.useState(true);
  const [dropBoxWidth, setDropBoxWidth] = React.useState(0);
  // const [maxHeight, setMaxHeight] = React.useState("");

  const dropBoxRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const isDesktop = currentDeviceType === DeviceType.desktop;

  const toggleDropBox = useCallback(() => {
    if (navigationItems?.length === 0) return;
    if (isRootFolder) return setIsOpen(false);
    setIsOpen((prev) => !prev);

    if (containerRef.current)
      setDropBoxWidth(DomHelpers.getOuterWidth(containerRef.current));

    // const { top } = DomHelpers.getOffset(containerRef.current);

    // setMaxHeight(`calc(100vh - ${top}px)`);

    setFirstClick(true);
  }, [isRootFolder, navigationItems?.length]);

  const onCloseDropBox = () => {
    if (isOpen) setIsOpen(false);
  };

  const onMissClick = React.useCallback(
    (e: MouseEvent) => {
      const path = e.composedPath && e.composedPath();

      if (!firstClick) {
        if (dropBoxRef.current && !path.includes(dropBoxRef.current))
          toggleDropBox();
      } else {
        setFirstClick((prev) => !prev);
      }
    },
    [firstClick, toggleDropBox, setFirstClick],
  );

  const onClickAvailable = React.useCallback(
    (id: number | string, isRootRoom: boolean) => {
      onClickFolder?.(id, isRootRoom);
      toggleDropBox();
    },
    [onClickFolder, toggleDropBox],
  );

  const onResize = React.useCallback(() => {
    if (containerRef.current)
      setDropBoxWidth(DomHelpers.getOuterWidth(containerRef.current));
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener("click", onMissClick);
      window.addEventListener("resize", onResize);
    } else {
      window.removeEventListener("click", onMissClick);
      window.removeEventListener("resize", onResize);
      setFirstClick(true);
    }

    return () => {
      window.removeEventListener("click", onMissClick);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, onResize, onMissClick]);

  const onBackToParentFolderAction = React.useCallback(() => {
    setIsOpen((val) => !val);
    onBackToParentFolder?.();
  }, [onBackToParentFolder]);

  const showRootFolderNavigation =
    !isRootFolder &&
    showRootFolderTitle &&
    ((navigationItems && navigationItems.length > 1) || rootRoomTitle) &&
    currentDeviceType !== DeviceType.mobile;

  const navigationTitleNode = (
    <div className="title-block">
      {titleIcon && <ReactSVG className="title-icon" src={titleIcon} />}
      <Text
        className="title-block-text"
        title={title}
        isOpen={isOpen}
        isRootFolder={isRootFolder}
        onClick={toggleDropBox}
        isRootFolderTitle={false}
      />
    </div>
  );

  const onTextClick = React.useCallback(() => {
    onClickFolder(navigationItems[navigationItems.length - 2].id, false);
    setIsOpen(false);
  }, [navigationItems, onClickFolder]);

  const navigationTitleContainerNode = showRootFolderNavigation ? (
    <div className="title-container">
      <Text
        className="room-title"
        title={
          rootRoomTitle || navigationItems[navigationItems.length - 2].title
        }
        isOpen={isOpen}
        isRootFolder={isRootFolder}
        isRootFolderTitle
        onClick={onTextClick}
      />

      {navigationTitleNode}
    </div>
  ) : (
    navigationTitleNode
  );

  return (
    <Consumer>
      {(context) => (
        <>
          {isOpen && (
            <>
              <Backdrop
                visible={isOpen}
                withBackground={false}
                withoutBlur
                zIndex={400}
              />

              <DropBox
                {...rest}
                isDesktop={isDesktop}
                ref={dropBoxRef}
                dropBoxWidth={dropBoxWidth}
                sectionHeight={context.sectionHeight || 0}
                isRootFolder={isRootFolder}
                onBackToParentFolder={onBackToParentFolderAction}
                canCreate={canCreate}
                navigationItems={navigationItems}
                getContextOptionsFolder={getContextOptionsFolder}
                getContextOptionsPlus={getContextOptionsPlus}
                toggleDropBox={toggleDropBox}
                toggleInfoPanel={toggleInfoPanel}
                isInfoPanelVisible={isInfoPanelVisible}
                onClickAvailable={onClickAvailable}
                isDesktopClient={isDesktopClient}
                withLogo={withLogo}
                burgerLogo={burgerLogo}
                currentDeviceType={currentDeviceType}
                navigationTitleContainerNode={navigationTitleContainerNode}
                onCloseDropBox={onCloseDropBox}
              />
            </>
          )}
          <StyledContainer
            ref={containerRef}
            width={context.sectionWidth || 0}
            isRootFolder={isRootFolder}
            isTrashFolder={isTrashFolder}
            isDesktop={isDesktop}
            isDesktopClient={isDesktopClient}
            isInfoPanelVisible={isInfoPanelVisible}
            withLogo={!!withLogo}
            isPublicRoom={isPublicRoom}
            className="navigation-container"
            showNavigationButton={showNavigationButton}
          >
            {withLogo && (
              <NavigationLogo
                className="navigation-logo"
                logo={typeof withLogo === "string" ? withLogo : ""}
                burgerLogo={burgerLogo}
              />
            )}
            <ArrowButton
              isRootFolder={isRootFolder}
              onBackToParentFolder={onBackToParentFolder}
            />

            {showTitle && navigationTitleContainerNode}

            <ControlButtons
              isRootFolder={isRootFolder}
              canCreate={canCreate}
              getContextOptionsFolder={getContextOptionsFolder}
              getContextOptionsPlus={getContextOptionsPlus}
              isEmptyFilesList={isEmptyFilesList}
              toggleInfoPanel={toggleInfoPanel}
              isInfoPanelVisible={isInfoPanelVisible}
              isDesktop={isDesktop}
              titles={titles}
              withMenu={withMenu}
              onPlusClick={onPlusClick}
              isFrame={isFrame}
              isPublicRoom={isPublicRoom}
              isTrashFolder={isTrashFolder}
              showTitle={showTitle}
              navigationButtonLabel={navigationButtonLabel}
              onNavigationButtonClick={onNavigationButtonClick}
              tariffBar={tariffBar}
              title={title}
              isEmptyPage={isEmptyPage}
            />
          </StyledContainer>
          {isDesktop && !hideInfoPanel && (
            <ToggleInfoPanelButton
              id="info-panel-toggle--open"
              isRootFolder={isRootFolder}
              toggleInfoPanel={toggleInfoPanel}
              isInfoPanelVisible={isInfoPanelVisible}
              titles={titles}
            />
          )}
        </>
      )}
    </Consumer>
  );
};

export default React.memo(Navigation);
