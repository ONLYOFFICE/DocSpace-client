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

import React, { useCallback, useImperativeHandle, useState } from "react";
import { isMobile } from "react-device-detect";

import PanelReactSvg from "PUBLIC_DIR/images/panel.react.svg";
import classNames from "classnames";
import PageCountProps from "./PageCount.props";

import styles from "./PageCount.module.scss";

const PageCount = ({
  ref,
  isPanelOpen,
  visible,
  className,
  setIsOpenMobileDrawer,
}: PageCountProps) => {
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    setPagesCount(pagesCountArg: number) {
      setPagesCount(pagesCountArg);
    },
    setPageNumber: (pageNumberArg: number) => {
      setPageNumber(pageNumberArg);
    },
  }));

  const openMobileDrawer = useCallback(() => {
    setIsOpenMobileDrawer(true);
  }, [setIsOpenMobileDrawer]);

  if (!visible) return;

  return (
    <div
      className={classNames(
        styles.pageCountWrapper,
        {
          [styles.isPanelOpen]: isPanelOpen,
          [styles.isMobile]: isMobile,
        },
        className,
      )}
      data-testid="page-count"
      aria-label="Page counter"
    >
      {isMobile ? (
        <PanelReactSvg
          onClick={openMobileDrawer}
          data-testid="mobile-panel-button"
          aria-label="Open mobile panel"
        />
      ) : null}
      <div data-testid="page-numbers">
        <span data-testid="current-page">{pageNumber}</span> /
        <span data-testid="total-pages">{pagesCount}</span>
      </div>
    </div>
  );
};

PageCount.displayName = "PageCount";

export { PageCount };
