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

import { useRef, useState } from "react";
import { useLocation } from "react-router";

import { DropDown } from "@onlyoffice/apps-ui-kit/components/drop-down";
import { NavMenu } from "@onlyoffice/apps-ui-kit/components/nav-menu";

import PluginWrappedComponent from "SRC_DIR/components/plugins/PluginWrappedComponent";
import type { IArticleWidgetItemClient } from "SRC_DIR/helpers/plugins/types";

import styles from "./ArticleWidgetSlot.module.scss";

const COLLAPSED_ITEM_ID = "article-plugin-widget";

type ArticleWidgetSlotProps = {
  item: IArticleWidgetItemClient;
  showText: boolean;
};

const ArticleWidgetSlot = ({ item, showText }: ArticleWidgetSlotProps) => {
  const { pathname } = useLocation();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [openedAt, setOpenedAt] = useState<string | null>(null);

  const isOpen = openedAt === pathname;

  const widget = (
    <PluginWrappedComponent
      pluginName={item.pluginName}
      component={item.component}
    />
  );

  if (showText) {
    return (
      <div className={styles.slot} data-testid="article-plugin-widget">
        {widget}
      </div>
    );
  }

  if (!item.icon) return null;

  return (
    <div className={styles.collapsedSlot} data-testid="article-plugin-widget">
      <div ref={anchorRef} className={styles.dropdownAnchor} />
      <NavMenu
        iconOnly
        activeItemId={isOpen ? COLLAPSED_ITEM_ID : undefined}
        groups={[
          {
            id: COLLAPSED_ITEM_ID,
            items: [
              {
                id: COLLAPSED_ITEM_ID,
                label: item.label,
                icon: item.icon,
                onClick: () => setOpenedAt(isOpen ? null : pathname),
              },
            ],
          },
        ]}
      />
      <DropDown
        open={isOpen}
        forwardedRef={anchorRef}
        directionY="both"
        withBackdrop={false}
        eventTypes="click"
        clickOutsideAction={() => setOpenedAt(null)}
        dataTestId="article-plugin-widget-dropdown"
      >
        {isOpen ? <div className={styles.dropdownBody}>{widget}</div> : null}
      </DropDown>
    </div>
  );
};

export default ArticleWidgetSlot;
