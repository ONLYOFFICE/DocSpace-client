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
import { inject, observer } from "mobx-react";

import { TableBody, TableContainer } from "@docspace/shared/components/table";
import { TTransactionCollection } from "@docspace/shared/api/portal/types";
import { Text } from "@docspace/shared/components/text";
import { EmptyView } from "@docspace/shared/components/empty-view";

import NoTransactionsIcon from "PUBLIC_DIR/images/no.transactions.react.svg";

import TableHeader from "./TableView/TableHeader";
import TransactionRow from "./TableView/TransactionRow";
import "./transaction-history.scss";

const TABLE_VERSION = "3";
const COLUMNS_SIZE = `historyColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelLoginHistoryColumnsSize_ver-${TABLE_VERSION}`;

const TransactionHistory = ({ userId, sectionWidth, history }) => {
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;
  const ref = useRef(null);

  const { t } = useTranslation("Payments");
  // const imgSrc = theme.isBase ? NoTransactionsIcon : NoTransactionsIcon;

  const tableBody = (
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
        fetchMoreFiles={() => {}}
        hasMoreFiles={false}
        itemCount={history.length}
      >
        {history.map((transaction: TTransactionCollection, index: number) => (
          <TransactionRow
            transaction={transaction}
            key={`transaction-${index}`}
          />
        ))}
      </TableBody>
    </TableContainer>
  );

  return (
    <>
      <Text isBold fontSize="16px" className="transaction-history-title">
        {t("TransactionHistory")}
      </Text>
      {!history.length ? (
        <EmptyView
          icon={<NoTransactionsIcon />}
          title={t("NoWalletTransaction")}
          description={t("NoWalletTransactionDescription")}
          options={null}
        />
      ) : (
        tableBody
      )}
    </>
  );
};

export default inject(
  ({ settingsStore, setup, userStore, paymentStore }: TStore) => {
    const { viewAs, setViewAs } = setup;
    const { currentDeviceType, theme } = settingsStore;
    const { transactionHistory } = paymentStore;

    const userId = userStore.user?.id;

    return {
      viewAs,
      setViewAs,
      currentDeviceType,
      userId,
      history: transactionHistory?.collection ?? [],
      theme,
    };
  },
)(observer(TransactionHistory));
