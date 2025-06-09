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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment-timezone";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import styled from "styled-components";

import { Button } from "@docspace/shared/components/button";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import DeliveryDatePicker from "./DeliveryDatePicker";
import StatusPicker from "./StatusPicker";

const DialogBodyWrapper = styled.div`
  margin-top: 16px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;

  button {
    width: 100%;
  }
  button:first-of-type {
    margin-inline-end: 10px;
  }
`;

const constructUrl = (baseUrl, filters) => {
  const url = new URL(baseUrl, "http://127.0.0.1:8092/");
  url.searchParams.append(
    "deliveryDate",
    filters.deliveryDate?.format("YYYY-MM-DD") || null,
  );
  url.searchParams.append("deliveryFrom", filters.deliveryFrom.format("HH:mm"));
  url.searchParams.append("deliveryTo", filters.deliveryTo.format("HH:mm"));
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
    deliveryFrom: moment().tz(window.timezone).startOf("day"),
    deliveryTo: moment().tz(window.timezone).endOf("day"),
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
          deliveryFrom: moment().tz(window.timezone).startOf("day"),
          deliveryTo: moment().tz(window.timezone).endOf("day"),
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
      <ModalDialog.Header>{t("Files:Filter")}</ModalDialog.Header>
      <ModalDialog.Body>
        <DialogBodyWrapper>
          <DeliveryDatePicker
            isApplied={isApplied}
            setIsApplied={setIsApplied}
            filters={filters}
            setFilters={setFilters}
          />
          <StatusPicker filters={filters} setFilters={setFilters} />
        </DialogBodyWrapper>
      </ModalDialog.Body>
      {!areFiltersChanged ? (
        <ModalDialog.Footer>
          <Footer>
            <Button
              className="apply-button"
              label={t("Common:ApplyButton")}
              size="normal"
              primary
              onClick={handleApplyFilters}
              isDisabled={filters.deliveryTo <= filters.deliveryFrom}
            />
            <Button
              className="cancel-button"
              label={t("Common:CancelButton")}
              size="normal"
              onClick={closeModal}
            />
          </Footer>
        </ModalDialog.Footer>
      ) : null}
    </ModalDialog>
  );
};

export default inject(({ webhooksStore }) => {
  const { setHistoryFilters, historyFilters } = webhooksStore;

  return { setHistoryFilters, historyFilters };
})(observer(FilterDialog));
