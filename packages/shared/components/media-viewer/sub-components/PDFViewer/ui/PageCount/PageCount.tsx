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
