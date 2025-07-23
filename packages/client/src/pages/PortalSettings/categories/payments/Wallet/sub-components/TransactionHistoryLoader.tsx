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
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import classNames from "classnames";

import styles from "../styles/TransactionHistory.module.scss";
import TableLoader from "./TableLoader";

type TransactionHistoryLoaderProps = {
  isMobile?: boolean;
  isTablet?: boolean;
};

const TransactionHistoryLoader: React.FC<TransactionHistoryLoaderProps> = ({
  isMobile,
  isTablet,
}) => {
  const loaderClassName = classNames(styles.transactionHistoryLoader, {
    [styles.isTablet]: isTablet,
  });

  return (
    <div className={loaderClassName}>
      <div className={styles.descriptionRow}>
        <RectangleSkeleton height="40px" borderRadius="3px" width="100%" />
        <RectangleSkeleton height="20px" borderRadius="3px" width="73px" />
      </div>

      <RectangleSkeleton
        className={styles.paymentLoader}
        height="72px"
        borderRadius="3px"
        width="100%"
      />

      <div className={styles.balanceRow}>
        <RectangleSkeleton
          className={styles.rectangleSkeleton}
          height="22px"
          borderRadius="3px"
          width="64px"
        />
        <RectangleSkeleton
          className={styles.rectangleSkeleton}
          height="60px"
          borderRadius="3px"
          width="152px"
        />
        <RectangleSkeleton
          className={styles.rectangleSkeleton}
          height="32px"
          borderRadius="3px"
          width={isMobile || isTablet ? "100%" : "152px"}
        />
      </div>

      {!isMobile && !isTablet ? (
        <>
          <RectangleSkeleton
            className={styles.flexibleLoader}
            height="22px"
            borderRadius="3px"
            width="156px"
          />
          <div className={classNames(styles.loaderRow, styles.headerRow)}>
            <RectangleSkeleton
              className={styles.flexibleLoader}
              height="32px"
              borderRadius="3px"
            />
            <RectangleSkeleton
              className={styles.flexibleLoader}
              height="32px"
              borderRadius="3px"
            />
            <RectangleSkeleton
              className={styles.flexibleLoader}
              height="32px"
              borderRadius="3px"
            />
          </div>

          <div className={classNames(styles.loaderRow, styles.dataRow)}>
            <RectangleSkeleton
              className={styles.fixedLoader}
              height="16px"
              borderRadius="3px"
            />
            <RectangleSkeleton
              className={styles.fixedLoader}
              height="16px"
              borderRadius="3px"
            />
            <RectangleSkeleton
              className={styles.fixedLoader}
              height="16px"
              borderRadius="3px"
            />
            <RectangleSkeleton
              className={classNames(styles.fixedLoader, styles.lastChild)}
              height="16px"
              borderRadius="3px"
            />
          </div>

          <TableLoader isMobile={isMobile} isTablet={isTablet} />
        </>
      ) : (
        <TableLoader isMobile={isMobile} isTablet={isTablet} />
      )}
    </div>
  );
};

export default TransactionHistoryLoader;
