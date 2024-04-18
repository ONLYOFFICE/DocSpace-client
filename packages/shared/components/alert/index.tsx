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
import { useTheme } from "styled-components";

import { IconSizeType } from "../../utils/common-icons-style";

import { Text } from "../text";
import { Link, LinkType } from "../link";

import {
  StyledAlertComponent,
  StyledArrowRightIcon,
  StyledCrossIcon,
} from "./Alert.styled";
import { AlertComponentProps } from "./Alert.types";

const AlertComponent = (props: AlertComponentProps) => {
  const {
    id,
    description,
    title,
    titleFontSize,
    additionalDescription,
    needArrowIcon = false,
    needCloseIcon = false,
    link,
    onLinkClick,
    linkColor,
    linkTitle,
    onAlertClick,
    onCloseClick,
    titleColor,
    borderColor,
  } = props;

  const theme = useTheme();

  return (
    <StyledAlertComponent
      theme={theme}
      titleColor={titleColor}
      borderColor={borderColor}
      onClick={onAlertClick}
      needArrowIcon={needArrowIcon}
      id={id}
    >
      <div className="main-content">
        <Text
          className="alert-component_title"
          fontSize={titleFontSize ?? "12px"}
          fontWeight={600}
        >
          {title}
        </Text>
        {additionalDescription && (
          <Text fontWeight={600}>{additionalDescription}</Text>
        )}
        <Text
          noSelect
          fontSize="12px"
          color={theme.alertComponent.descriptionColor}
        >
          {description}
        </Text>
        {(link || !!onLinkClick) && (
          <Link
            type={LinkType.page}
            href={link}
            onClick={onLinkClick}
            noHover
            color={linkColor}
          >
            {linkTitle}
          </Link>
        )}
      </div>
      {needCloseIcon && (
        <StyledCrossIcon
          size={IconSizeType.extraSmall}
          onClick={onCloseClick}
        />
      )}
      {needArrowIcon && (
        <StyledArrowRightIcon className="alert-component_arrow" />
      )}
    </StyledAlertComponent>
  );
};

export default AlertComponent;
