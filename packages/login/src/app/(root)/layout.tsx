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

import React from "react";

import { cookies, headers } from "next/headers";

import { getBgPattern } from "@docspace/shared/utils/common";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";

import SimpleNav from "@/components/SimpleNav";
import LanguageComboboxWrapper from "@/components/LanguageCombobox";
import { TYPE_LINK_WITHOUT_LNG_COMBOBOX } from "@/utils/constants";
import { getColorTheme, getPortalCultures, getSettings } from "@/utils/actions";
import styles from "./layout.module.scss";

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

  const bgBlockStyle = {
    "--bg-pattern": bgPattern,
  } as React.CSSProperties;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <SimpleNav
        culture={culture}
        initialCultures={cultures}
        isLanguageComboboxVisible={isComboboxVisible}
      />
      <div
        className={styles.contentWrapper}
        style={bgBlockStyle}
        id="content-wrapper"
      >
        <div className="bg-cover" />
        <Scrollbar id="customScrollBar">
          {isComboboxVisible ? (
            <LanguageComboboxWrapper initialCultures={cultures} />
          ) : null}

          <div id="styled-page" className={styles.pageWrapper}>
            {children}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
