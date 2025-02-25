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

import DangerAlertReactSvgUrl from "PUBLIC_DIR/images/danger.alert.react.svg?url";
import React from "react";
import styled from "styled-components";
import { ReactSVG } from "react-svg";

import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledPrivacyLimitationsWarning = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: ${(props) =>
    props.theme.createEditRoomDialog.isPrivate.limitations.background};
  border-radius: 6px;
  padding: 12px 8px;

  .warning-title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    &-icon-wrapper {
      display: flex;
      align-items: center;
      .warning-title-icon {
        width: 16px;
        height: 14px;
        path {
          fill: ${(props) =>
            props.theme.createEditRoomDialog.isPrivate.limitations.iconColor};
        }
      }
    }

    &-text {
      font-weight: 600;
      font-size: 13px;
      line-height: 20px;
      color: ${(props) =>
        props.theme.createEditRoomDialog.isPrivate.limitations.titleColor};
    }
  }

  .warning-description {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: ${(props) =>
      props.theme.createEditRoomDialog.isPrivate.limitations.descriptionColor};
  }

  .warning-link {
    cursor: pointer;
    margin-top: 2px;
    font-weight: 600;
    font-size: 13px;
    line-height: 15px;
    color: ${(props) =>
      props.theme.createEditRoomDialog.isPrivate.limitations.linkColor};
    text-decoration: underline;
    text-underline-offset: 1px;
  }
`;

const PrivacyLimitationsWarning = ({ t }) => {
  return (
    <StyledPrivacyLimitationsWarning>
      <div className="warning-title">
        <div className="warning-title-icon-wrapper">
          <ReactSVG
            className="warning-title-icon"
            src={DangerAlertReactSvgUrl}
          />
        </div>
        <div className="warning-title-text">{t("Common:Warning")}</div>
      </div>
      <div className="warning-description">
        {t("MakeRoomPrivateLimitationsWarningDescription", {
          productName: t("Common:ProductName"),
        })}
      </div>
      <div className="warning-link">{t("Common:LearnMore")}</div>
    </StyledPrivacyLimitationsWarning>
  );
};

export default PrivacyLimitationsWarning;
