// (c) Copyright Ascensio System SIA 2010-2024
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

import moment from "moment-timezone";

import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@docspace/shared/utils";

export const getRelativeDateDay = (t, date) => {
  moment.locale(getCookie(LANGUAGE));

  const given = moment(date).tz(window.timezone);

  const now = moment();
  const weekAgo = moment().subtract(1, "week");
  const halfYearAgo = moment().subtract(6, "month");

  if (given.isAfter(weekAgo)) {
    if (now.weekday() === given.weekday()) return t("Common:Today");
    if (now.weekday() - 1 === given.weekday()) return t("Common:Yesterday");

    const weekday = moment.weekdays(given.weekday());
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }

  if (given.isBetween(halfYearAgo, weekAgo)) {
    const shortDate = given.format("MMMM D");
    return shortDate.charAt(0).toUpperCase() + shortDate.slice(1);
  }

  const longDate = given.format("MMMM D, YYYY");
  return longDate.charAt(0).toUpperCase() + longDate.slice(1);
};

export const getDateTime = (date) => {
  moment.locale(getCookie(LANGUAGE));

  const given = moment(date);
  return given.format("LT");
};

// from { response: { feeds: groupedFeeds: [{ json: "" }], json: "" }}
//   to [{ day: "", feeds: [ groupedFeeds: [{ json: {} }], json: {} ]}]

export const parseHistory = (t, fetchedHistory) => {
  let feeds = fetchedHistory.feeds;
  let parsedFeeds = [];

  for (let i = 0; i < feeds.length; i++) {
    const feedsJSON = JSON.parse(feeds[i].json);
    const feedDay = getRelativeDateDay(t, feeds[i].modifiedDate);

    let newGroupedFeeds = [];
    if (feeds[i].groupedFeeds) {
      let groupFeeds = feeds[i].groupedFeeds;
      for (let j = 0; j < groupFeeds.length; j++)
        newGroupedFeeds.push(
          !!groupFeeds[j].target
            ? groupFeeds[j].target
            : JSON.parse(groupFeeds[j].json)
        );
    }

    if (parsedFeeds.length && parsedFeeds.at(-1).day === feedDay)
      parsedFeeds.at(-1).feeds.push({
        ...feeds[i],
        json: feedsJSON,
        groupedFeeds: newGroupedFeeds,
      });
    else
      parsedFeeds.push({
        day: feedDay,
        feeds: [
          {
            ...feeds[i],
            json: feedsJSON,
            groupedFeeds: newGroupedFeeds,
          },
        ],
      });
  }

  return parsedFeeds;
};
