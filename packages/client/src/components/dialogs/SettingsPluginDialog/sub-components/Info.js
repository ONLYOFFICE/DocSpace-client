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

import { LANGUAGE } from "@docspace/shared/constants";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import {
  getCorrectDate,
  getCookie,
  injectDefaultTheme,
} from "@docspace/shared/utils";

import { PluginStatus } from "SRC_DIR/helpers/plugins/enums";

const StyledContainer = styled.div`
  width: 100%;

  ${(props) =>
    props.withDelete &&
    css`
      margin-bottom: 24px;
    `}
`;

const StyledSeparator = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  height: 1px;

  margin: 24px 0;

  background-color: ${(props) => props.theme.plugins.borderColor};
`;

const StyledInfo = styled.div`
  margin-top: 24px;

  width: 100%;
  height: auto;

  display: grid;

  grid-template-columns: max-content 1fr;

  gap: 8px 24px;
`;

const Info = ({ t, plugin, withDelete, withSeparator }) => {
  const locale = getCookie(LANGUAGE) || "en";
  const uploadDate = plugin.createOn && getCorrectDate(locale, plugin.createOn);

  const pluginStatus =
    plugin.status === PluginStatus.active
      ? t("NotNeedSettings")
      : t("NeedSettings");

  return (
    <StyledContainer withDelete={withDelete}>
      {withSeparator ? <StyledSeparator /> : null}
      <Text fontSize="14px" fontWeight={600} lineHeight="16px">
        {t("Metadata")}
      </Text>
      <StyledInfo>
        {plugin.author ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Files:ByAuthor")}
            </Text>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {plugin.author}
            </Text>
          </>
        ) : null}

        {plugin.version ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Version")}
            </Text>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {plugin.version}
            </Text>
          </>
        ) : null}

        {!plugin.system ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Uploader")}
            </Text>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {plugin.createBy.displayName}
            </Text>
          </>
        ) : null}

        {!plugin.system && uploadDate ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:UploadDate")}
            </Text>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {uploadDate}
            </Text>
          </>
        ) : null}

        <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
          {t("People:UserStatus")}
        </Text>
        <Text fontSize="13px" fontWeight={600} lineHeight="20px">
          {pluginStatus}
        </Text>

        {plugin.homePage ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Homepage")}
            </Text>
            <Link
              fontSize="13px"
              fontWeight={600}
              lineHeight="20px"
              type="page"
              href={plugin?.homePage}
              target="_blank"
              isHovered
            >
              {plugin.homePage}
            </Link>
          </>
        ) : null}
        {plugin.description ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Description")}
            </Text>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {plugin.description}
            </Text>
          </>
        ) : null}
      </StyledInfo>
    </StyledContainer>
  );
};

export default Info;
