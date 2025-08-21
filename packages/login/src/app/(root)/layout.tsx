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

import { cookies, headers } from "next/headers";

import { getBgPattern } from "@docspace/shared/utils/common";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import SimpleNav from "@/components/SimpleNav";
import { ContentWrapper, StyledPage } from "@/components/Layout.styled";
import LanguageComboboxWrapper from "@/components/LanguageCombobox";
import { TYPE_LINK_WITHOUT_LNG_COMBOBOX } from "@/utils/constants";
import { getColorTheme, getPortalCultures, getSettings } from "@/utils/actions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, colorTheme] = await Promise.all([
    getSettings(),
    getColorTheme(),
  ]);

  const bgPattern = getBgPattern(colorTheme?.selected);

  const objectSettings = typeof settings === "string" ? undefined : settings;

  const culture =
    (await cookies()).get("asc_language")?.value ?? objectSettings?.culture;

  const hdrs = await headers();
  const type = hdrs.get("x-confirm-type") ?? "";

  let isComboboxVisible = true;
  if (
    TYPE_LINK_WITHOUT_LNG_COMBOBOX?.includes(type) ||
    objectSettings?.wizardToken
  ) {
    isComboboxVisible = false;
  }

  let cultures;
  if (isComboboxVisible) {
    cultures = await getPortalCultures();
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <SimpleNav
        culture={culture}
        initialCultures={cultures}
        isLanguageComboboxVisible={isComboboxVisible}
      />
      <ContentWrapper id="content-wrapper" bgPattern={bgPattern}>
        <div className="bg-cover" />
        <Scrollbar id="customScrollBar">
          {isComboboxVisible ? (
            <LanguageComboboxWrapper initialCultures={cultures} />
          ) : null}

          <StyledPage id="styled-page">{children}</StyledPage>
        </Scrollbar>
      </ContentWrapper>
    </div>
  );
}
