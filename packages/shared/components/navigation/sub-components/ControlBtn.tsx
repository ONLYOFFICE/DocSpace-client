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

import { isTablet } from "../../../utils";
import { Button, ButtonSize } from "../../button";

import styles from "../Navigation.module.scss";

import { TControlButtonProps } from "../Navigation.types";

import ToggleInfoPanelButton from "./ToggleInfoPanelBtn";
import PlusButton from "./PlusBtn";
import ContextButton from "./ContextBtn";
import WarningComponent from "./WarningComponent";

const ControlButtons = ({
  isRootFolder,
  isInfoPanelVisible,
  toggleInfoPanel,
  toggleDropBox,
  titles,

  // Plus button props
  canCreate,
  getContextOptionsPlus,
  withMenu,
  onPlusClick,
  isFrame,
  onCloseDropBox,

  // Context button props
  getContextOptionsFolder,
  isTrashFolder,
  isMobile,
  onContextOptionsClick,
  isPublicRoom,

  // Navigation button props
  navigationButtonLabel,
  onNavigationButtonClick,

  // Visibility controls
  isDesktop,
  showTitle,

  // Tariff bar
  tariffBar,
  title,

  // Guidance props
  addButtonRef,
  buttonRef,
  contextButtonAnimation,
  guidAnimationVisible,
  setGuidAnimationVisible,
  isContextButtonVisible,

  isPlusButtonVisible,
}: TControlButtonProps) => {
  const toggleInfoPanelAction = () => {
    toggleInfoPanel?.();
    toggleDropBox?.();
  };

  const isTabletView = isTablet();
  const contextOptionsFolder = getContextOptionsFolder();
  const containVisible = contextOptionsFolder.some((item) => !item.disabled);

  const renderNavigationButton = () => {
    if (!navigationButtonLabel || isFrame || isRootFolder) return null;

    return (
      <Button
        ref={buttonRef}
        className="navigation_button"
        label={navigationButtonLabel}
        size={ButtonSize.extraSmall}
        onClick={onNavigationButtonClick}
      />
    );
  };

  const renderTariffBar = () => {
    if (!tariffBar || isFrame) return null;
    return (
      <div className={styles.tariffWrapper}>
        {React.cloneElement(tariffBar, { title })}
      </div>
    );
  };

  const renderPlusButton = () => {
    if ((isMobile && !isFrame) || !canCreate) return null;

    return (
      <PlusButton
        forwardedRef={addButtonRef}
        id="header_add-button"
        className="add-button"
        getData={getContextOptionsPlus}
        withMenu={withMenu}
        onPlusClick={onPlusClick}
        isFrame={isFrame}
        title={titles?.actions}
        onCloseDropBox={onCloseDropBox}
      />
    );
  };

  const renderContextButton = (visible: boolean) => {
    if (!visible || isFrame) return null;

    return (
      <ContextButton
        id="header_optional-button"
        className="option-button"
        getData={getContextOptionsFolder}
        withMenu={withMenu}
        title={titles?.actions}
        isTrashFolder={isTrashFolder}
        isMobile={isMobile || false}
        onCloseDropBox={onCloseDropBox}
        onContextOptionsClick={onContextOptionsClick}
        contextButtonAnimation={contextButtonAnimation}
        guidAnimationVisible={guidAnimationVisible}
        setGuidAnimationVisible={setGuidAnimationVisible}
      />
    );
  };

  const renderToggleInfoPanel = () => {
    if (isDesktop) return null;

    return (
      <ToggleInfoPanelButton
        isRootFolder={isRootFolder}
        isInfoPanelVisible={isInfoPanelVisible}
        toggleInfoPanel={toggleInfoPanelAction}
        titles={titles}
      />
    );
  };

  const renderWarning = () => {
    if (!isDesktop || !titles?.warningText) return null;

    return <WarningComponent title={titles?.warningText} />;
  };

  return (
    <div
      className={styles.controlButtonContainer}
      data-is-frame={isFrame}
      data-show-title={showTitle}
    >
      {isPlusButtonVisible ? renderPlusButton() : null}
      {renderContextButton((isContextButtonVisible && !isPublicRoom) ?? false)}
      {renderToggleInfoPanel()}
      {renderContextButton((isPublicRoom && containVisible) ?? false)}
      {renderWarning()}
      {!isTabletView ? renderNavigationButton() : null}
      {renderTariffBar()}
      {isTabletView ? renderNavigationButton() : null}
    </div>
  );
};

export default ControlButtons;
