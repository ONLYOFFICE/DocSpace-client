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
    isReadOnly,
    withoutLimitQuota,
    item,
    className,
    changeQuota,
    onSuccess,
    disableQuota,
    resetQuota,
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

  if (item.isCustomQuota)
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
    if (action === "change") {
      setIsLoading(true);

      changeQuota([item], successCallback, abortCallback);

      setAction("current-size");

      return;
    }

    if (action === "no-quota") {
      try {
        await disableQuota(-1, [item.id]);
        toastr.success(t("Common:StorageQuotaDisabled"));
      } catch (e) {
        toastr.error(e);
      }

      setAction("no-quota");

      return;
    }

    try {
      await resetQuota([item.id]);
      toastr.success(t("Common:StorageQuotaReset"));
    } catch (e) {
      toastr.error(e);
    }
  };

  const selectedOption = getSelectedOption(options, action);

  if (withoutLimitQuota) {
    return <StyledText fontWeight={600}>{usedQuota}</StyledText>;
  }

  if (isReadOnly) {
    return (
      <StyledText fontWeight={600}>
        {usedQuota} / {spaceLimited}
      </StyledText>
    );
  }

  return (
    <StyledBody hideColumns={hideColumns}>
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
  ({ peopleStore, filesActionsStore, filesStore, auth }, { type }) => {
    const { changeUserQuota, usersStore } = peopleStore;
    const { updateUserQuota, resetUserQuota } = usersStore;
    const { changeRoomQuota } = filesActionsStore;
    const { updateRoomQuota } = filesStore;
    const { currentQuotaStore } = auth;
    const { isDefaultUsersQuotaSet, isDefaultRoomsQuotaSet } =
      currentQuotaStore;

    const changeQuota = type === "user" ? changeUserQuota : changeRoomQuota;
    const disableQuota = type === "user" ? updateUserQuota : updateRoomQuota;

    const resetQuota = type === "user" ? resetUserQuota : null;

    const withoutLimitQuota =
      type === "user" ? !isDefaultUsersQuotaSet : !isDefaultRoomsQuotaSet;

    return {
      withoutLimitQuota,
      changeQuota,
      disableQuota,
      resetQuota,
    };
  }
)(observer(SpaceQuota));
