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
  navigationButtonLabel,
  onNavigationButtonClick,
  tariffBar,

  ...rest
}: INavigationProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [firstClick, setFirstClick] = React.useState(true);
  const [dropBoxWidth, setDropBoxWidth] = React.useState(0);
  // const [maxHeight, setMaxHeight] = React.useState("");

  const dropBoxRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const isDesktop = currentDeviceType === DeviceType.desktop;

  const infoPanelIsVisible = React.useMemo(
    () => isDesktop && (!isEmptyPage || (isEmptyPage && isRoom)),
    [isDesktop, isEmptyPage, isRoom],
  );

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

  const onMissClick = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
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

            {navigationTitleContainerNode}

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
              navigationButtonLabel={navigationButtonLabel}
              onNavigationButtonClick={onNavigationButtonClick}
              tariffBar={tariffBar}
              title={title}
              isEmptyPage={isEmptyPage}
            />
          </StyledContainer>
          {infoPanelIsVisible && !hideInfoPanel && (
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
