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

import PlusThemeSvgUrl from "PUBLIC_DIR/images/plus.theme.svg?url";
import React, { useEffect } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import styled, { css } from "styled-components";
import { Button } from "@docspace/shared/components/button";
import { withTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";
import { isMobile } from "@docspace/shared/utils";

const StyledComponent = styled(ModalDialog)`
  .modal-dialog-aside-footer {
    width: 100%;
    bottom: 0 !important;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: 0;
          `
        : css`
            left: 0;
          `}
    padding: 16px;
    box-shadow: 0px 12px 40px rgba(4, 15, 27, 0.12);
  }

  .flex {
    display: flex;
    justify-content: space-between;

    :not(:last-child) {
      padding-bottom: 20px;
    }

    ${!isMobile() &&
    css`
      max-width: 448px;
    `}
  }

  .name-color {
    font-weight: 700;
    font-size: ${(props) => props.theme.getCorrectFontSize("18px")};
    line-height: 24px;
  }

  .relative {
    position: relative;
  }

  .accent-box {
    background: ${(props) =>
      props.currentColorAccent
        ? props.currentColorAccent
        : props.theme.isBase
          ? `#eceef1 url(${PlusThemeSvgUrl}) no-repeat center`
          : `#474747 url(${PlusThemeSvgUrl}) no-repeat center`};
  }

  .buttons-box {
    background: ${(props) =>
      props.currentColorButtons
        ? props.currentColorButtons
        : props.theme.isBase
          ? `#eceef1 url(${PlusThemeSvgUrl}) no-repeat center`
          : `#474747 url(${PlusThemeSvgUrl}) no-repeat center`};
  }

  .modal-add-theme {
    width: 46px;
    height: 46px;
    border-radius: 8px;
    cursor: pointer;
  }

  .drop-down-container-hex {
    ${isMobileOnly &&
    css`
      width: 100%;
    `}
  }

  .drop-down-item-hex {
    ${isMobileOnly &&
    css`
      width: calc(100vw - 32px);
    `}

    :hover {
      background-color: unset;
    }

    ${!isMobile() &&
    css`
      max-width: 227px;

      .hex-color-picker {
        max-width: 195px;
      }

      .react-colorful__interactive {
        max-width: 183px;
      }
    `}
  }
`;

const ColorSchemeDialog = (props) => {
  const {
    visible,
    onClose,
    header,
    nodeHexColorPickerAccent,
    nodeHexColorPickerButtons,
    viewMobile,
    showSaveButtonDialog,
    onSaveColorSchemeDialog,
    t,
    onClickColor,
    currentColorAccent,
    currentColorButtons,
  } = props;

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return () => window.removeEventListener("keyup", onKeyPress);
  });

  return (
    <StyledComponent
      visible={visible}
      onClose={onClose}
      displayType="aside"
      currentColorAccent={currentColorAccent}
      currentColorButtons={currentColorButtons}
      withFooterBorder={showSaveButtonDialog}
      withBodyScroll={true}
    >
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        <div>
          <div className="flex relative">
            <div className="name-color">{t("Settings:AccentColor")}</div>
            <div
              id="accent"
              className="modal-add-theme accent-box"
              onClick={onClickColor}
            />

            {!viewMobile && nodeHexColorPickerAccent}
          </div>

          <div className="flex relative">
            <div className="name-color">{t("Settings:ButtonsColor")}</div>
            <div
              id="buttons"
              className="modal-add-theme buttons-box"
              onClick={onClickColor}
            />

            {!viewMobile && nodeHexColorPickerButtons}
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          className="save"
          label={t("Common:SaveButton")}
          size="normal"
          primary
          scale
          onClick={onSaveColorSchemeDialog}
          isDisabled={!showSaveButtonDialog}
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </StyledComponent>
  );
};

export default withTranslation(["Common", "Settings"])(ColorSchemeDialog);
