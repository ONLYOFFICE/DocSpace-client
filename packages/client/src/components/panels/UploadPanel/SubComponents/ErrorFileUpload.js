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

import { Tooltip } from "@docspace/shared/components/tooltip";
import LoadErrorIcon from "PUBLIC_DIR/images/load.error.react.svg";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import React from "react";
import { useTheme } from "styled-components";

const StyledLoadErrorIcon = styled(LoadErrorIcon)`
  outline: none !important;
`;

const ErrorFileUpload = ({
  t,
  item,
  theme,
  onTextClick,
  showPasswordInput,
}) => {
  const { interfaceDirection } = useTheme();
  const placeTooltip = interfaceDirection === "rtl" ? "right" : "left";
  return (
    <>
      <div className="upload_panel-icon">
        <StyledLoadErrorIcon
          size="medium"
          data-tooltip-id="errorTooltip"
          data-tooltip-content={item.error || t("Common:UnknownError")}
        />
        <Tooltip
          id="errorTooltip"
          getContent={({ content }) => (
            <Text fontSize="13px" noSelect>
              {content}
            </Text>
          )}
          place={placeTooltip}
          maxWidth="320"
          color={theme.tooltip.backgroundColor}
        />
        {item.needPassword && (
          <Text
            className="enter-password"
            fontWeight="600"
            color="#A3A9AE"
            onClick={onTextClick}
          >
            {showPasswordInput ? t("HideInput") : t("EnterPassword")}
          </Text>
        )}
      </div>
    </>
  );
};
export default ErrorFileUpload;
