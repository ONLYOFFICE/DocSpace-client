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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: ${(props) => (props.isAdditionalParameters ? "0" : "24px 0")};

  .hide-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 12px;
          `
        : css`
            margin-left: 12px;
          `}
  }
`;

const HideButton = (props) => {
  const { t } = useTranslation("SingleSignOn");
  const {
    text,
    label,
    isAdditionalParameters,
    value,
    setHideLabel,
    isDisabled,
    id,
  } = props;

  const onClick = () => {
    setHideLabel(label);
  };

  const onClickProp = isDisabled ? {} : { onClick: onClick };

  return (
    <StyledWrapper isAdditionalParameters={isAdditionalParameters}>
      {!isAdditionalParameters && (
        <Text
          as="h2"
          fontSize="16px"
          fontWeight={700}
          className="settings_unavailable"
          noSelect
        >
          {text}
        </Text>
      )}

      <Link
        id={id}
        className="hide-button settings_unavailable"
        isHovered
        {...onClickProp}
        type="action"
      >
        {value
          ? isAdditionalParameters
            ? t("HideAdditionalParameters")
            : t("Hide")
          : isAdditionalParameters
            ? t("ShowAdditionalParameters")
            : t("Show")}
      </Link>
    </StyledWrapper>
  );
};

export default inject(({ ssoStore }) => {
  const { setHideLabel } = ssoStore;

  return {
    setHideLabel,
  };
})(observer(HideButton));
