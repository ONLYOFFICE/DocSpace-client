// (c) Copyright Ascensio System SIA 2009-2026
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

import { TTranslation } from "@docspace/shared/types";
import { truncateNumberToFraction } from "@docspace/shared/utils/common";

const truncateNumberToFractionNumeric = (
  value: number,
  fractionDigits: number,
) => {
  if (!Number.isFinite(value)) return value;

  const factor = 10 ** fractionDigits;
  return Math.trunc(value * factor) / factor;
};

export const formattedBalanceTokens = (
  language: string,
  amount: number,
  currency: string,
  maximumFractionDigits: number = 3,
) => {
  const truncatedStr = truncateNumberToFraction(amount, maximumFractionDigits);
  const truncated = Number(truncatedStr);

  const formatter = new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.formatToParts(truncated);
};

export const getEffectiveFraction = (
  value: number,
  isScientific: boolean = false,
  fractionDigits: number = 0,
): number => {
  const str = value.toString();

  if (isScientific) {
    const [mantissa, expPart] = str.split("e-");
    const exponent = Number(expPart);

    const mantissaFraction = mantissa.split(".")[1]?.length ?? 0;

    const actualFractionDigits = exponent + mantissaFraction;

    if (fractionDigits === 0) return actualFractionDigits;

    return Math.min(fractionDigits, actualFractionDigits);
  }

  const actualFractionLength = str.split(".")[1]?.length ?? 0;

  if (fractionDigits === 0) return actualFractionLength;

  return Math.min(fractionDigits, actualFractionLength);
};

export const formatterCurrencyWithoutTranction = (
  language: string,
  amount: number,
  currency: string,
) => {
  const maximumFractionDigits = 8;

  let effectiveDigits = maximumFractionDigits;

  const str = amount.toString();
  const isScientific = /e/i.test(str);

  const isWholeNumber = isScientific
    ? false
    : Number.isFinite(amount) && Math.abs(amount - Math.trunc(amount)) < 1e-9;

  if (!isWholeNumber) {
    effectiveDigits = getEffectiveFraction(amount, isScientific);
  }

  const effectiveFractionDigits = isWholeNumber ? 2 : effectiveDigits;

  const truncated = isScientific
    ? truncateNumberToFractionNumeric(amount, effectiveFractionDigits)
    : amount;

  const formatter = new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: effectiveFractionDigits,
    maximumFractionDigits: effectiveFractionDigits,
  });

  return formatter.format(truncated);
};

export const accountingLedgersFormat = (
  language: string,
  amount: number,
  isCredit: boolean,
  currency: string,
) => {
  const value = formatterCurrencyWithoutTranction(language, amount, currency);

  return `${isCredit ? "+" : "-"}${value}`;
};

export const getServiceQuantity = (
  t: TTranslation,
  quantity: number,
  serviceUnit?: string,
) => {
  if (!serviceUnit) return "—";
  return t("UnitCount", { unit: serviceUnit, count: quantity });
};
