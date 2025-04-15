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
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { TableBody, TableContainer } from "@docspace/shared/components/table";
import { TTransactionCollection } from "@docspace/shared/api/portal/types";
import { EmptyView } from "@docspace/shared/components/empty-view";
import { RowContainer } from "@docspace/shared/components/rows";
import { DeviceType } from "@docspace/shared/enums";

import NoTransactionsIcon from "PUBLIC_DIR/images/no.transactions.react.svg";
import NoTransactionsFilterIcon from "PUBLIC_DIR/images/no.transactions.filter.react.svg";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import TableHeader from "./TableView/TableHeader";
import TransactionRow from "./TableView/TableBody";
import TransactionRowView from "./RowView/RowBody";

import "../styles/TransactionHistory.scss";

const TABLE_VERSION = "3";
const COLUMNS_SIZE = `historyColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelLoginHistoryColumnsSize_ver-${TABLE_VERSION}`;

type TransactionHistoryProps = {
  userId: string;
  sectionWidth: number;
  history: TTransactionCollection[];
  viewAs: string;
  hasAppliedDateFilter: boolean;
  setViewAs: (view: string) => void;
  currentDeviceType: DeviceType;
};

const TransactionBody = ({
  userId,
  sectionWidth,
  history,
  viewAs,
  setViewAs,
  currentDeviceType,
  hasAppliedDateFilter,
}: TransactionHistoryProps) => {
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;
  const ref = useRef(null);
  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const { t } = useTranslation(["Payments", "Settings"]);

  const tableView = (
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
          useReactWindow
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

  const rowView = (
    <RowContainer
      className="people-row-container"
      useReactWindow
      fetchMoreFiles={() => {}}
      hasMoreFiles={false}
      itemCount={5}
      filesLength={history!.length}
      itemHeight={58}
      onScroll={() => {}}
    >
      {history.map((transaction, index) => (
        <TransactionRowView
          transaction={transaction}
          key={`transaction-row-${transaction.date || index}`}
        />
      ))}
    </RowContainer>
  );

  const icon = hasAppliedDateFilter ? (
    <NoTransactionsFilterIcon />
  ) : (
    <NoTransactionsIcon />
  );

  const title = hasAppliedDateFilter
    ? t("NoFindingsFound")
    : t("NoWalletTransaction");
  const description = hasAppliedDateFilter
    ? t("NoTransactionsFilter")
    : t("NoWalletTransactionDescription");

  const emptyView = (
    <EmptyView
      icon={icon}
      title={title}
      description={description}
      options={null}
    />
  );

  return history.length
    ? viewAs === "table"
      ? tableView
      : rowView
    : emptyView;
};

export default TransactionBody;
