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

import React from "react";
import moment from "moment";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { TTransactionCollection } from "@docspace/shared/api/portal/types";

import "../../styles/TransactionHistory.scss";
import { accountingLedgersFormat } from "../../utils";

interface TransactionRowProps {
  transaction: TTransactionCollection;
  language?: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  language = "en",
}) => {
  const { credit, withdrawal, currency } = transaction;
  const { t } = useTranslation("Payments");
  const isCredit = credit > 0;

  const formattedAmount = accountingLedgersFormat(
    language,
    credit || withdrawal,
    isCredit,
    currency,
  );

  const dateFormat = `L ${moment.localeData().longDateFormat("LT")}`;

  return (
    <TableRow>
      <TableCell>
        <Text fontWeight={600} fontSize="11px">
          {moment(transaction.date).format(dateFormat)}
        </Text>
      </TableCell>
      <TableCell>
        <Text fontWeight={600} fontSize="11px">
          {transaction.service ? "Service" : t("Payments:BalanceTopUp")}
        </Text>
      </TableCell>
      <TableCell>
        <Text fontWeight={600} fontSize="11px">
          {transaction.service ? transaction.quantity : "—"}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          fontWeight={600}
          fontSize="11px"
          className={`transaction-row__amount--${isCredit ? "credit" : "debit"}`}
        >
          {formattedAmount}
        </Text>
      </TableCell>
    </TableRow>
  );
};

export default inject(({ authStore }: TStore) => {
  const { language } = authStore;

  return { language };
})(observer(TransactionRow));
