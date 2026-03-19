import React, { useMemo } from "react";

import classNames from "classnames";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { truncateNumberToFraction } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";
import styles from "./BalanceAmount.module.scss";

type BalanceAmountToken = {
  type: string;
  value: string;
};

type BalanceAmountProps = {
  title?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefresh?: boolean;
  amount?: number;
  currency?: string;
  language?: string;
  maximumFractionDigits?: number;
  className?: string;
  withoutMargin?: boolean;
  mainFontSize?: string;
  fractionFontSize?: string;
};

const typeClassMap: Record<string, string> = {
  integer: "integer",
  group: "group",
  decimal: "decimal",
  fraction: "fraction",
  currency: "currency",
  literal: "literal",
};

const BalanceAmount = (props: BalanceAmountProps) => {
  const {
    title,
    onRefresh,
    isRefreshing = false,
    showRefresh = true,
    amount = 0,
    currency = "USD",
    language = "en",
    maximumFractionDigits = 3,
    className,
    withoutMargin = false,
    mainFontSize,
    fractionFontSize,
  } = props;

  const tokens: BalanceAmountToken[] = useMemo(() => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;

    const truncatedStr = truncateNumberToFraction(
      safeAmount,
      maximumFractionDigits,
    );
    const truncated = Number(truncatedStr);

    const formatter = new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.formatToParts(truncated);
  }, [amount, currency, language, maximumFractionDigits]);

  return (
    <div className={className}>
      {title ? (
        <div className={styles.headerContainer}>
          <Text isBold fontSize="18px" className={styles.balanceTitle}>
            {title}
          </Text>

          {showRefresh && onRefresh ? (
            <IconButton
              iconName={RefreshReactSvgUrl}
              size={16}
              onClick={onRefresh}
              className={classNames(styles.refreshIcon, {
                [styles.spinning]: isRefreshing,
              })}
            />
          ) : null}
        </div>
      ) : null}

      <div
        className={classNames(styles.balanceAmountContainer, { [styles.withoutMargin]: withoutMargin })}
        style={{
          ...(mainFontSize && { "--balance-main-font-size": mainFontSize } as React.CSSProperties),
          ...(fractionFontSize && { "--balance-fraction-font-size": fractionFontSize } as React.CSSProperties),
        }}
      >
        {tokens.map((token) => (
          <Text
            key={`${token.type}-${token.value}`}
            className={styles[typeClassMap[token.type]] || ""}
          >
            {token.value}
          </Text>
        ))}
      </div>
    </div>
  );
};

export default inject(({ authStore }: TStore) => {
  const { language } = authStore;
  return {
    language,
  };
})(observer(BalanceAmount));
