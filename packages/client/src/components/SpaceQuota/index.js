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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { getConvertedQuota } from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { toastr } from "@docspace/shared/components/toast";
import api from "@docspace/shared/api";

import { connectedCloudsTypeTitleTranslation } from "SRC_DIR/helpers/filesUtils";
import { changeUserQuota } from "SRC_DIR/helpers/contacts";
import { StyledBody, StyledText } from "./StyledComponent";

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
    inRoom,
    dataTestId,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["Common"]);

  const theme = useTheme();

  const usedQuota = getConvertedQuota(t, item?.usedSpace);
  const spaceLimited = getConvertedQuota(t, item?.quotaLimit);
  const defaultQuotaSize = getConvertedQuota(t, defaultSize);

  const options = getOptions(t, item, spaceLimited);

  const sideInfoColor = theme.peopleTableRow.sideInfoColor;

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
        const items = await updateQuota([item.id], -1, inRoom());

        options.forEach((o) => {
          if (o.key === "no-quota") o.label = t("Common:Unlimited");
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
      const items = await resetQuota([item.id], inRoom());

      options.forEach((o) => {
        if (o.key === "default-quota") o.label = defaultQuotaSize;
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
  const comboboxOptions = options.filter(
    (elem) => elem.action !== "current-size",
  );

  if (item.providerType) {
    return (
      <Text fontWeight={600}>
        {connectedCloudsTypeTitleTranslation(item.providerKey, t)}{" "}
      </Text>
    );
  }

  if (withoutLimitQuota || item?.quotaLimit === undefined) {
    return (
      <StyledText fontWeight={600} $withoutLimitQuota color={sideInfoColor}>
        {usedQuota}
      </StyledText>
    );
  }

  if (isReadOnly) {
    return (
      <StyledText fontWeight={600} $isReadOnly color={sideInfoColor}>
        {usedQuota} / {spaceLimited}
      </StyledText>
    );
  }

  return (
    <StyledBody
      hideColumns={hideColumns}
      className={className}
      isLoading={isLoading}
      data-testid={dataTestId}
    >
      <Text fontWeight={600}>{usedQuota} / </Text>

      <ComboBox
        className="combobobox-space-quota"
        selectedOption={selectedOption}
        options={comboboxOptions}
        onSelect={onChange}
        scaled={false}
        size="content"
        modernView
        isLoading={isLoading}
        manualWidth="auto"
        directionY="both"
      />
    </StyledBody>
  );
};

export default inject(
  (
    {
      peopleStore,
      filesActionsStore,
      filesStore,
      currentQuotaStore,
      infoPanelStore,
    },
    { type },
  ) => {
    const { usersStore } = peopleStore;
    const { needResetUserSelection, setSelected: setUsersSelected } =
      usersStore;
    const { changeRoomQuota, changeAIAgentsQuota } = filesActionsStore;
    const {
      setCustomRoomQuota,
      setCustomAIAgentQuota,
      resetRoomQuota,
      resetAIAgentQuota,
      setSelected: setRoomsSelected,
      needResetFilesSelection,
    } = filesStore;

    const {
      isDefaultUsersQuotaSet,
      isDefaultRoomsQuotaSet,
      isDefaultAIAgentsQuotaSet,
      defaultUsersQuota,
      defaultRoomsQuota,
      defaultAIAgentsQuota,
    } = currentQuotaStore;

    const { inRoom, isVisible: infoPanelVisible } = infoPanelStore;

    const changeQuota =
      type === "user"
        ? changeUserQuota
        : type === "agent"
          ? changeAIAgentsQuota
          : changeRoomQuota;

    const updateQuota =
      type === "user"
        ? api.people.setCustomUserQuota
        : type === "agent"
          ? setCustomAIAgentQuota
          : setCustomRoomQuota;

    const resetQuota =
      type === "user"
        ? api.people.resetUserQuota
        : type === "agent"
          ? resetAIAgentQuota
          : resetRoomQuota;

    const withoutLimitQuota =
      type === "user"
        ? !isDefaultUsersQuotaSet
        : type === "agent"
          ? !isDefaultAIAgentsQuotaSet
          : !isDefaultRoomsQuotaSet;

    const defaultSize =
      type === "user"
        ? defaultUsersQuota
        : type === "agent"
          ? defaultAIAgentsQuota
          : defaultRoomsQuota;

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
      needResetSelection: !infoPanelVisible || needResetSelection,
      inRoom,
    };
  },
)(observer(SpaceQuota));
