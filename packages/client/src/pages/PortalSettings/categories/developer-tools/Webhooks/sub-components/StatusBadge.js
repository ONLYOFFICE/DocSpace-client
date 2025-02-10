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
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";

const StyledBadge = styled(Badge)`
  p {
    background-color: transparent;
  }
`;

const StatusBadge = (props) => {
  const { status, theme } = props;

  const badgeColorScheme =
    status >= 200 && status < 300
      ? theme.isBase
        ? {
            backgroundColor: globalColors.alphaGreenLight,
            color: globalColors.lightStatusPositive,
          }
        : {
            backgroundColor: globalColors.alphaGreenDark,
            color: globalColors.darkStatusPositive,
          }
      : theme.isBase
        ? {
            backgroundColor: globalColors.alphaRedLight,
            color: globalColors.lightErrorStatus,
          }
        : {
            backgroundColor: globalColors.alphaRedDark,
            color: globalColors.darkErrorStatus,
          };
  const { t } = useTranslation(["Webhooks"]);

  if (status === undefined) {
    return;
  }

  return (
    <StyledBadge
      id="webhook-status"
      backgroundColor={badgeColorScheme.backgroundColor}
      color={badgeColorScheme.color}
      label={status === 0 ? t("NotSent") : status.toString()}
      fontSize="9px"
      maxWidth="80px"
      fontWeight={700}
      noHover
      isVersionBadge
    />
  );
};

export default inject(({ settingsStore }) => {
  const { theme } = settingsStore;

  return {
    theme,
  };
})(observer(StatusBadge));
