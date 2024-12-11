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

import React from "react";

import {
  StyledControlButtonContainer,
  StyledTariffWrapper,
} from "../Navigation.styled";
import { IControlButtonProps } from "../Navigation.types";

import ToggleInfoPanelButton from "./ToggleInfoPanelBtn";
import PlusButton from "./PlusBtn";
import ContextButton from "./ContextBtn";
import TrashWarning from "./TrashWarning";
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
  showTitle,
  navigationButtonLabel,
  onNavigationButtonClick,
  tariffBar,
  title,
  isEmptyPage,
  onCloseDropBox,
  onContextOptionsClick,
  buttonRef,
  addButtonRef,
}: IControlButtonProps) => {
  const toggleInfoPanelAction = () => {
    toggleInfoPanel?.();
    toggleDropBox?.();
  };

  const navigationButtonBlock =
    navigationButtonLabel && !isFrame && !isRootFolder ? (
      <Button
        className="navigation_button"
        label={navigationButtonLabel}
        size={ButtonSize.extraSmall}
        ref={buttonRef}
        onClick={onNavigationButtonClick}
      />
    ) : null;
  const children =
    tariffBar && !isFrame ? React.cloneElement(tariffBar, { title }) : null;
  const isTabletView = isTablet();

  const contextOptionsFolder = getContextOptionsFolder();
  const containVisible = contextOptionsFolder.some(
    (item) => item.disabled === false,
  );

  return (
    <StyledControlButtonContainer isFrame={isFrame} showTitle={showTitle}>
      {!isRootFolder || (isTrashFolder && !isEmptyFilesList) ? (
        <>
          {!isMobile && canCreate && (
            <PlusButton
              className="add-button"
              getData={getContextOptionsPlus}
              withMenu={withMenu}
              onPlusClick={onPlusClick}
              forwardedRef={addButtonRef}
              isFrame={isFrame}
              title={titles?.actions}
              onCloseDropBox={onCloseDropBox}
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
            onCloseDropBox={onCloseDropBox}
            onContextOptionsClick={onContextOptionsClick}
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
              onCloseDropBox={onCloseDropBox}
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

          {isPublicRoom && containVisible && (
            <ContextButton
              id="header_optional-button"
              className="option-button"
              getData={getContextOptionsFolder}
              withMenu={withMenu}
              title={titles?.contextMenu}
              isTrashFolder={isTrashFolder}
              isMobile={isMobile || false}
              onCloseDropBox={onCloseDropBox}
              onContextOptionsClick={onContextOptionsClick}
            />
          )}
        </>
      )}
      {isDesktop && isTrashFolder && !isEmptyPage && (
        <TrashWarning title={titles?.trashWarning} />
      )}
      {navigationButtonLabel && !isTabletView && navigationButtonBlock}
      <StyledTariffWrapper>{children && children}</StyledTariffWrapper>
      {navigationButtonLabel && isTabletView && navigationButtonBlock}
    </StyledControlButtonContainer>
  );
};

export default ControlButtons;
