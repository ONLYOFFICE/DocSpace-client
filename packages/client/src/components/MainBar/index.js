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
import { useLocation } from "react-router";
import classNames from "classnames";

import { isPublicPreview } from "@docspace/shared/utils/common";

import Bar from "./Bar";
import styles from "./main-bar.module.scss";

const MainBar = ({
  firstLoad,
  checkedMaintenance,
  snackbarExist,
  setMaintenanceExist,
  isNotPaidPeriod,
  barTypeInFrame,
}) => {
  const { pathname } = useLocation();

  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    return () => setMaintenanceExist && setMaintenanceExist(false);
  }, []);

  React.useEffect(() => {
    const isVisibleStorage = localStorage.getItem("integrationUITests");

    if (isVisibleStorage) setIsVisible(false);
  }, []);

  const isVisibleBar =
    barTypeInFrame !== "none" &&
    !isNotPaidPeriod &&
    !pathname.includes("error") &&
    !pathname.includes("confirm") &&
    !pathname.includes("preparation-portal") &&
    !isPublicPreview();

  if (!isVisible) return null;

  return (
    <div id="main-bar" className={classNames(styles.container, "main-bar")}>
      {isVisibleBar && checkedMaintenance && !snackbarExist ? (
        <Bar firstLoad={firstLoad} setMaintenanceExist={setMaintenanceExist} />
      ) : null}
    </div>
  );
};

export default inject(
  ({
    settingsStore,
    clientLoadingStore,
    filesStore,
    currentTariffStatusStore,
  }) => {
    const {
      checkedMaintenance,
      setMaintenanceExist,
      snackbarExist,
      frameConfig,
    } = settingsStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { firstLoad } = clientLoadingStore;
    const { isInit } = filesStore;

    return {
      firstLoad: firstLoad && isInit,
      checkedMaintenance,
      snackbarExist,
      setMaintenanceExist,
      isNotPaidPeriod,
      barTypeInFrame: frameConfig?.showHeaderBanner,
    };
  },
)(observer(MainBar));
