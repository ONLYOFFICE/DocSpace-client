import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getConvertedQuota } from "@docspace/common/utils";
import Text from "@docspace/components/text";
import ComboBox from "@docspace/components/combobox";
import { StyledBody, StyledText } from "./StyledComponent";

const SpaceQuota = (props) => {
  const {
    hideColumns,
    isCustomQuota = false,
    isDisabledQuotaChange,
    type,
    item,
    changeUserQuota,
    changeRoomQuota,
    updateUserQuota,
    className,
  } = props;

  const [action, setAction] = useState(
    item?.quotaLimit === -1 ? "no-quota" : "current-size"
  );

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["Common"]);

  const successCallback = () => {
    setIsLoading(false);
  };

  const abortCallback = () => {
    setIsLoading(false);
  };

  const onChange = ({ action }) => {
    console.log("action", action, "type", type, "item", item);
    if (action === "change") {
      setIsLoading(true);

      if (type === "user") {
        changeUserQuota([item], successCallback, abortCallback);
      } else {
        changeRoomQuota([item], successCallback, abortCallback);
      }

      setAction("current-size");
      return;
    }

    if (action === "no-quota") {
      if (type === "user") updateUserQuota(-1, [item.id]);

      setAction("no-quota");
      return;
    }
  };

  if (isCustomQuota)
    options?.splice(1, 0, {
      id: "info-account-quota_no-quota",
      key: "default-quota",
      label: "Set to default",
      action: "default",
    });

  const usedQuota = getConvertedQuota(t, item?.usedSpace);
  const spaceLimited = getConvertedQuota(t, item?.quotaLimit);

  const options = [
    {
      id: "info-account-quota_edit",
      key: "change-quota",
      label: "Change quota",
      action: "change",
    },
    {
      id: "info-account-quota_current-size",
      key: "current-size",
      label: spaceLimited,
      action: "current-size",
    },
    {
      id: "info-account-quota_no-quota",
      key: "no-quota",
      label: "Disable quota",
      action: "no-quota",
    },
  ];
  const displayFunction = () => {
    const option = options.find((elem) => elem.action === action);

    if (option.key === "no-quota") {
      option.label = "Unlimited";
      return option;
    }

    return option;
  };

  const selectedOption = displayFunction();

  if (isDisabledQuotaChange) {
    return (
      <StyledText fontWeight={600}>
        {usedQuota} / {spaceLimited}
      </StyledText>
    );
  }

  return (
    <StyledBody
      hideColumns={hideColumns}
      isDisabledQuotaChange={isDisabledQuotaChange}
    >
      <Text fontWeight={600}>{usedQuota} / </Text>

      <ComboBox
        className={className}
        selectedOption={selectedOption}
        options={options}
        onSelect={onChange}
        scaled={false}
        size="content"
        modernView
        isLoading={isLoading}
        manualWidth="fit-content"
      />
    </StyledBody>
  );
};

export default inject(({ dialogsStore, peopleStore, filesActionsStore }) => {
  const { setChangeQuotaDialogVisible, changeQuotaDialogVisible } =
    dialogsStore;
  const { changeUserQuota, usersStore } = peopleStore;
  const { updateUserQuota } = usersStore;
  const { changeRoomQuota } = filesActionsStore;
  return {
    setChangeQuotaDialogVisible,
    changeQuotaDialogVisible,
    changeUserQuota,
    updateUserQuota,
    changeRoomQuota,
  };
})(observer(SpaceQuota));
