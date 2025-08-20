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

import { Button } from "@docspace/shared/components/button";
import styled, { css } from "styled-components";
import {
  commonIconsStyles,
  injectDefaultTheme,
  tablet,
} from "@docspace/shared/utils";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import hexRgb from "hex-rgb";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

export const StyledSubmitToGalleryTile = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  height: ${(props) => (props.viewMobile ? `100%` : `calc(100% - 51px)`)};

  .content {
    height: ${(props) => (props.viewMobile ? `110px` : `100%`)};

    margin: ${(props) =>
      props.viewMobile ? `0 10px 26px 10px` : `12px 10px 10px 10px`};

    position: relative;

    padding: 16px;
    box-sizing: border-box;

    border: 2px solid
      ${({ currentColorScheme }) => currentColorScheme.main?.accent};
    border-radius: 6px;
    background-color: ${({ currentColorScheme }) =>
      hexRgb(currentColorScheme.main?.accent, { alpha: 0.03, format: "css" })};

    display: flex;
    flex-direction: column;

    justify-content: center;
    gap: 16px;
  }

  .info {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px;

    .title {
      color: ${({ currentColorScheme }) => currentColorScheme.main?.accent};
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
    }
    .body {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: ${({ theme }) => theme.oformGallery.submitToGalleryTile.bodyText};
    }
  }

  .button-submit {
    min-height: 28px;
    height: 28px;
    padding: 0;

    .button-content {
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
      white-space: normal;
      word-wrap: break-word;
      text-align: center;
    }
  }

  @media ${tablet} {
    .content {
      padding: 6px 16px;
      gap: 10px;

      ${(props) =>
        props.smallPreview &&
        css`
          padding: 14px 16px;
        `}
    }

    .info {
      gap: 4px;

      .title {
        font-size: 11px;
        line-height: 12px;
      }

      .body {
        font-size: 10px;
        line-height: 14px;
      }
    }

    .button-submit {
      min-height: 24px;
      height: auto;

      .button-content {
        font-size: 10px;
        line-height: 15px;
      }
    }
  }
`;

const StyledCloseIcon = styled(CrossIcon).attrs(injectDefaultTheme)`
  ${commonIconsStyles}
  position: absolute;
  top: 10px;
  cursor: pointer;
  inset-inline-end: 10px;

  path {
    fill: ${({ theme }) =>
      theme.oformGallery.submitToGalleryTile.closeIconFill};
  }
`;

const SubmitToGalleryTile = ({
  t,
  hideSubmitToGalleryTile,
  setSubmitToGalleryDialogVisible,
  currentColorScheme,
  logoText,
  smallPreview,
  isSubmitTile,
  submitToGalleryTileIsVisible,
  viewMobile,
}) => {
  if (!submitToGalleryTileIsVisible) return null;

  const onSubmitToGallery = () => setSubmitToGalleryDialogVisible(true);

  return (
    <StyledSubmitToGalleryTile
      currentColorScheme={currentColorScheme}
      smallPreview={smallPreview}
      data-small-preview={smallPreview ? "true" : "false"}
      data-submit-tile={isSubmitTile ? "true" : "false"}
      viewMobile={viewMobile}
    >
      <div className="content">
        <StyledCloseIcon
          onClick={hideSubmitToGalleryTile}
          className="close-icon"
          size="medium"
        />

        <div className="info">
          <div className="title">ONLYOFFICE Template Gallery</div>
          <div className="body">
            {t("Common:SubmitToGalleryBlockBody", {
              organizationName: logoText,
            })}
          </div>
        </div>

        <Button
          className="button-submit"
          onClick={onSubmitToGallery}
          size="small"
          label="Upload in the Gallery"
          scale
        />
      </div>
    </StyledSubmitToGalleryTile>
  );
};

export default inject(({ settingsStore, oformsStore, dialogsStore }) => {
  const { currentColorScheme, logoText } = settingsStore;

  return {
    submitToGalleryTileIsVisible: oformsStore.submitToGalleryTileIsVisible,
    hideSubmitToGalleryTile: oformsStore.hideSubmitToGalleryTile,
    setSubmitToGalleryDialogVisible:
      dialogsStore.setSubmitToGalleryDialogVisible,
    currentColorScheme,
    logoText,
  };
})(withTranslation("Common", "FormGallery")(observer(SubmitToGalleryTile)));
