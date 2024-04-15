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

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import React from "react";
import styled, { css } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { IconButton } from "@docspace/shared/components/icon-button";
import Headline from "@docspace/shared/components/headline/Headline";

import { getItemByLink } from "SRC_DIR/utils";

const StyledHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  .arrow-button {
    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }
`;

const SectionHeaderContent = () => {
  const { t } = useTranslation(["Settings", "Common"]);

  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const item = getItemByLink(path);

  const onBackToParent = () => {
    navigate(-1);
  };

  return (
    <StyledHeader>
      {!item?.isHeader && (
        <IconButton
          iconName={ArrowPathReactSvgUrl}
          size={17}
          isFill={true}
          onClick={onBackToParent}
          className="arrow-button"
        />
      )}
      <Headline type="content" truncate={true}>
        <div className="header">{t(item?.tKey)}</div>
      </Headline>
    </StyledHeader>
  );
};

export default SectionHeaderContent;
