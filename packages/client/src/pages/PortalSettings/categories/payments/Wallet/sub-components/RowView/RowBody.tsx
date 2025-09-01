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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { TTheme } from "@docspace/shared/themes";
import { Text } from "@docspace/shared/components/text";
import { Row, RowContent } from "@docspace/shared/components/rows";
import { TTransactionCollection } from "@docspace/shared/api/portal/types";

import { getCorrectDate } from "@docspace/shared/utils";
import styles from "../../styles/TransactionHistory.module.scss";
import { accountingLedgersFormat, getServiceQuantity } from "../../utils";

type TransactionRowViewProps = {
  transaction: TTransactionCollection;
  language?: string;
  theme?: TTheme;
  sectionWidth: number;
};

const TransactionRowView: React.FC<TransactionRowViewProps> = ({
  transaction,
  language = "en",
  theme,
  sectionWidth,
}) => {
  const { credit, debit, currency } = transaction;
  const { t } = useTranslation("Payments");
  const isCredit = credit > 0;

  const formattedAmount = accountingLedgersFormat(
    language,
    credit || debit,
    isCredit,
    currency,
  );

  const correctDate = getCorrectDate(language, transaction.date);

  const getRowChildren = () => {
    const children = [
      <div key="description">
        <Text
          fontWeight={600}
          fontSize="14px"
          as="span"
          className={styles.transactionRowDescription}
        >
          {transaction.description}
        </Text>
        {transaction.details ? (
          <Text fontWeight={600} fontSize="14px" as="span">
            ({transaction.details})
          </Text>
        ) : null}
      </div>,
      <div key="spacer" />,
      <Text
        key="date"
        fontWeight={600}
        fontSize="11px"
        dataTestId="transaction_date"
      >
        {correctDate}
      </Text>,
    ];

    if (transaction.participantDisplayName) {
      children.push(
        <Text key="participant" fontWeight={600} fontSize="11px">
          {transaction.participantDisplayName}
        </Text>,
      );
    }

    if (transaction.serviceUnit) {
      children.push(
        <Text key="quantity" fontWeight={600} fontSize="11px">
          {getServiceQuantity(t, transaction.quantity, transaction.serviceUnit)}
        </Text>,
      );
    }

    return children;
  };

  return (
    <Row
      className={styles.transactionRow}
      badgesComponent={
        <Text
          fontWeight={600}
          fontSize="13px"
          className={classNames(styles.transactionRowAmount, {
            [styles.transactionRowAmountCredit]: isCredit,
          })}
        >
          {formattedAmount}
        </Text>
      }
    >
      <RowContent
        sideColor={theme?.filesSection?.rowView?.sideColor || ""}
        sectionWidth={sectionWidth}
      >
        {getRowChildren()}
      </RowContent>
    </Row>
  );
};

export default inject(({ authStore, settingsStore }: TStore) => {
  const { language } = authStore;
  const { theme } = settingsStore;
  return { language, theme };
})(observer(TransactionRowView));
