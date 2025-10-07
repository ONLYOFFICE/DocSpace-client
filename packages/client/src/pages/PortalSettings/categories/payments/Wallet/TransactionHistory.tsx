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

import React, { useState, useMemo } from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import moment from "moment";
import classNames from "classnames";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { DatePicker } from "@docspace/shared/components/date-picker";
import { toastr } from "@docspace/shared/components/toast";
import {
  checkTransactionHistoryReport,
  startTransactionHistoryReport,
} from "@docspace/shared/api/portal";
import {
  DeviceType,
  EmployeeStatus,
  EmployeeType,
} from "@docspace/shared/enums";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import FilterIcon from "@docspace/shared/components/filter/sub-components/FilterIcon";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { SelectedItemPure } from "@docspace/shared/components/selected-item/SelectedItem";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { TUser } from "@docspace/shared/api/people/types";
import PeopleSelector from "@docspace/shared/selectors/People";
import Filter from "@docspace/shared/api/people/filter";

import FilterPanel from "./sub-components/FilterPanel";
import TransactionBody from "./sub-components/TransactionBody";
import styles from "./styles/TransactionHistory.module.scss";
import TableLoader from "./sub-components/TableLoader";
import { Link } from "@docspace/shared/components/link";

type TransactionHistoryProps = {
  getStartTransactionDate?: () => string;
  getEndTransactionDate?: () => string;
  fetchTransactionHistory?: any;
  openOnNewPage?: boolean;
  isTransactionHistoryExist?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  isNotPaidPeriod?: boolean;
  formatDate?: (date: moment.Moment) => string;
};

const getTransactionType = (key: string) => {
  return {
    isCredit: key !== "debit",
    isDebit: key !== "credit",
  };
};

const filter = () => {
  const newFilter = Filter.getDefault();
  newFilter.role = [EmployeeType.Admin];
  newFilter.employeeStatus = EmployeeStatus.Active;
  return newFilter;
};

let timerId = null;

const useInitialState = (
  getStartTransactionDate: () => string,
  getEndTransactionDate: () => string,
  initialType: TOption,
) => {
  const initialState = useMemo(() => {
    return {
      selectedType: initialType,
      startDate: moment(getStartTransactionDate()),
      endDate: moment(getEndTransactionDate()),
      selectedContact: null as TUser | null,
      isChanged: false,
    };
  }, []);

  const isStateModified = (currentState: {
    selectedType: TOption;
    startDate: moment.Moment;
    endDate: moment.Moment;
    selectedContact: TUser | null;
  }) => {
    return (
      currentState.selectedType.key !== initialState.selectedType.key ||
      !currentState.startDate.isSame(initialState.startDate, "day") ||
      !currentState.endDate.isSame(initialState.endDate, "day") ||
      currentState.selectedContact !== initialState.selectedContact
    );
  };

  return { initialState, isStateModified };
};

const fetchTransactions = async (
  fetchTransactionHistory: (
    startDate: moment.Moment,
    endDate: moment.Moment,
    isCredit: boolean,
    isDebit: boolean,
    participantName?: string,
  ) => Promise<void>,
  setIsLoading: (loading: boolean) => void,
  selectedType: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  participantName?: string,
) => {
  timerId = setTimeout(() => setIsLoading(true), 500);

  const { isCredit, isDebit } = getTransactionType(selectedType as string);

  try {
    await fetchTransactionHistory(
      startDate,
      endDate,
      isCredit,
      isDebit,
      participantName,
    );

    setIsLoading(false);
    if (timerId) clearTimeout(timerId);
    timerId = null;
  } catch (e) {
    toastr.error(e as Error);
  }
};

const TransactionHistory = (props: TransactionHistoryProps) => {
  const {
    getStartTransactionDate,
    getEndTransactionDate,
    fetchTransactionHistory,
    openOnNewPage,
    isTransactionHistoryExist,
    isMobile,
    isTablet,
    isNotPaidPeriod,
    formatDate,
  } = props;

  const { t } = useTranslation(["Payments", "Settings"]);

  const typeOfHistoty: TOption[] = [
    {
      key: "allTransactions",
      label: t("AllTransactions"),
      dataTestId: "all_transactions_option",
    },
    {
      key: "credit",
      label: t("Credit"),
      dataTestId: "credit_transactions_option",
    },
    {
      key: "debit",
      label: t("Debit"),
      dataTestId: "debit_transactions_option",
    },
  ];

  const { initialState, isStateModified } = useInitialState(
    getStartTransactionDate!,
    getEndTransactionDate!,
    typeOfHistoty[0],
  );

  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<TOption>(
    initialState.selectedType,
  );
  const [startDate, setStartDate] = useState<moment.Moment>(
    initialState.startDate,
  );
  const [endDate, setEndDate] = useState<moment.Moment>(initialState.endDate);
  const [selectedContact, setSelectedContact] = useState<TUser | null>(
    initialState.selectedContact,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFormationHistory, setIsFormationHistory] = useState(false);
  const [isFilterDialogVisible, setIsFilterDialogVisible] = useState(false);
  const [isChanged, setIsChanged] = useState(initialState.isChanged);

  // Mobile filter state for dialog
  const [mobileFilterState, setMobileFilterState] = useState({
    selectedType: selectedType,
    startDate: startDate,
    endDate: endDate,
    selectedContact: selectedContact,
  });

  const openFilterDialog = () => {
    // Initialize mobile filter state with current state when opening dialog
    setMobileFilterState({
      selectedType: selectedType,
      startDate: startDate,
      endDate: endDate,
      selectedContact: selectedContact,
    });
    setIsFilterDialogVisible(true);
  };

  const closeFilterDialog = () => {
    // Reset mobile filter state to current state values when canceling dialog
    setMobileFilterState({
      selectedType: selectedType,
      startDate: startDate,
      endDate: endDate,
      selectedContact: selectedContact,
    });
    setIsFilterDialogVisible(false);
  };

  const onClearFilter = async () => {
    // Reset both state and mobile filter state to initial values
    setSelectedType(initialState.selectedType);
    setStartDate(initialState.startDate);
    setEndDate(initialState.endDate);
    setSelectedContact(initialState.selectedContact);
    setIsChanged(initialState.isChanged);

    // Also reset the mobile filter state
    setMobileFilterState({
      selectedType: initialState.selectedType,
      startDate: initialState.startDate,
      endDate: initialState.endDate,
      selectedContact: initialState.selectedContact,
    });

    if (isMobile) closeFilterDialog();

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      initialState.selectedType.key as string,
      initialState.startDate,
      initialState.endDate,
      initialState.selectedContact?.id,
    );
  };

  const shouldShowClearButton = isStateModified({
    selectedType,
    startDate,
    endDate,
    selectedContact,
  });

  const onCloseContactSelector = () => {
    setIsSelectorVisible(false);
  };

  const onSelectorAddButtonClick = () => {
    setIsSelectorVisible(true);
  };

  const onSelectType = async (option: TOption) => {
    if (isFilterDialogVisible) {
      setMobileFilterState((prev) => ({
        ...prev,
        selectedType: option,
      }));
      setIsChanged(true);
      return;
    }

    setSelectedType(option);

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      option.key as string,
      startDate,
      endDate,
      selectedContact?.id,
    );
  };

  const onStartDateChange = async (
    date: moment.Moment | null,
  ): Promise<void> => {
    if (!date) {
      return;
    }

    if (isFilterDialogVisible) {
      setMobileFilterState((prev) => ({
        ...prev,
        startDate: date,
      }));
      setIsChanged(true);
      return;
    }

    setStartDate(date);

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      selectedType.key as string,
      date,
      endDate,
      selectedContact?.id,
    );
  };

  const onEndDateChange = async (date: moment.Moment | null): Promise<void> => {
    if (!date) {
      return;
    }

    if (isFilterDialogVisible) {
      setMobileFilterState((prev) => ({
        ...prev,
        endDate: date,
      }));
      setIsChanged(true);
      return;
    }

    setEndDate(date);

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      selectedType.key as string,
      startDate,
      date,
      selectedContact?.id,
    );
  };

  const onSubmitContactSelector = async (contacts: TSelectorItem[]) => {
    setIsSelectorVisible(false);

    if (isFilterDialogVisible) {
      setMobileFilterState((prev) => ({
        ...prev,
        selectedContact: contacts[0] as unknown as TUser,
      }));
      setIsChanged(true);
      return;
    }

    setSelectedContact(contacts[0] as unknown as TUser);

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      selectedType.key as string,
      startDate,
      endDate,
      contacts[0].id as string,
    );
  };

  const onCloseSelectedContact = async () => {
    if (isFilterDialogVisible) {
      setMobileFilterState((prev) => ({
        ...prev,
        selectedContact: null,
      }));
      setIsChanged(true);
      return;
    }

    setSelectedContact(null);

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      selectedType.key as string,
      startDate,
      endDate,
    );
  };

  const onApplyFilter = async () => {
    // Apply all mobile filter state values to actual state
    setSelectedType(mobileFilterState.selectedType);
    setStartDate(mobileFilterState.startDate);
    setEndDate(mobileFilterState.endDate);
    setSelectedContact(mobileFilterState.selectedContact);

    setIsFilterDialogVisible(false);
    setIsChanged(false);

    await fetchTransactions(
      fetchTransactionHistory,
      setIsLoading,
      mobileFilterState.selectedType.key as string,
      mobileFilterState.startDate,
      mobileFilterState.endDate,
      mobileFilterState.selectedContact?.id,
    );
  };

  const getReport = async () => {
    const reportTimerId = setTimeout(() => setIsFormationHistory(true), 200);

    const isCredit = selectedType.key !== "debit";
    const isDebit = selectedType.key !== "credit";

    try {
      await startTransactionHistoryReport(
        formatDate!(startDate),
        formatDate!(endDate),
        isCredit,
        isDebit,
      );

      const result = await new Promise<any>((resolve, reject) => {
        const checkStatus = async () => {
          try {
            const response = await checkTransactionHistoryReport();

            if (!response) {
              reject(new Error(t("Common:UnexpectedError")));
              return;
            }

            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            if (response.isCompleted) {
              resolve(response);
              return;
            }

            setTimeout(checkStatus, 1000);
          } catch (err) {
            reject(err);
          }
        };

        checkStatus();
      });

      if (!result || !result.resultFileUrl) {
        throw new Error(t("Common:UnexpectedError"));
      }

      setTimeout(
        () =>
          window.open(result.resultFileUrl, openOnNewPage ? "_blank" : "_self"),
        100,
      );
    } catch (e) {
      toastr.error(e as Error);
    }

    setIsFormationHistory(false);
    clearTimeout(reportTimerId);
  };

  const datesComponent = (
    <div className={styles.transactionDates}>
      <Trans
        i18nKey="FromTo"
        ns="Payments"
        t={t}
        components={{
          1: (
            <DatePicker
              key="start-date-picker"
              initialDate={
                isFilterDialogVisible ? mobileFilterState.startDate : startDate
              }
              onChange={onStartDateChange}
              selectDateText={t("Common:SelectDate")}
              locale={moment.locale()}
              openDate={
                isFilterDialogVisible ? mobileFilterState.startDate : startDate
              }
              minDate={undefined}
              maxDate={
                isFilterDialogVisible ? mobileFilterState.endDate : endDate
              }
              outerDate={
                isFilterDialogVisible ? mobileFilterState.startDate : startDate
              }
              hideCross
              autoPosition={isTablet}
              testId="transaction_start_date_picker"
            />
          ),
          2: (
            <DatePicker
              key="end-date-picker"
              initialDate={
                isFilterDialogVisible ? mobileFilterState.endDate : endDate
              }
              onChange={onEndDateChange}
              selectDateText={t("Common:SelectDate")}
              locale={moment.locale()}
              openDate={
                isFilterDialogVisible ? mobileFilterState.endDate : endDate
              }
              minDate={
                isFilterDialogVisible ? mobileFilterState.startDate : startDate
              }
              maxDate={undefined}
              outerDate={
                isFilterDialogVisible ? mobileFilterState.endDate : endDate
              }
              hideCross
              autoPosition={isTablet}
              testId="transaction_end_date_picker"
            />
          ),
        }}
      />
    </div>
  );

  const currentContact = isFilterDialogVisible
    ? mobileFilterState.selectedContact
    : selectedContact;

  const contactSelector = !currentContact ? (
    <SelectorAddButton
      label={t("SelectContact")}
      onClick={onSelectorAddButtonClick}
    />
  ) : (
    <SelectedItemPure
      key={`${currentContact}`}
      propKey={currentContact?.id}
      label={currentContact.displayName}
      onClose={onCloseSelectedContact}
      className={styles.selectedContactItem}
    />
  );

  const filterCombobox = (
    <div className={styles.transactionHistoryCombobox}>
      <ComboBox
        className={styles.transactionTypeCombobox}
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
        dataTestId="transaction_type_combobox"
        dropDownTestId="transaction_type_dropdown"
      />
      {datesComponent}
      {contactSelector}
      {shouldShowClearButton ? (
        <Link
          onClick={onClearFilter}
          textDecoration="underline dotted"
          dataTestId="clear_filter_button"
          className={styles.clearFilter}
        >
          {t("Common:ClearFilter")}
        </Link>
      ) : null}
    </div>
  );

  const mobileFilter = (
    <div className={styles.filterIconWrapper}>
      <FilterIcon
        id="filter-button"
        onClick={openFilterDialog}
        isOpen={isFilterDialogVisible}
        isShowIndicator={shouldShowClearButton}
        dataTestId="transaction_filter_icon"
      />
    </div>
  );

  const selectorComponent = isSelectorVisible ? (
    <PeopleSelector
      withCancelButton
      onCancel={onCloseContactSelector}
      cancelButtonLabel=""
      disableSubmitButton={false}
      submitButtonLabel={t("Common:SelectAction")}
      onSubmit={onSubmitContactSelector}
      withHeader
      headerProps={{
        onCloseClick: onCloseContactSelector,
        isCloseable: true,
        headerLabel: t("ListContacts"),
      }}
      filter={filter}
      withInfo
      infoText={t("OnlyPortalAdminsShown", {
        productName: t("Common:ProductName"),
      })}
      emptyScreenHeader={t("Common:NotFoundMembers")}
      emptyScreenDescription={t("CreateEditRoomDialog:PeopleSelectorInfo", {
        productName: t("Common:ProductName"),
      })}
    />
  ) : null;

  return (
    <>
      <div className={styles.transactionHistoryHeader}>
        <Text isBold fontSize="16px" className={styles.transactionHistoryTitle}>
          {t("TransactionHistory")}
        </Text>
        {(shouldShowClearButton || isTransactionHistoryExist) && isMobile
          ? mobileFilter
          : null}
      </div>
      {(shouldShowClearButton || isTransactionHistoryExist) && !isMobile
        ? filterCombobox
        : null}

      {isLoading ? (
        <TableLoader isMobile={isMobile} isTablet={isTablet} />
      ) : (
        <TransactionBody
          hasAppliedDateFilter={shouldShowClearButton}
          isTransactionHistoryExist={isTransactionHistoryExist!}
        />
      )}

      {isTransactionHistoryExist && !isLoading ? (
        <>
          <Text className={styles.transactionsLimit}>
            {t("TransactionsLimit", {
              buttonName: t("Settings:DownloadReportBtnText"),
            })}
          </Text>

          <div
            className={classNames(styles.downloadWrapper, {
              [styles.isMobileButton]: isMobile,
            })}
          >
            <Button
              label={t("Settings:DownloadReportBtnText")}
              size={isMobile ? ButtonSize.normal : ButtonSize.small}
              minWidth="auto"
              onClick={getReport}
              isLoading={isFormationHistory}
              isDisabled={isNotPaidPeriod}
              scale={isMobile}
              testId="download_report_button"
            />
            <Text as="span" className={styles.downloadReportDescription}>
              {t("Settings:ReportSaveLocation", {
                sectionName: t("Common:MyDocuments"),
              })}
            </Text>
          </div>
        </>
      ) : null}

      {isFilterDialogVisible ? (
        <FilterPanel
          isFilterDialogVisible={isFilterDialogVisible}
          closeFilterDialog={closeFilterDialog}
          isSelectorVisible={isSelectorVisible}
          selectorComponent={selectorComponent}
          datesComponent={datesComponent}
          contactSelector={contactSelector}
          typeOfHistoty={typeOfHistoty}
          selectedType={
            isFilterDialogVisible
              ? mobileFilterState.selectedType
              : selectedType
          }
          onSelectType={onSelectType}
          onApplyFilter={onApplyFilter}
          isChanged={isChanged}
          clearFilter={onClearFilter}
          shouldShowClearButton={shouldShowClearButton}
        />
      ) : null}

      {isSelectorVisible ? (
        <ModalDialog
          visible={isSelectorVisible}
          onClose={onCloseContactSelector}
          displayType={ModalDialogType.aside}
          withoutPadding
        >
          <ModalDialog.Body>{selectorComponent}</ModalDialog.Body>
        </ModalDialog>
      ) : null}
    </>
  );
};

export default inject(
  ({ paymentStore, filesSettingsStore, userStore, settingsStore }: TStore) => {
    const {
      getStartTransactionDate,
      getEndTransactionDate,
      fetchTransactionHistory,
      isTransactionHistoryExist,
      currentTariffStatusStore,
      formatDate,
    } = paymentStore;

    const { openOnNewPage } = filesSettingsStore;

    const { currentDeviceType } = settingsStore;
    const { isNotPaidPeriod } = currentTariffStatusStore!;

    const userId = userStore.user?.id;

    const isMobile = currentDeviceType === DeviceType.mobile;
    const isTablet = currentDeviceType === DeviceType.tablet;

    return {
      getStartTransactionDate,
      getEndTransactionDate,
      fetchTransactionHistory,
      openOnNewPage,
      userId,
      isMobile,
      isTablet,
      isTransactionHistoryExist,
      isNotPaidPeriod,
      formatDate,
    };
  },
)(observer(TransactionHistory));
