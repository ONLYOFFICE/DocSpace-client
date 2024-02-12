import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { inject, observer } from "mobx-react";

import { NotificationsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
const UsefulTipsContainer = ({
  t,
  changeSubscription,
  usefulTipsSubscription,
  textProps,
  textDescriptionsProps,
}) => {
  const onChangeEmailSubscription = async (e) => {
    const checked = e.currentTarget.checked;
    try {
      await changeSubscription(NotificationsType.UsefulTips, checked);
    } catch (e) {
      toastr.error(e);
    }
  };

  return (
    <div className="notification-container">
      <div className="row">
        <Text {...textProps} className="subscription-title">
          {t("UsefulTips")}
        </Text>
        <ToggleButton
          className="useful-tips toggle-btn"
          onChange={onChangeEmailSubscription}
          isChecked={usefulTipsSubscription}
        />
      </div>
      <Text {...textDescriptionsProps}>{t("UsefulTipsDescription")}</Text>
    </div>
  );
};

export default inject(({ peopleStore }) => {
  const { targetUserStore } = peopleStore;

  const { changeSubscription, usefulTipsSubscription } = targetUserStore;

  return {
    changeSubscription,
    usefulTipsSubscription,
  };
})(observer(UsefulTipsContainer));
