import { inject, observer } from "mobx-react";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { NotificationsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";

const RoomsActivityContainer = ({
  t,
  roomsActivitySubscription,
  changeSubscription,
  textProps,
  textDescriptionsProps,
}) => {
  const onChangeEmailSubscription = async (e) => {
    const checked = e.currentTarget.checked;
    try {
      await changeSubscription(NotificationsType.RoomsActivity, checked);
    } catch (e) {
      toastr.error(e);
    }
  };

  return (
    <div className="notification-container">
      <div className="row">
        <Text {...textProps} className="subscription-title">
          {t("RoomsActivity")}
        </Text>
        <ToggleButton
          className="rooms-activity toggle-btn"
          onChange={onChangeEmailSubscription}
          isChecked={roomsActivitySubscription}
        />
      </div>
      <Text {...textDescriptionsProps}>{t("RoomsActivityDescription")}</Text>
    </div>
  );
};

export default inject(({ peopleStore }) => {
  const { targetUserStore } = peopleStore;

  const { roomsActivitySubscription, changeSubscription } = targetUserStore;

  return {
    roomsActivitySubscription,
    changeSubscription,
  };
})(observer(RoomsActivityContainer));
