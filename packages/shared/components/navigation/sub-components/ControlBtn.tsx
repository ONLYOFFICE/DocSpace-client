import React from "react";

import {
  StyledControlButtonContainer,
  StyledTariffWrapper,
} from "../Navigation.styled";
import { IControlButtonProps } from "../Navigation.types";

import ToggleInfoPanelButton from "./ToggleInfoPanelBtn";
import PlusButton from "./PlusBtn";
import ContextButton from "./ContextBtn";
import { Button, ButtonSize } from "../../button";
import { isTablet } from "../../../utils";

const ControlButtons = ({
  isRootFolder,
  canCreate,
  getContextOptionsFolder,
  getContextOptionsPlus,
  isEmptyFilesList,
  isInfoPanelVisible,
  toggleInfoPanel,
  toggleDropBox,
  isDesktop,
  titles,
  withMenu,
  onPlusClick,
  isFrame,
  isPublicRoom,
  isTrashFolder,
  isMobile,
  navigationButtonLabel,
  onNavigationButtonClick,
  tariffBar,
  title,
}: IControlButtonProps) => {
  const toggleInfoPanelAction = () => {
    toggleInfoPanel?.();
    toggleDropBox?.();
  };

  const navigationButtonBlock = navigationButtonLabel ? (
    <Button
      className="navigation_button"
      label={navigationButtonLabel}
      size={ButtonSize.extraSmall}
      onClick={onNavigationButtonClick}
    />
  ) : null;
  const children = tariffBar ? React.cloneElement(tariffBar, { title }) : null;
  const isTabletView = isTablet();

  return (
    <StyledControlButtonContainer isFrame={isFrame}>
      {!isRootFolder || (isTrashFolder && !isEmptyFilesList) ? (
        <>
          {!isMobile && canCreate && (
            <PlusButton
              className="add-button"
              getData={getContextOptionsPlus}
              withMenu={withMenu}
              onPlusClick={onPlusClick}
              isFrame={isFrame}
              title={titles?.actions}
            />
          )}

          {/* <ContextMenuButton
            id="header_optional-button"
            zIndex={402}
            className="option-button"
            directionX="right"
            iconName={VerticalDotsReactSvgUrl}
            size={15}
            isFill
            getData={getContextOptionsFolder}
            isDisabled={false}
            title={titles?.contextMenu}
          /> */}

          <ContextButton
            id="header_optional-button"
            className="option-button"
            getData={getContextOptionsFolder}
            withMenu={withMenu}
            // onPlusClick={onPlusClick}
            title={titles?.actions}
            isTrashFolder={isTrashFolder}
            isMobile={isMobile || false}
          />

          {!isDesktop && (
            <ToggleInfoPanelButton
              isRootFolder={isRootFolder}
              isInfoPanelVisible={isInfoPanelVisible}
              toggleInfoPanel={toggleInfoPanelAction}
              titles={titles}
            />
          )}
        </>
      ) : canCreate ? (
        <>
          {!isMobile && (
            <PlusButton
              id="header_add-button"
              className="add-button"
              getData={getContextOptionsPlus}
              withMenu={withMenu}
              onPlusClick={onPlusClick}
              isFrame={isFrame}
              title={titles?.actions}
            />
          )}
          {!isDesktop && (
            <ToggleInfoPanelButton
              isRootFolder={isRootFolder}
              isInfoPanelVisible={isInfoPanelVisible}
              toggleInfoPanel={toggleInfoPanelAction}
              titles={titles}
            />
          )}
        </>
      ) : (
        <>
          {!isDesktop && (
            <ToggleInfoPanelButton
              isRootFolder={isRootFolder}
              isInfoPanelVisible={isInfoPanelVisible}
              toggleInfoPanel={toggleInfoPanelAction}
              titles={titles}
            />
          )}

          {isPublicRoom && (
            <ContextButton
              id="header_optional-button"
              className="option-button"
              getData={getContextOptionsFolder}
              withMenu={withMenu}
              title={titles?.contextMenu}
              isTrashFolder={isTrashFolder}
              isMobile={isMobile || false}
            />
          )}
        </>
      )}

      {navigationButtonLabel && !isTabletView && navigationButtonBlock}
      <StyledTariffWrapper>{children && children}</StyledTariffWrapper>
      {navigationButtonLabel && isTabletView && navigationButtonBlock}
    </StyledControlButtonContainer>
  );
};

export default ControlButtons;
