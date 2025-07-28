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

import { type FC, useId } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { DateTimePicker } from "../../components/date-time-picker";
import type { Nullable } from "../../types";

import ToggleBlock from "./ToggleBlock";
import type { LimitTimeBlockProps } from "./EditLinkPanel.types";

const LimitTimeBlock: FC<LimitTimeBlockProps> = (props) => {
  const id = useId();

  const {
    expirationDate,
    setExpirationDate,
    setIsExpired,
    isExpired,
    language,
    canChangeLifetime,
    headerText,
    bodyText,
  } = props;

  const { t } = useTranslation(["Common"]);

  const onChange = (date: Nullable<moment.Moment>) => {
    const expired = date
      ? moment(date).toDate().getTime() <= new Date().getTime()
      : false;

    setExpirationDate(date?.toDate().toISOString() ?? null);
    setIsExpired(expired);
  };

  if (!canChangeLifetime) {
    return (
      <ToggleBlock
        withToggle={false}
        bodyText={bodyText}
        headerText={headerText}
      />
    );
  }

  // const minDate = new Date(new Date().getTime());
  // minDate.setDate(new Date().getDate() - 1);
  // minDate.setTime(minDate.getTime() + 60 * 60 * 1000);
  const minDate = new Date();

  return (
    <ToggleBlock {...props} withToggle={false}>
      <DateTimePicker
        id={id}
        locale={language}
        minDate={minDate}
        hasError={isExpired}
        onChange={onChange}
        openDate={new Date()}
        initialDate={expirationDate}
        className="public-room_date-picker"
        selectDateText={t("Common:SelectDate")}
      />
    </ToggleBlock>
  );
};

export default LimitTimeBlock;
