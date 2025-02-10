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
import styled, { css } from "styled-components";
import { ReactSVG } from "react-svg";

import { injectDefaultTheme } from "@docspace/shared/utils";

import SecondaryInfoButton from "../SecondaryInfoButton";

const StyledPermanentSetting = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;
  display: flex;
  flex-direction: ${(props) => (props.isFull ? "column" : "row")};
  align-items: ${(props) => (props.isFull ? "start" : "center")};
  justify-content: ${(props) => (props.isFull ? "center" : "start")};
  gap: 4px;

  width: 100%;
  max-width: 100%;
  padding: 12px 16px;

  background: ${(props) =>
    props.theme.createEditRoomDialog.permanentSettings.background};
  border-radius: 6px;

  user-select: none;

  .permanent_setting-main_info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    gap: 8px;

    &-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: -2px;

      svg {
        max-width: 100%;
        max-height: 100%;

        ${(props) =>
          props.type === "privacy" &&
          css`
            path {
              fill: ${({ theme }) =>
                theme.createEditRoomDialog.permanentSettings.isPrivateIcon};
            }
          `}
      }
    }

    &-title {
      font-weight: 600;
      font-size: 12px;
      line-height: 16px;
    }
  }

  .permanent_setting-help_button {
    margin-inline-start: auto;
    white-space: pre-line;
  }

  .permanent_setting-secondary-info {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: ${(props) =>
      props.theme.createEditRoomDialog.permanentSettings.descriptionColor};
    white-space: pre-line;
  }
`;

const PermanentSetting = ({ isFull, type, icon, title, content }) => {
  return (
    <StyledPermanentSetting
      className="permanent_setting"
      isFull={isFull}
      type={type}
    >
      <div className="permanent_setting-main_info">
        <ReactSVG className="permanent_setting-main_info-icon" src={icon} />
        <div className="permanent_setting-main_info-title">{title}</div>
      </div>

      {isFull ? (
        <div className="permanent_setting-secondary-info">{content}</div>
      ) : (
        <div className="permanent_setting-help_button">
          <SecondaryInfoButton content={content} />
        </div>
      )}
    </StyledPermanentSetting>
  );
};

export default PermanentSetting;
