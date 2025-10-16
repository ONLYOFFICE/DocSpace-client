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

import { inject, observer } from "mobx-react";
import { TFunction } from "i18next";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { NotificationsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";

import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";

type RoomsActivityContainerProps = {
  t: TFunction;
  roomsActivitySubscription?: TargetUserStore["roomsActivitySubscription"];
  changeSubscription?: TargetUserStore["changeSubscription"];
  textProps: Record<string, unknown>;
  textDescriptionsProps: Record<string, unknown>;
};

const RoomsActivityContainer = ({
  t,
  roomsActivitySubscription,
  changeSubscription,
  textProps,
  textDescriptionsProps,
}: RoomsActivityContainerProps) => {
  const onChangeEmailSubscription = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = e.currentTarget.checked;
    try {
      await changeSubscription?.(NotificationsType.RoomsActivity, checked);
    } catch (err) {
      toastr.error(err as string);
    }
  };

  return (
    <div className="notification-container">
      <div className="row">
        <Text {...textProps} className="subscription-title">
          {t("RoomUpdateNotify", {
            sectionName: t("Common:Rooms"),
          })}
        </Text>
        <ToggleButton
          className="rooms-activity toggle-btn"
          onChange={onChangeEmailSubscription}
          isChecked={roomsActivitySubscription}
          dataTestId="rooms_activity_toggle_button"
        />
      </div>
      <Text {...textDescriptionsProps}>
        {t("RoomsActivityDescription", {
          sectionName: t("Common:Rooms"),
        })}
      </Text>
    </div>
  );
};

export default inject(({ peopleStore }: TStore) => {
  const { targetUserStore } = peopleStore;

  const { roomsActivitySubscription, changeSubscription } = targetUserStore!;

  return {
    roomsActivitySubscription,
    changeSubscription,
  };
})(observer(RoomsActivityContainer));
