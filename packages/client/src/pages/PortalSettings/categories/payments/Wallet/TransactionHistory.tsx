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

import React, { useRef, useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import moment from "moment";

import { TableBody, TableContainer } from "@docspace/shared/components/table";
import { TTransactionCollection } from "@docspace/shared/api/portal/types";
import { Text } from "@docspace/shared/components/text";
import { EmptyView } from "@docspace/shared/components/empty-view";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { Toast, toastr } from "@docspace/shared/components/toast";

import NoTransactionsIcon from "PUBLIC_DIR/images/no.transactions.react.svg";
import NoTransactionsFilterIcon from "PUBLIC_DIR/images/no.transactions.filter.react.svg";

import TableHeader from "./TableView/TableHeader";
import TransactionRow from "./TableView/TransactionRow";
import "./transaction-history.scss";

type DateOption = {
  key: string;
  label: string;
};

type TransactionHistoryProps = {
  userId: string;
  sectionWidth: number;
  history: TTransactionCollection[];
  getStartTransactionDate: () => string;
  getEndTransactionDate: () => string;
};

const TABLE_VERSION = "3";
const COLUMNS_SIZE = `historyColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelLoginHistoryColumnsSize_ver-${TABLE_VERSION}`;

const TransactionHistory = ({
  userId,
  sectionWidth,
  history,
  getStartTransactionDate,
  getEndTransactionDate,
  fetchTransactionHistory,
}: TransactionHistoryProps) => {
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;
  const ref = useRef(null);

  const { t } = useTranslation("Payments");

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
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<DateOption>({
    key: "",
    label: "",
  });
  const [selectedEndDate, setSelectedEndDate] = useState<DateOption>({
    key: "",
    label: "",
  });
  const [filteredEndDateOptions, setFilteredEndDateOptions] = useState<
    DateOption[]
  >([]);
  const [filteredStartDateOptions, setFilteredStartDateOptions] = useState<
    DateOption[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppliedDateFilter, setHasAppliedDateFilter] = useState(
    !!history.length,
  );

  useEffect(() => {
    const startDateStr = getStartTransactionDate();
    const endDateStr = getEndTransactionDate();

    const startDate = moment(startDateStr);
    const endDate = moment(endDateStr);

    const options: DateOption[] = [];
    const currentDate = moment(endDate);

    while (currentDate.isSameOrAfter(startDate, "day")) {
      const dateStr = currentDate.format("YYYY-MM-DDTHH:mm:ss");
      const formattedDate = currentDate.format("L");

      options.push({
        key: dateStr,
        label: formattedDate,
      });

      currentDate.subtract(1, "day");
    }

    const sortedOptions = [...options].sort((a, b) =>
      moment(a.key).diff(moment(b.key)),
    );

    setDateOptions(sortedOptions);

    if (sortedOptions.length > 0) {
      const firstDate = sortedOptions[0];
      const lastDate = sortedOptions[sortedOptions.length - 1];

      setSelectedStartDate(firstDate);
      setSelectedEndDate(lastDate);

      setFilteredEndDateOptions(sortedOptions);
      setFilteredStartDateOptions(sortedOptions);
    }
  }, []);

  const onSelectType = async (option: TOption) => {
    setSelectedType(option);

    const timerId = setTimeout(() => setIsLoading(false), 200);

    const isCredit = option.key !== "debit";
    const isDebite = option.key !== "credit";
    try {
      await fetchTransactionHistory(
        selectedStartDate.key,
        selectedEndDate.key,
        isCredit,
        isDebite,
      );
    } catch (e) {
      toastr.error(e as Error);
    }

    setIsLoading(false);
    clearTimeout(timerId);
  };

  const onSelectStartDate = async (option: TOption): void => {
    const dateOption = option as DateOption;
    setSelectedStartDate(dateOption);
    setHasAppliedDateFilter(true);

    const filteredOptions = dateOptions.filter((endOption) =>
      moment(endOption.key).isSameOrAfter(moment(dateOption.key)),
    );

    setFilteredEndDateOptions(filteredOptions);
    setIsLoading(true);
    const timerId = setTimeout(() => setIsLoading(false), 200);

    try {
      await fetchTransactionHistory(dateOption.key, selectedEndDate.key);
    } catch (e) {
      toastr.error(e as Error);
    }

    setIsLoading(false);
    clearTimeout(timerId);
  };

  const onSelectEndDate = async (option: TOption): void => {
    const dateOption = option as DateOption;
    setSelectedEndDate(dateOption);
    setHasAppliedDateFilter(true);

    const filteredOptions = dateOptions.filter((startOption) =>
      moment(startOption.key).isSameOrBefore(moment(dateOption.key)),
    );

    setFilteredStartDateOptions(filteredOptions);
    setIsLoading(true);
    const timerId = setTimeout(() => setIsLoading(false), 200);

    try {
      await fetchTransactionHistory(selectedStartDate.key, dateOption.key);
    } catch (e) {
      toastr.error(e as Error);
    }

    setIsLoading(false);
    clearTimeout(timerId);
  };

  const tableBody = (
    <div className="transaction-history-body">
      <TableContainer forwardedRef={ref} useReactWindow={false}>
        <TableHeader
          sectionWidth={sectionWidth}
          containerRef={ref}
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          itemHeight={48}
        />
        <TableBody
          useReactWindow={false}
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          itemHeight={48}
          filesLength={history.length}
          fetchMoreFiles={() => Promise.resolve()}
          hasMoreFiles={false}
          itemCount={history.length}
        >
          {history.map((transaction, index) => (
            <TransactionRow
              transaction={transaction}
              key={`transaction-${transaction.date || index}`}
            />
          ))}
        </TableBody>
      </TableContainer>
    </div>
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
      <Text fontWeight={600} fontSize="14px">
        <Trans
          i18nKey="FromTo"
          ns="Payments"
          t={t}
          components={{
            1: (
              <ComboBox
                tabIndex={1}
                options={filteredStartDateOptions}
                selectedOption={selectedStartDate}
                onSelect={onSelectStartDate}
                directionY="both"
                noBorder={false}
                dropDownMaxHeight={300}
                showDisabledItems
                size={ComboBoxSize.content}
                scaled={false}
              />
            ),
            2: (
              <ComboBox
                tabIndex={2}
                options={filteredEndDateOptions}
                selectedOption={selectedEndDate}
                onSelect={onSelectEndDate}
                directionY="both"
                noBorder={false}
                dropDownMaxHeight={300}
                showDisabledItems
                size={ComboBoxSize.content}
                scaled={false}
              />
            ),
          }}
        />
      </Text>
    </div>
  );

  const title = hasAppliedDateFilter
    ? t("NoFindingsFound")
    : t("NoWalletTransaction");
  const description = hasAppliedDateFilter
    ? t("NoTransactionsFilter")
    : t("NoWalletTransactionDescription");

  const icon = hasAppliedDateFilter ? (
    <NoTransactionsFilterIcon />
  ) : (
    <NoTransactionsIcon />
  );

  const emptyView = (
    <EmptyView
      icon={icon}
      title={title}
      description={description}
      options={null}
    />
  );

  return (
    <>
      <Text isBold fontSize="16px" className="transaction-history-title">
        {t("TransactionHistory")}
      </Text>
      {hasAppliedDateFilter ? filterCombobox : null}
      {history.length ? tableBody : emptyView}
    </>
  );
};

export default inject(
  ({ settingsStore, setup, userStore, paymentStore }: TStore) => {
    const { viewAs, setViewAs } = setup;
    const { currentDeviceType, theme } = settingsStore;
    const {
      transactionHistory,
      getStartTransactionDate,
      getEndTransactionDate,
      fetchTransactionHistory,
    } = paymentStore;

    const userId = userStore.user?.id;

    return {
      viewAs,
      setViewAs,
      currentDeviceType,
      userId,
      history: transactionHistory?.collection ?? [],
      theme,
      getStartTransactionDate,
      getEndTransactionDate,
      fetchTransactionHistory,
    };
  },
)(observer(TransactionHistory));
