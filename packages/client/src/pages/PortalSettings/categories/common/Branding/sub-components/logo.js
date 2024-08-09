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
import styled, { css } from "styled-components";

import { getLogoFromPath } from "@docspace/shared/utils";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { isMobile } from "@docspace/shared/utils";

import NotAvailable from "SRC_DIR/pages/PortalSettings/components/NotAvailable";

const StyledLogoWrapper = styled.div`
  ${(props) =>
    !props.isCustomizationAvailable &&
    css`
      cursor: default;
      pointer-events: none;
      .logo-docs-editor,
      .logo-image {
        filter: opacity(0.5);
      }
      a,
      a:hover {
        color: ${(props) => props.theme.text.disableColor};
      }
    `}
`;

const Logo = (props) => {
  const {
    title,
    src,
    onChange,
    isSettingPaid,
    onChangeText,
    inputId,
    linkId,
    imageClass,
    isEditor,
    isCustomizationAvailable = true,
  } = props;

  const currentLogo = getLogoFromPath(src);

  const onLogoClick = () => {
    isMobile() && document.getElementById(inputId).click();
  };

  return (
    <StyledLogoWrapper isCustomizationAvailable={isCustomizationAvailable}>
      <div className="logo-item">
        {title && (
          <Text
            fontSize="13px"
            fontWeight="600"
            className="settings_unavailable"
          >
            {title}
          </Text>
        )}
        {isEditor ? (
          <div className="logos-editor-wrapper" onClick={onLogoClick}>
            <img
              className="logo-docs-editor background-blue"
              src={currentLogo}
            />
            <img
              className="logo-docs-editor background-red"
              src={currentLogo}
            />
            <img
              className="logo-docs-editor background-orange"
              src={currentLogo}
            />
            <img
              className="logo-docs-editor background-green"
              src={currentLogo}
            />
          </div>
        ) : (
          <img
            className={`${imageClass} logo-image`}
            src={currentLogo}
            onClick={onLogoClick}
          />
        )}
      </div>
      {!isCustomizationAvailable && <NotAvailable />}
      <label>
        <input
          id={inputId}
          type="file"
          className="hidden"
          onChange={onChange}
          disabled={!isSettingPaid || !isCustomizationAvailable}
        />
        <Link
          id={linkId}
          fontWeight="600"
          isHovered
          type="action"
          className="settings_unavailable"
        >
          {onChangeText}
        </Link>
      </label>
    </StyledLogoWrapper>
  );
};

export default Logo;
