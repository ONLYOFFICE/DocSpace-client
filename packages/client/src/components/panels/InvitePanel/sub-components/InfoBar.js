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
import { ReactSVG } from "react-svg";
import styled from "styled-components";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";

const StyledInfoBar = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.infoBar.background};
  color: ${(props) => props.theme.infoBar.textColor};
  font-size: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 10px;
  margin: -4px 16px 20px;
  .text-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .header-body {
    display: flex;
    height: fit-content;
    width: 100%;
    gap: 8px;
    font-weight: 600;
    .header-icon {
      svg {
        path {
          fill: ${(props) => props.theme.infoBar.iconFill};
        }
      }
    }

    &__title {
      color: ${(props) => props.theme.infoBar.title};
    }
  }
  .body-container {
    color: ${(props) => props.theme.infoBar.description};
    font-weight: 400;
  }
  .close-icon {
    margin-block: 3px 0;
    margin-inline: 0 1px;
    path {
      fill: ${({ theme }) => theme.iconButton.color};
    }
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const InfoBar = (props) => {
  const { t, iconName, onClose, ...rest } = props;

  return (
    <StyledInfoBar {...rest}>
      <div className="text-container">
        <div className="header-body">
          <div className="header-icon">
            <ReactSVG src={InfoIcon} />
          </div>
          <Text className="header-body__title" fontSize="12px" fontWeight={600}>
            {t("Common:Info")}
          </Text>
        </div>
        <div className="body-container">
          {t("InfoPanel:InfoBanner", { productName: t("Common:ProductName") })}
        </div>
      </div>

      <IconButton
        className="close-icon"
        size={10}
        iconName={CrossReactSvg}
        onClick={onClose}
      />
    </StyledInfoBar>
  );
};

export default InfoBar;
