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

import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import moment from "moment";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TTransactionCollection } from "@docspace/shared/api/portal/types";
import { Text } from "@docspace/shared/components/text";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { DatePicker } from "@docspace/shared/components/date-picker";
import { toastr } from "@docspace/shared/components/toast";
import { getTransactionHistoryReport } from "@docspace/shared/api/portal";
import { DeviceType } from "@docspace/shared/enums";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import FilterIcon from "@docspace/shared/components/filter/sub-components/FilterIcon";

import TransactionBody from "./sub-components/TransactionBody";

import "./styles/TransactionHistory.scss";
import TableLoader from "./sub-components/TableLoader";

type TransactionHistoryProps = {
  getStartTransactionDate: () => string;
  getEndTransactionDate: () => string;
  fetchTransactionHistory: any;
  openOnNewPage: boolean;
  userId: string;
  sectionWidth: number;
  history: TTransactionCollection[];
  viewAs: string;
  setViewAs: (view: string) => void;
  currentDeviceType: DeviceType;
};

const formatDate = (date: moment.Moment) => date.format("YYYY-MM-DDTHH:mm:ss");

const TransactionHistory = ({
  getStartTransactionDate,
  getEndTransactionDate,
  fetchTransactionHistory,
  openOnNewPage,
  userId,
  sectionWidth,
  history,
  viewAs,
  setViewAs,
  currentDeviceType,
}: TransactionHistoryProps) => {
  const { t } = useTranslation(["Payments", "Settings"]);

  const typeOfHistoty: TOption[] = [
    {
      key: "allTransactions",
      label: t("AllTransactions"),
    },
    {
      key: "credit",
      label: t("Credit"),
    },
    {
      key: "debit",
      label: t("Debit"),
    },
  ];

  const [selectedType, setSelectedType] = useState<TOption>(typeOfHistoty[0]);
  const [startDate, setStartDate] = useState<moment.Moment>(
    moment(getStartTransactionDate()),
  );
  const [endDate, setEndDate] = useState<moment.Moment>(
    moment(getEndTransactionDate()),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppliedDateFilter, setHasAppliedDateFilter] = useState(false);
  const [isFormationHistory, setIsFormationHistory] = useState(false);
  const [isFilterDialogVisible, setIsFilterDialogVisible] = useState(false);

  const onSelectType = (option: TOption) => {
    setSelectedType(option);
    setHasAppliedDateFilter(true);
    setIsFilterDialogVisible(false);
    setIsLoading(true);
    fetchTransactionHistory(
      formatDate(startDate),
      formatDate(endDate),
      option.key !== "debit",
      option.key !== "credit",
    ).finally(() => {
      setIsLoading(false);
    });
  };

  const onStartDateChange = async (
    date: moment.Moment | null,
  ): Promise<void> => {
    if (!date) {
      return;
    }

    setStartDate(date);
    setHasAppliedDateFilter(true);
    setIsFilterDialogVisible(false);
    setIsLoading(true);
    try {
      await fetchTransactionHistory(
        formatDate(date),
        formatDate(endDate),
        selectedType.key !== "debit",
        selectedType.key !== "credit",
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onEndDateChange = async (date: moment.Moment | null): Promise<void> => {
    if (!date) {
      return;
    }

    setEndDate(date);
    setHasAppliedDateFilter(true);
    setIsFilterDialogVisible(false);
    setIsLoading(true);
    try {
      await fetchTransactionHistory(
        formatDate(startDate),
        formatDate(date),
        selectedType.key !== "debit",
        selectedType.key !== "credit",
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReport = async () => {
    const timerId = setTimeout(() => setIsFormationHistory(true), 200);

    const isCredit = selectedType.key !== "debit";
    const isDebit = selectedType.key !== "credit";

    try {
      const editorLink = await getTransactionHistoryReport(
        formatDate(startDate),
        formatDate(endDate),
        isCredit,
        isDebit,
      );

      if (!editorLink) return;

      setTimeout(
        () => window.open(editorLink, openOnNewPage ? "_blank" : "_self"),
        100,
      );
    } catch (e) {
      toastr.error(e as Error);
    }

    setIsFormationHistory(false);
    clearTimeout(timerId);
  };

  const openFilterDialog = () => {
    setIsFilterDialogVisible(true);
  };

  const closeFilterDialog = () => {
    setIsFilterDialogVisible(false);
  };

  const datesComponent = (
    <Text fontWeight={600} fontSize="14px" className="transaction-dates">
      <Trans
        i18nKey="FromTo"
        ns="Payments"
        t={t}
        components={{
          1: (
            <DatePicker
              initialDate={startDate}
              onChange={onStartDateChange}
              selectDateText={t("SelectStartDate")}
              locale={moment.locale()}
              openDate={startDate}
              minDate={undefined}
              maxDate={endDate}
              outerDate={startDate}
              hideCross
            />
          ),
          2: (
            <DatePicker
              initialDate={endDate}
              onChange={onEndDateChange}
              selectDateText={t("SelectEndDate")}
              locale={moment.locale()}
              openDate={endDate}
              minDate={startDate}
              maxDate={undefined}
              outerDate={endDate}
              hideCross
            />
          ),
        }}
      />
    </Text>
  );

  const filterCombobox = (
    <div className="transaction-history-combobox">
      <ComboBox
        tabIndex={1}
        options={typeOfHistoty}
        selectedOption={selectedType}
        onSelect={onSelectType}
        directionY="both"
        noBorder={false}
        dropDownMaxHeight={300}
        showDisabledItems
        size={ComboBoxSize.content}
        scaled={false}
      />
      {datesComponent}
    </div>
  );

  const mobileFilter = (
    <FilterIcon
      id="filter-button"
      onClick={openFilterDialog}
      isOpen={isFilterDialogVisible}
      isShowIndicator={hasAppliedDateFilter}
    />
  );

  const isMobile = currentDeviceType === DeviceType.mobile;
  const isTablet = currentDeviceType === DeviceType.tablet;

  return (
    <>
      <div className="transaction-history-header">
        <Text isBold fontSize="16px" className="transaction-history-title">
          {t("TransactionHistory")}
        </Text>
        {(hasAppliedDateFilter || history.length > 0) && isMobile
          ? mobileFilter
          : null}
      </div>
      {(hasAppliedDateFilter || history.length > 0) && !isMobile
        ? filterCombobox
        : null}

      {isLoading ? (
        <TableLoader isMobile={isMobile} isTablet={isTablet} />
      ) : (
        <TransactionBody
          hasAppliedDateFilter={hasAppliedDateFilter}
          userId={userId}
          sectionWidth={sectionWidth}
          history={history}
          viewAs={viewAs}
          setViewAs={setViewAs}
          currentDeviceType={currentDeviceType}
        />
      )}

      {history.length && !isLoading ? (
        <div className="download-wrapper">
          <Button
            className="download-report_button"
            label={t("Settings:DownloadReportBtnText")}
            size={ButtonSize.small}
            minWidth="auto"
            onClick={getReport}
            isLoading={isFormationHistory}
          />
          <Text as="span" className="download-report_description">
            {t("Settings:DownloadReportDescription")}
          </Text>
        </div>
      ) : null}

      {isFilterDialogVisible ? (
        <ModalDialog
          visible={isFilterDialogVisible}
          onClose={closeFilterDialog}
          displayType={ModalDialogType.aside}
          className="filter-dialog"
        >
          <ModalDialog.Header>{t("Filter")}</ModalDialog.Header>
          <ModalDialog.Body>
            <div className="filter-dialog-content">
              <div className="filter-dialog-section">
                <Text fontWeight={600} fontSize="15px">
                  {t("Common:Type")}
                </Text>
                <ComboBox
                  options={typeOfHistoty}
                  selectedOption={selectedType}
                  onSelect={onSelectType}
                  directionY="both"
                  noBorder={false}
                  dropDownMaxHeight={300}
                  showDisabledItems
                  size={ComboBoxSize.content}
                  scaled
                />
              </div>
              <div className="filter-dialog-divider" />
              <div className="filter-dialog-section">
                <Text fontWeight={600} fontSize="15px">
                  {t("TransactionPeriod")}
                </Text>
                <div>{datesComponent}</div>
              </div>
            </div>
          </ModalDialog.Body>
        </ModalDialog>
      ) : null}
    </>
  );
};

export default inject(
  ({
    paymentStore,
    filesSettingsStore,
    userStore,
    setup,
    settingsStore,
  }: TStore) => {
    const {
      transactionHistory,
      getStartTransactionDate,
      getEndTransactionDate,
      fetchTransactionHistory,
    } = paymentStore;

    const { openOnNewPage } = filesSettingsStore;
    const { viewAs, setViewAs } = setup;
    const { currentDeviceType } = settingsStore;

    const userId = userStore.user?.id;

    return {
      getStartTransactionDate,
      getEndTransactionDate,
      fetchTransactionHistory,
      openOnNewPage,
      userId,
      currentDeviceType,
      history: transactionHistory?.collection ?? [],
      viewAs,
      setViewAs,
    };
  },
)(observer(TransactionHistory));
