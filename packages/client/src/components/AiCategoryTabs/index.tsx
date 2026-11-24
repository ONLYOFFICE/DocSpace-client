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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { SelectedItem } from "@onlyoffice/apps-ui-kit/components/selected-item";

import styles from "./AiCategoryTabs.module.scss";

type AiCategoryTabsProps = {
  /** The categories after "All", in the order they are shown. */
  categories: string[];
  /**
   * The chosen category, `null` for "All". `undefined` marks none: the list
   * is narrowed in a way no single category stands for.
   */
  selected: string | null | undefined;
  onSelect: (category: string | null) => void;
  /** Names the row for assistive technology. */
  ariaLabel?: string;
  /** `data-testid` of the row. */
  dataTestId?: string;
  /** `data-testid` of each tab. */
  itemTestId?: string;
  className?: string;
};

/**
 * The row of categories of the AI Chat section: "All", then one tab per
 * category. The Templates tab of Agents narrows its catalog with it and the
 * My agents tab its list. A row wider than the page scrolls sideways.
 */
const AiCategoryTabs = ({
  categories,
  selected,
  onSelect,
  ariaLabel,
  dataTestId,
  itemTestId,
  className,
}: AiCategoryTabsProps) => {
  const { t } = useTranslation(["Common"]);

  const tab = (value: string | null, label: string) => (
    <SelectedItem
      key={value ?? "all"}
      propKey={value ?? "all"}
      label={label}
      onClick={() => onSelect(value)}
      onClose={() => {}}
      hideCross
      clickable
      isActive={selected === value}
      className={styles.tab}
      title={label}
      dataTestId={itemTestId}
    />
  );

  return (
    <div
      className={classNames(styles.tabs, className)}
      role="group"
      aria-label={ariaLabel}
      data-testid={dataTestId}
    >
      {tab(null, t("Common:All"))}
      {categories.map((value) => tab(value, value))}
    </div>
  );
};

export default AiCategoryTabs;
