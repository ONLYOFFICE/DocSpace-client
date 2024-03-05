import React, { useCallback } from "react";
import { useTheme } from "styled-components";
import { Direction, VariableSizeList } from "react-window";

import { DeviceType } from "../../../enums";

import { CustomScrollbarsVirtualList } from "../../scrollbar";

import { StyledBox, StyledContainer } from "../Navigation.styled";
import { IDropBoxProps } from "../Navigation.types";

import NavigationLogo from "./LogoBlock";
import ArrowButton from "./ArrowBtn";
import ControlButtons from "./ControlBtn";
import Row from "./Row";

const DropBox = React.forwardRef<HTMLDivElement, IDropBoxProps>(
  (
    {
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

      currentDeviceType,
      navigationTitleContainerNode,
    },
    ref,
  ) => {
    const [dropBoxHeight, setDropBoxHeight] = React.useState(0);
    const countItems = navigationItems.length;

    const getItemSize = useCallback(
      (index: number): number => {
        if (index === countItems - 1) return 51;
        return currentDeviceType !== DeviceType.desktop ? 36 : 30;
      },
      [countItems, currentDeviceType],
    );

    const { interfaceDirection } = useTheme();
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
      <StyledBox
        ref={ref}
        height={sectionHeight < dropBoxHeight ? sectionHeight : null}
        dropBoxWidth={dropBoxWidth}
        withLogo={withLogo}
      >
        <StyledContainer
          isDropBoxComponent
          isInfoPanelVisible={isInfoPanelVisible}
          isDesktopClient={isDesktopClient}
          withLogo={!!withLogo && isTabletView}
          isDesktop={isDesktop}
        >
          {withLogo && (
            <NavigationLogo
              burgerLogo={burgerLogo}
              className="navigation-logo drop-box-logo"
            />
          )}
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
            showTitle
          />
        </StyledContainer>

        <VariableSizeList
          direction={interfaceDirection as Direction}
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
      </StyledBox>
    );
  },
);

DropBox.displayName = "DropBox";

export default React.memo(DropBox);
