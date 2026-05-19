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
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { isMobile as isMobileUtils } from "@docspace/shared/utils";

import styles from "./main.module.scss";

const Main = (props) => {
  const { mainBarVisible, isFrame } = props;
  // console.log("Main render");
  const [mainHeight, setMainHeight] = React.useState(window.innerHeight);
  const updateSizeRef = React.useRef(null);

  const onResize = React.useCallback(() => {
    let correctHeight = window.innerHeight;

    // 48 - its nav menu with burger, logo and user avatar
    // 3 - its IndicatorLoader
    if (isMobileUtils() && !isFrame) {
      correctHeight -= 48;
      correctHeight -= 3;
    }

    setMainHeight(correctHeight);
  }, [mainBarVisible, isFrame]);

  React.useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(updateSizeRef.current);
    };
  }, [onResize]);

  React.useEffect(() => {
    onResize();
  }, [mainBarVisible, isFrame, onResize]);

  const mainStyle = mainHeight ? { height: `${mainHeight}px` } : undefined;

  return (
    <main
      className={classNames(styles.main, "main")}
      style={mainStyle}
      {...props}
    />
  );
};

Main.displayName = "Main";

export default inject(({ settingsStore }) => {
  const { mainBarVisible, isFrame } = settingsStore;
  return {
    mainBarVisible,
    isFrame,
  };
})(observer(Main));
