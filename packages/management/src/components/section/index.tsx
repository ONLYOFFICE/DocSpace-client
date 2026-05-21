/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Heading } from "@docspace/ui-kit/components/heading";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import type { TGetAllPortals } from "@docspace/shared/api/management/types";

import { getHeaderByPathname } from "@/lib";
import { Bar } from "@/components/bar";
import styles from "./section.module.scss";

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

  useDocumentTitle(t("Common:SpaceManagement"));

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.heading}>
          {isSubPage ? (
            <IconButton
              iconName={ArrowPathReactSvgUrl}
              size={17}
              isFill
              onClick={onBack}
              className="arrow-button"
            />
          ) : null}
          <Heading className={styles.headline} type="content" truncate>
            {key}
          </Heading>
        </div>
        {showBar ? <Bar title={barTitle} /> : null}
      </div>
      <Scrollbar id="sectionScroll" scrollClass="section-scroll" fixedSize>
        {children}
      </Scrollbar>
    </section>
  );
};
