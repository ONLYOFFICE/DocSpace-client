/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
