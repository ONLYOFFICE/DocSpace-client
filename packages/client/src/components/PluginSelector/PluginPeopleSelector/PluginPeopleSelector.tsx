// (c) Copyright Ascensio System SIA 2009-2026
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

import { useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import { TPeopleSelector } from "@onlyoffice/docspace-plugin-sdk";

import {
  HeaderProps,
  THeaderBackButton,
  TSelectorCancelButton,
  TSelectorHeader,
} from "@docspace/ui-kit/components/selector";

import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { PeopleSelectorProps } from "@docspace/ui-kit/selectors/People/PeopleSelector.types";

import PluginStore from "SRC_DIR/store/PluginStore";

type Props = {
  pluginSelectorProps: TPeopleSelector;
  dispatchMessage: PluginStore["dispatchMessage"];
  pluginName: string;
};

const PluginPeopleSelector = ({
  pluginSelectorProps: selectorProps,
  dispatchMessage,
  pluginName,
}: Props) => {
  const { t } = useTranslation(["Common"]);

  const {
    className,
    submitButtonLabel,
    alwaysShowFooter,
    excludeItems,
    currentUserId,
    disableDisabledUsers,
    disableInvitedUsers,
    disabledSubmitButton,

    emptyScreenDescription,
    emptyScreenHeader,

    cancelButtonLabel,
    withCancelButton,

    withGroups,
    isGroupsOnly,

    withGuests,
    isGuestsOnly,

    isMultiSelect,
    onlyRoomMembers,
    roomId,
    targetEntityType,
    withHeader,
  } = selectorProps;

  const onLoadEvent = useEffectEvent(async () => {
    if (!selectorProps.onLoad) return;
    const message = await selectorProps.onLoad();
    dispatchMessage({ message, pluginName });
  });

  const onSubmit: PeopleSelectorProps["onSubmit"] = async (
    selectedItems,
    access,
    fileName,
    isFooterCheckboxChecked,
  ) => {
    if (!selectorProps.onSubmit) return;
    const selectedIds = selectedItems
      .filter((item) => item.id)
      .map((item) => item.id!);

    const message = await selectorProps.onSubmit({
      selectedIds,
      fileName,
      isFooterCheckboxChecked,
    });
    dispatchMessage({ message, pluginName });
  };

  useEffect(() => {
    onLoadEvent();
  }, []);

  const onCancel = async () => {
    if (!selectorProps.onCancel) return;
    const message = await selectorProps.onCancel();
    dispatchMessage({ message, pluginName });
  };

  const onBackClick: THeaderBackButton["onBackClick"] = async () => {
    if (!selectorProps.headerProps?.onBackClick) return;
    const message = await selectorProps.headerProps.onBackClick();
    dispatchMessage({ message, pluginName });
  };

  const headerBackButtonProps: THeaderBackButton = selectorProps.headerProps
    ?.withBackButton
    ? {
        withoutBackButton: false,
        onBackClick,
        withoutBorder: false,
      }
    : {};

  const onCloseClick: HeaderProps["onCloseClick"] = async () => {
    if (!selectorProps.headerProps?.onCloseClick) return;
    const message = await selectorProps.headerProps.onCloseClick();
    dispatchMessage({ message, pluginName });
  };

  const onClose = async () => {
    if (!selectorProps.onClose) return;
    const message = await selectorProps.onClose();
    dispatchMessage({ message, pluginName });
  };

  const headerProps: TSelectorHeader = withHeader
    ? {
        withHeader: true,
        headerProps: {
          headerLabel: selectorProps.headerProps?.label ?? "",
          isCloseable: selectorProps.headerProps?.isCloseable,
          onCloseClick,
          ...headerBackButtonProps,
        },
      }
    : {};

  const cancelButtonProps: TSelectorCancelButton = withCancelButton
    ? {
        withCancelButton: true,
        cancelButtonLabel: cancelButtonLabel ?? t("Common:CancelButton"),
        onCancel,
      }
    : {};

  const groupsProps = withGroups
    ? {
        withGroups: true as const,
        isGroupsOnly,
      }
    : {};

  const guestsProps = withGuests
    ? {
        withGuests: true,
        isGuestsOnly,
      }
    : {};

  return (
    <PeopleSelector
      className={className}
      onSubmit={onSubmit}
      submitButtonLabel={submitButtonLabel}
      disableSubmitButton={!!disabledSubmitButton}
      alwaysShowFooter={alwaysShowFooter}
      excludeItems={excludeItems}
      currentUserId={currentUserId}
      disableDisabledUsers={disableDisabledUsers}
      disableInvitedUsers={disableInvitedUsers}
      isMultiSelect={isMultiSelect}
      onlyRoomMembers={onlyRoomMembers}
      roomId={roomId}
      targetEntityType={targetEntityType}
      emptyScreenDescription={emptyScreenDescription}
      emptyScreenHeader={emptyScreenHeader}
      useAside
      onClose={onClose}
      {...headerProps}
      {...cancelButtonProps}
      {...groupsProps}
      {...guestsProps}
    />
  );
};

export default PluginPeopleSelector;
