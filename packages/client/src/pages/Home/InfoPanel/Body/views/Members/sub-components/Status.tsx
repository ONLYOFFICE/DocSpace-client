// (c) Copyright Ascensio System SIA 2009-2024
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

import moment from "moment";

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { Text } from "@docspace/shared/components/text";
import { TStatusInRoom } from "@docspace/shared/utils/socket";
import { useTranslation } from "react-i18next";

interface StatusProps {
  statusInRoom?: TStatusInRoom;
}

const getLastSeenStatus = (date: string, locale: string) => {
  if (!date) return "offline";
  const dateObj = new Date(date).toISOString();

  const momentDate = moment(dateObj).locale(locale);
  let dateFormat = "DD MMMM";

  if (momentDate.year() !== moment().year()) {
    dateFormat = "DD.MM.YYYY";
  }

  const formattedDate = momentDate.isSame(new Date(), "day")
    ? "Today"
    : momentDate.format(dateFormat);

  const formattedTime = momentDate.format("LT");

  // return t("LastSeenAt", { date: formattedDate, time: formattedTime });
  return `Last seen ${formattedDate} at ${formattedTime}`;
};

export const Status = (props: StatusProps) => {
  const { i18n } = useTranslation();

  const { statusInRoom } = props;

  if (!statusInRoom) {
    return (
      <RectangleSkeleton width="70" height="12" className="status-loader" />
    );
  }

  const statusText =
    statusInRoom.status === "online"
      ? "online"
      : getLastSeenStatus(statusInRoom.date, i18n.language);

  return (
    <div className="status-wrapper">
      {statusInRoom.status === "online" && <div className="status-indicator" />}
      <Text className="status-text">{statusText}</Text>
    </div>
  );
};
