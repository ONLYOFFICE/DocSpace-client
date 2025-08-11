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
import { useTranslation, Trans } from "react-i18next";
import classNames from "classnames";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

import WalletReactSvgUrl from "PUBLIC_DIR/images/icons/16/wallet.react.svg?url";

import styles from "../styles/Wallet.module.scss";

type WalletInfoProps = {
  balance?: string;
  onTopUp?: () => void;
  isBalanceInsufficient?: boolean;
};

const WalletInfo = (props: WalletInfoProps) => {
  const { balance, onTopUp, isBalanceInsufficient } = props;
  const { t } = useTranslation(["Payments", "Common"]);

  const keyProp = isBalanceInsufficient
    ? { tKey: "BalanceInsufficient" }
    : { tKey: "Balance" };

  return (
    <div className={styles.walletInfoContainer}>
      <div className={styles.walletInfoIcon}>
        <ReactSVG src={WalletReactSvgUrl} />
      </div>
      <div className={styles.walletInfoBody}>
        <Text
          className={styles.walletInfoTitle}
          fontWeight="600"
          fontSize="14px"
        >
          {t("ProductNameWallet", { productName: t("Common:ProductName") })}
        </Text>
        <div
          className={classNames(styles.walletInfoBalance, {
            [styles.warningColor]: isBalanceInsufficient,
          })}
        >
          <Trans
            t={t}
            i18nKey={keyProp.tKey}
            ns="Payments"
            values={{ balance }}
            components={{
              1: isBalanceInsufficient ? (
                <Text as="span" fontWeight={600} />
              ) : (
                <Text fontWeight={600} isInline />
              ),
            }}
          />
        </div>
      </div>
      {onTopUp ? (
        <Link
          className={styles.walletInfoTopUp}
          fontSize="13px"
          fontWeight="600"
          onClick={onTopUp}
          textDecoration="underline"
          dataTestId="top_up_wallet_link"
        >
          {t("TopUp")}
        </Link>
      ) : null}
    </div>
  );
};

export default WalletInfo;
