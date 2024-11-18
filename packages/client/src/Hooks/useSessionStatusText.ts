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

import { useEffect, useMemo, useState } from "react";
import moment from "moment-timezone";

import type { TSession } from "@docspace/shared/types/ActiveSessions";
import type { TTranslation } from "@docspace/shared/types";

/* Return status text -> online, a few seconds ago, one hour ago etc. Automatically updates. */
export const useSessionStatusText = (
  session: TSession,
  locale: string,
  t: TTranslation,
) => {
  const [forceUpdate, setForceUpdate] = useState(0);

  const statusText = useMemo(() => {
    if (session.status === "online") {
      return t("Common:online");
    }

    moment.locale(locale);
    const parsedDate = moment(session.date);
    const now = moment();
    const daysDiff = now.diff(parsedDate, "days");

    if (daysDiff < 1) return parsedDate.fromNow();
    if (daysDiff === 1) return t("Common:Yesterday");
    if (daysDiff < 7) return parsedDate.fromNow();
    return parsedDate.format(locale);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, session.status, session.date, locale, forceUpdate]);

  useEffect(() => {
    if (session.status === "offline") {
      const parsedDate = moment(session.date);
      const now = moment();
      const minutesDiff = now.diff(parsedDate, "minutes");

      const intervalTime = minutesDiff < 60 ? 60000 : 3600000;

      const intervalId = setInterval(() => {
        setForceUpdate((prev) => prev + 1);
      }, intervalTime);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [session.date, session.status]);

  return statusText;
};
