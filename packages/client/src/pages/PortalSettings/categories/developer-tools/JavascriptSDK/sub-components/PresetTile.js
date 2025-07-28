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

import styled, { css } from "styled-components";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

import ArrowIcon from "PUBLIC_DIR/images/arrow-left.react.svg";
import { injectDefaultTheme } from "@docspace/shared/utils";

const TileContainer = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;

  width: 100%;
  max-width: 342px;

  padding: 12px 16px;

  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.sdkPresets.borderColor};

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;

  cursor: pointer;

  .tileContent {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .navigationButton {
    border: none;

    .button-content {
      flex-direction: row-reverse;
    }

    .icon {
      ${({ theme }) =>
        theme.interfaceDirection === "ltr" && "transform: scale(-1, 1);"}
    }

    :hover {
      ${() => css`
        border: ${(props) => props.theme.button.border.baseHover};
        box-sizing: ${(props) => props.theme.button.boxSizing};
      `}
    }
  }
`;

const PresetTile = (props) => {
  const { t, title, description, image, handleOnClick, testId } = props;

  return (
    <TileContainer onClick={handleOnClick} data-testid={testId}>
      <div className="tileContent">
        <Text fontSize="16px" lineHeight="22px" fontWeight={700}>
          {title}
        </Text>
        <ReactSVG src={image} />
        <Text lineHeight="20px">{description}</Text>
      </div>

      <Button
        testId={`sdk_preset_${title}_button`}
        className="navigationButton"
        label={t("SetUp")}
        icon={<ArrowIcon />}
        scale
        isClicked
        size="small"
      />
    </TileContainer>
  );
};

export default PresetTile;
