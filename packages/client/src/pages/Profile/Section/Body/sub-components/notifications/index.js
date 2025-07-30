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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { NotificationsType } from "@docspace/shared/enums";
import { getNotificationSubscription } from "@docspace/shared/api/settings";
import NotificationsLoader from "@docspace/shared/skeletons/notifications";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { toastr } from "@docspace/shared/components/toast";

import UsefulTipsContainer from "./sub-components/UsefulTipsContainer";
import RoomsActionsContainer from "./sub-components/RoomsActionsContainer";
import DailyFeedContainer from "./sub-components/DailyFeedContainer";
import RoomsActivityContainer from "./sub-components/RoomsActivityContainer";
import { StyledSectionBodyContent, StyledTextContent } from "./StyledComponent";

const { Badges, RoomsActivity, DailyFeed, UsefulTips } = NotificationsType;

const Notifications = ({ setSubscriptions, isFirstSubscriptionsLoad }) => {
  const { t, ready } = useTranslation(["Notifications", "Common"]);

  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    const requests = [
      getNotificationSubscription(Badges),
      getNotificationSubscription(RoomsActivity),
      getNotificationSubscription(DailyFeed),
      getNotificationSubscription(UsefulTips),
    ];

    try {
      const [badges, roomsActivity, dailyFeed, tips] =
        await Promise.all(requests);

      setSubscriptions(
        badges.isEnabled,
        roomsActivity.isEnabled,
        dailyFeed.isEnabled,
        tips.isEnabled,
      );

      setIsLoading(false);
    } catch (e) {
      toastr.error(e);
    }
  };

  useEffect(() => {
    if (isFirstSubscriptionsLoad) {
      setIsLoading(true);
      getData();
    }
  }, []);

  const isLoadingContent = isLoading || !ready;

  // if (!isLoading && !isContentLoaded) return <></>;

  const textProps = {
    fontSize: "13px",
    fontWeight: "600",
    noSelect: true,
  };
  const textDescriptionsProps = {
    fontSize: "13px",
    fontWeight: "400",
    className: "notification-container_description",
  };

  const badgesContent = (
    <>
      <StyledTextContent>
        {isLoadingContent ? (
          <RectangleSkeleton height="22px" width="57px" />
        ) : (
          <Text fontSize="14px" fontWeight={600}>
            {t("Badges")}
          </Text>
        )}
      </StyledTextContent>
      <div className="badges-container">
        {isLoadingContent ? (
          <NotificationsLoader />
        ) : (
          <RoomsActionsContainer
            t={t}
            textProps={textProps}
            textDescriptionsProps={textDescriptionsProps}
          />
        )}
      </div>
    </>
  );

  const emailContent = (
    <>
      <StyledTextContent>
        {isLoadingContent ? (
          <RectangleSkeleton height="22px" width="57px" />
        ) : (
          <Text fontSize="14px" fontWeight={600} className="email-title">
            {t("Common:Email")}
          </Text>
        )}
      </StyledTextContent>
      {isLoadingContent ? (
        <NotificationsLoader count={3} />
      ) : (
        <div className="badges-container">
          <RoomsActivityContainer
            t={t}
            textProps={textProps}
            textDescriptionsProps={textDescriptionsProps}
          />
          <DailyFeedContainer
            t={t}
            textProps={textProps}
            textDescriptionsProps={textDescriptionsProps}
          />
          <UsefulTipsContainer
            t={t}
            textProps={textProps}
            textDescriptionsProps={textDescriptionsProps}
          />
        </div>
      )}
    </>
  );

  return (
    <StyledSectionBodyContent>
      {badgesContent}
      {emailContent}
    </StyledSectionBodyContent>
  );
};

export default inject(({ peopleStore }) => {
  const { targetUserStore } = peopleStore;

  const { setSubscriptions, isFirstSubscriptionsLoad } = targetUserStore;

  return {
    setSubscriptions,
    isFirstSubscriptionsLoad,
  };
})(observer(Notifications));
