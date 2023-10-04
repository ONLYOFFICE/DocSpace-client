import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getConvertedQuota } from "@docspace/common/utils";
import Text from "@docspace/components/text";
import ComboBox from "@docspace/components/combobox";
import toastr from "@docspace/components/toast/toastr";

import { StyledBody, StyledText } from "./StyledComponent";

const getSelectedOption = (options, action) => {
  const option = options.find((elem) => elem.action === action);

  if (option.key === "no-quota") {
    option.label = "Unlimited";
    return option;
  }

  return option;
};

const SpaceQuota = (props) => {
  const {
    hideColumns,
    isCustomQuota = false,
    isDisabledQuotaChange,
    isOnlyUsedSpace = false,
    type,
    item,
    className,
    changeQuota,
    onSuccess,
    setUnlimitedQuota,
  } = props;

  const [action, setAction] = useState(
    item?.quotaLimit === -1 ? "no-quota" : "current-size"
  );

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["Common"]);

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

  if (isCustomQuota)
    options?.splice(1, 0, {
      id: "info-account-quota_no-quota",
      key: "default-quota",
      label: "Set to default",
      action: "default",
    });

  const successCallback = (users) => {
    onSuccess && onSuccess(users);
    setIsLoading(false);
  };

  const abortCallback = () => {
    setIsLoading(false);
  };

  const onChange = async ({ action }) => {
    console.log("action", action, "type", type, "item", item);
    if (action === "change") {
      setIsLoading(true);

      changeQuota([item], successCallback, abortCallback);

      setAction("current-size");
      return;
    }

    if (action === "no-quota") {
      try {
        await setUnlimitedQuota(-1, [item.id]);
        toastr.success(t("Common:StorageQuotaDisabled"));
      } catch (e) {
        toastr.error(e);
      }

      setAction("no-quota");
      return;
    }
  };

  const selectedOption = getSelectedOption(options, action);

  if (isOnlyUsedSpace) {
    return <StyledText fontWeight={600}>{usedQuota}</StyledText>;
  }

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

export default inject(
  ({ peopleStore, filesActionsStore, filesStore }, { type }) => {
    const { changeUserQuota, usersStore } = peopleStore;
    const { updateUserQuota } = usersStore;
    const { changeRoomQuota } = filesActionsStore;
    const { updateRoomQuota } = filesStore;

    const changeQuota = type === "user" ? changeUserQuota : changeRoomQuota;
    const setUnlimitedQuota =
      type === "user" ? updateUserQuota : updateRoomQuota;

    return {
      changeQuota,
      setUnlimitedQuota,
    };
  }
)(observer(SpaceQuota));
