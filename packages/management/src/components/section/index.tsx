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

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Heading } from "@docspace/shared/components/heading";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { IconButton } from "@docspace/shared/components/icon-button";

import type { TGetAllPortals } from "@docspace/shared/api/management/types";

import { getHeaderByPathname } from "@/lib";
import { Bar } from "@/components/bar";
import {
  StyledSection,
  StyledSectionHeader,
  StyledHeading,
} from "./section.styled";

export const Section = ({
  children,
  portals,
}: {
  children: React.ReactNode;
  portals: TGetAllPortals;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation(["Management", "Common"]);
  const { tenants } = portals;
  const showBar = pathname.includes("settings");
  const barTitle =
    tenants?.length > 1 ? t("SettingsForAll") : t("SettingsDisabled");

  const onBack = () => {
    router.back();
  };

  const { key, isSubPage } = getHeaderByPathname(pathname, t);

  return (
    <StyledSection>
      <StyledSectionHeader>
        <StyledHeading>
          {isSubPage ? (
            <IconButton
              iconName={ArrowPathReactSvgUrl}
              size={17}
              isFill
              onClick={onBack}
              className="arrow-button"
            />
          ) : null}
          <Heading className="headline" type="content" truncate>
            {key}
          </Heading>
        </StyledHeading>
        {showBar ? <Bar title={barTitle} /> : null}
      </StyledSectionHeader>
      <Scrollbar id="sectionScroll" scrollClass="section-scroll" fixedSize>
        {children}
      </Scrollbar>
    </StyledSection>
  );
};
