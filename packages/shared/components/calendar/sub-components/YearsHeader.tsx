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
import classNames from "classnames";
import { HeaderButtons } from "./HeaderButtons";
import { YearsHeaderProps } from "../Calendar.types";
import styles from "../Calendar.module.scss";

export const YearsHeader = ({
  observedDate,
  setObservedDate,
  minDate,
  maxDate,
  isMobile,
}: YearsHeaderProps) => {
  const selectedYear = observedDate.year();
  const firstYear = selectedYear;

  const onLeftClick = () =>
    setObservedDate((prevObservedDate) =>
      prevObservedDate.clone().subtract(10, "year"),
    );

  const onRightClick = () =>
    setObservedDate((prevObservedDate) =>
      prevObservedDate.clone().add(10, "year"),
    );

  const isLeftDisabled =
    moment(`${firstYear - 1}`)
      .endOf("year")
      .endOf("month") < minDate;
  const isRightDisabled = moment(`${firstYear + 10}`) > maxDate;

  return (
    <div className={styles.headerContainer}>
      <h2
        className={classNames(styles.title, "years-header", {
          [styles.disabled]: true,
        })}
      >
        {moment(firstYear, "YYYY").format("YYYY")}-
        {moment(firstYear + 9, "YYYY").format("YYYY")}
        <span className={styles.headerActionIcon} />
      </h2>
      <HeaderButtons
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        isLeftDisabled={isLeftDisabled}
        isRightDisabled={isRightDisabled}
        isMobile={isMobile}
      />
    </div>
  );
};
