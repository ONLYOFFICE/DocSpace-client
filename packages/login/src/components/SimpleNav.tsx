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

"use client";

import React from "react";
import styled, { useTheme } from "styled-components";

import { TPortalCultures } from "@docspace/shared/api/settings/types";
import { mobile } from "@docspace/shared/utils/device";
import { getLogoUrl } from "@docspace/shared/utils/common";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { injectDefaultTheme } from "@docspace/shared/utils";

import LanguageComboboxWrapper from "./LanguageCombobox";

/* eslint-disable @next/next/no-img-element */

const StyledSimpleNav = styled.div.attrs(injectDefaultTheme)`
  display: none;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme?.login?.navBackground};

  .logo {
    height: 24px;
  }

  .modile-combobox {
    .combo-button {
      border-width: 0;
      background: transparent;
    }
  }

  @media ${mobile} {
    display: flex;

    .language-combo-box {
      position: absolute;
      top: 7px;
      inset-inline-end: 20px;

      .combo-button {
        gap: 8px;
      }
    }
  }
`;

interface SimpleNavProps {
  culture?: string;
  initialCultures?: TPortalCultures;
  isLanguageComboboxVisible?: boolean;
}

const SimpleNav = ({
  culture,
  initialCultures,
  isLanguageComboboxVisible = true,
}: SimpleNavProps) => {
  const theme = useTheme();

  const isDark = !theme.isBase;

  const logoUrl = getLogoUrl(
    WhiteLabelLogoType.LightSmall,
    isDark,
    false,
    culture,
  );

  return (
    <StyledSimpleNav id="login-header">
      <img className="logo" src={logoUrl} alt="logo-url" />
      {isLanguageComboboxVisible && (
        <LanguageComboboxWrapper
          className="modile-combobox"
          initialCultures={initialCultures}
        />
      )}
    </StyledSimpleNav>
  );
};

export default SimpleNav;
