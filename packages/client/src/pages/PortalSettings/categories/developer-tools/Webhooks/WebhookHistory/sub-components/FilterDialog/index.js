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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { now, formatDate } from "@docspace/ui-kit/utils/date";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";

import { Button } from "@docspace/ui-kit/components/button";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import DeliveryDatePicker from "./DeliveryDatePicker";
import StatusPicker from "./StatusPicker";

import styles from "../../WebhookHistory.styled.module.scss";

const constructUrl = (baseUrl, filters) => {
  const url = new URL(baseUrl, "http://127.0.0.1:8092/");
  url.searchParams.append(
    "deliveryDate",
    filters.deliveryDate ? formatDate(filters.deliveryDate, "yyyy-MM-dd") : null,
  );
  url.searchParams.append("deliveryFrom", formatDate(filters.deliveryFrom, "HH:mm"));
  url.searchParams.append("deliveryTo", formatDate(filters.deliveryTo, "HH:mm"));
  url.searchParams.append("status", JSON.stringify(filters.status));

  return url.pathname + url.search;
};

function areArraysEqual(array1, array2) {
  return (
    array1.length === array2.length &&
    array1.every((val, index) => val === array2[index])
  );
}

const FilterDialog = (props) => {
  const {
    visible,
    closeModal,
    applyFilters,
    setHistoryFilters,
    historyFilters,
  } = props;
  const { t } = useTranslation(["Webhooks", "Files", "Common"]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    deliveryDate: null,
    deliveryFrom: now().setZone(window.timezone).startOf("day"),
    deliveryTo: now().setZone(window.timezone).endOf("day"),
    status: [],
  });

  const [isApplied, setIsApplied] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const handleApplyFilters = () => {
    if (filters.deliveryTo > filters.deliveryFrom) {
      const params = formatFilters(filters);

      setHistoryFilters(filters);
      setIsApplied(true);

      applyFilters(params);
      closeModal();
    }
  };

  useEffect(() => {
    if (historyFilters === null) {
      if (filters.deliveryDate !== null || filters.status.length > 0) {
        setFilters({
          deliveryDate: null,
          deliveryFrom: now().setZone(window.timezone).startOf("day"),
          deliveryTo: now().setZone(window.timezone).endOf("day"),
          status: [],
        });
      }
      isLoaded && navigate(`/developer-tools/webhooks/${id}`);
    } else {
      setFilters(historyFilters);
      setIsApplied(true);
      navigate(constructUrl(`/developer-tools/webhooks/${id}`, historyFilters));
    }
    setIsLoaded(true);
  }, [historyFilters, visible]);

  const areFiltersChanged =
    historyFilters !== null
      ? areArraysEqual(filters.status, historyFilters.status) &&
        filters.deliveryDate === historyFilters?.deliveryDate &&
        filters.deliveryFrom === historyFilters.deliveryFrom &&
        filters.deliveryTo === historyFilters.deliveryTo
      : filters.deliveryDate === null && filters.status.length === 0;

  return (
    <ModalDialog visible={visible} onClose={closeModal} displayType="aside">
      <ModalDialog.Header>{t("Common:Filter")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.dialogBodyWrapper}>
          <DeliveryDatePicker
            isApplied={isApplied}
            setIsApplied={setIsApplied}
            filters={filters}
            setFilters={setFilters}
          />
          <StatusPicker filters={filters} setFilters={setFilters} />
        </div>
      </ModalDialog.Body>
      {!areFiltersChanged ? (
        <ModalDialog.Footer>
          <div className={styles.filterDialogFooter}>
            <Button
              className="apply-button"
              label={t("Common:ApplyButton")}
              size="normal"
              primary
              onClick={handleApplyFilters}
              isDisabled={filters.deliveryTo <= filters.deliveryFrom}
              testId="apply_filter_button"
            />
            <Button
              className="cancel-button"
              label={t("Common:CancelButton")}
              size="normal"
              onClick={closeModal}
              testId="cancel_filter_button"
            />
          </div>
        </ModalDialog.Footer>
      ) : null}
    </ModalDialog>
  );
};

export default inject(({ webhooksStore }) => {
  const { setHistoryFilters, historyFilters } = webhooksStore;

  return { setHistoryFilters, historyFilters };
})(observer(FilterDialog));
