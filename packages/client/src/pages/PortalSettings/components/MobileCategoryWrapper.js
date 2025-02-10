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

import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg";

import React from "react";
import styled, { useTheme } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";
import { Link } from "@docspace/shared/components/link";
import commonIconsStyles from "@docspace/shared/utils/common-icons-style";
import { globalColors } from "@docspace/shared/themes";
import { isManagement } from "@docspace/shared/utils/common";

const StyledArrowRightIcon = styled(ArrowRightIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.client.settings.security.arrowFill};
  }
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
`;

const StyledMobileCategoryWrapper = styled.div`
  margin-bottom: 20px;

  .category-item-heading {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .category-item-subheader {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .category-item-description {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.text.disableColor
        : props.theme.client.settings.security.descriptionColor};
    font-size: 12px;
    max-width: 1024px;
  }

  .inherit-title-link {
    margin-inline-end: 7px;
    font-size: 16px;
    font-weight: 600;
    ${(props) => props.isDisabled && `color: ${props.theme.text.disableColor}`};
  }

  .link-text {
    margin: 0;
  }
`;

const MobileCategoryWrapper = (props) => {
  const {
    title,
    url,
    subtitle,
    onClickLink,
    isDisabled,
    withPaidBadge,
    badgeLabel,
  } = props;

  const theme = useTheme();

  const onClickProp = isDisabled ? {} : { onClick: onClickLink };
  const onHrefProp = isDisabled ? {} : { href: url };

  return (
    <StyledMobileCategoryWrapper isDisabled={isDisabled}>
      <div className="category-item-heading">
        <Link
          className="inherit-title-link header"
          {...onClickProp}
          {...onHrefProp}
          truncate
        >
          {title}
        </Link>
        {withPaidBadge && !isManagement() ? (
          <Badge
            backgroundColor={
              theme.isBase
                ? globalColors.favoritesStatus
                : globalColors.favoriteStatusDark
            }
            label={badgeLabel}
            isPaidBadge
            className="paid-badge"
            fontWeight="700"
          />
        ) : null}
        <StyledArrowRightIcon className="settings_unavailable" size="small" />
      </div>
      <Text className="category-item-description">{subtitle}</Text>
    </StyledMobileCategoryWrapper>
  );
};

export default MobileCategoryWrapper;
