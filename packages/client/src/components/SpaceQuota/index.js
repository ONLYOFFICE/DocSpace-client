import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getConvertedQuota } from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { toastr } from "@docspace/shared/components/toast";

import { StyledBody, StyledText } from "./StyledComponent";
import { connectedCloudsTypeTitleTranslation } from "SRC_DIR/helpers/filesUtils";

const getOptions = (t, item, spaceLimited) => {
  const items = [
    {
      id: "info-account-quota_edit",
      key: "change-quota",
      label: t("Common:ChangeQuota"),
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
      label:
        item?.quotaLimit === -1
          ? t("Common:Unlimited")
          : t("Common:DisableQuota"),
      action: "no-quota",
    },
  ];

  if (item.isCustomQuota)
    items?.splice(1, 0, {
      id: "info-account-quota_no-quota",
      key: "default-quota",
      label: t("Common:SetToDefault"),
      action: "default",
    });

  return items;
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
    onAbort,
    updateQuota,
    resetQuota,
    defaultSize,

    needResetSelection,
    setSelected,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["Common"]);

  const usedQuota = getConvertedQuota(t, item?.usedSpace);
  const spaceLimited = getConvertedQuota(t, item?.quotaLimit);
  const defaultQuotaSize = getConvertedQuota(t, defaultSize);

  const options = getOptions(t, item, spaceLimited);

  const successCallback = (users) => {
    onSuccess && onSuccess(users);
    setIsLoading(false);

    needResetSelection && setSelected("close");
  };

  const abortCallback = () => {
    onAbort && onAbort();
    setIsLoading(false);

    needResetSelection && setSelected("close");
  };

  const onChange = async ({ action }) => {
    setIsLoading(true);

    if (action === "change") {
      changeQuota([item], successCallback, abortCallback);

      return;
    }

    if (action === "no-quota") {
      try {
        const items = await updateQuota(-1, [item.id]);

        options.map((item) => {
          if (item.key === "no-quota") item.label = t("Common:Unlimited");
        });

        successCallback(items);
        toastr.success(t("Common:StorageQuotaDisabled"));
      } catch (e) {
        abortCallback();
        toastr.error(e);
      }

      return;
    }

    try {
      const items = await resetQuota([item.id]);

      options.map((item) => {
        if (item.key === "default-quota") item.label = defaultQuotaSize;
      });

      successCallback(items);
      toastr.success(t("Common:StorageQuotaReset"));
    } catch (e) {
      abortCallback();
      toastr.error(e);
    }
  };

  const action = item?.quotaLimit === -1 ? "no-quota" : "current-size";

  const selectedOption = options.find((elem) => elem.action === action);

  if (item.providerType) {
    return (
      <Text fontWeight={600}>
        {connectedCloudsTypeTitleTranslation(item.providerKey, t)}{" "}
      </Text>
    );
  }

  if (withoutLimitQuota || item?.quotaLimit === undefined) {
    return (
      <StyledText fontWeight={600} withoutLimitQuota>
        {usedQuota}
      </StyledText>
    );
  }

  if (isReadOnly) {
    return (
      <StyledText fontWeight={600} isReadOnly>
        {usedQuota} / {spaceLimited}
      </StyledText>
    );
  }

  return (
    <StyledBody hideColumns={hideColumns} className={className}>
      <Text fontWeight={600}>{usedQuota} / </Text>

      <ComboBox
        className="combobobox-space-quota"
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
  (
    { peopleStore, filesActionsStore, filesStore, currentQuotaStore },
    { type },
  ) => {
    const { changeUserQuota, usersStore, selectionStore } = peopleStore;
    const { setCustomUserQuota, resetUserQuota, needResetUserSelection } =
      usersStore;
    const { changeRoomQuota } = filesActionsStore;
    const {
      setCustomRoomQuota,
      setSelected: setRoomsSelected,
      resetRoomQuota,
      needResetFilesSelection,
    } = filesStore;

    const {
      isDefaultUsersQuotaSet,
      isDefaultRoomsQuotaSet,
      defaultUsersQuota,
      defaultRoomsQuota,
    } = currentQuotaStore;

    const { setSelected: setUsersSelected } = selectionStore;

    const changeQuota = type === "user" ? changeUserQuota : changeRoomQuota;
    const updateQuota =
      type === "user" ? setCustomUserQuota : setCustomRoomQuota;

    const resetQuota = type === "user" ? resetUserQuota : resetRoomQuota;

    const withoutLimitQuota =
      type === "user" ? !isDefaultUsersQuotaSet : !isDefaultRoomsQuotaSet;

    const defaultSize = type === "user" ? defaultUsersQuota : defaultRoomsQuota;

    const needResetSelection =
      type === "user" ? needResetUserSelection : needResetFilesSelection;

    const setSelected = type === "user" ? setUsersSelected : setRoomsSelected;

    return {
      setSelected,
      withoutLimitQuota,
      changeQuota,
      updateQuota,
      resetQuota,
      defaultSize,
      needResetSelection,
    };
  },
)(observer(SpaceQuota));
