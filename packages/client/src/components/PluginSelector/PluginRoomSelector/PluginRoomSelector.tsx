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
import { TRoomSelector } from "@onlyoffice/docspace-plugin-sdk";

import RoomSelector from "@docspace/ui-kit/selectors/Room";
import { RoomSelectorProps } from "@docspace/ui-kit/selectors/Room/RoomSelector.types";
import {
  HeaderProps,
  THeaderBackButton,
  TSelectorCancelButton,
  TSelectorHeader,
} from "@docspace/ui-kit/components/selector";
import { RoomsType } from "@docspace/shared/enums";

import PluginStore from "SRC_DIR/store/PluginStore";

import { convertPluginRoomType } from "./utils";

type Props = {
  pluginSelectorProps: TRoomSelector;
  dispatchMessage: PluginStore["dispatchMessage"];
  pluginName: string;
};

const PluginRoomSelector = ({
  pluginSelectorProps: selectorProps,
  dispatchMessage,
  pluginName,
}: Props) => {
  const { t } = useTranslation(["Common"]);

  const {
    id,
    className,
    submitButtonLabel,
    excludeItems,

    emptyScreenDescription,
    emptyScreenHeader,

    cancelButtonLabel,
    withCancelButton,

    isMultiSelect,
    roomType,
    searchArea,

    createDefineRoomLabel,
    createDefineRoomType,

    withCreate,
    withSearch,

    withHeader,
  } = selectorProps;

  const onLoadEvent = useEffectEvent(async () => {
    if (!selectorProps.onLoad) return;
    const message = await selectorProps.onLoad();
    dispatchMessage({ message, pluginName });
  });

  const onSubmit: RoomSelectorProps["onSubmit"] = async (selectedItems) => {
    if (!selectorProps.onSubmit) return;
    const selectedIds = selectedItems
      .filter((item) => item.id)
      .map((item) => item.id!);

    const message = await selectorProps.onSubmit(selectedIds);
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

  const onClose = async () => {
    if (!selectorProps.onClose) return;
    const message = await selectorProps.onClose();
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

  return (
    <RoomSelector
      id={id}
      className={className}
      onSubmit={onSubmit}
      submitButtonLabel={submitButtonLabel}
      excludeItems={excludeItems}
      isMultiSelect={!!isMultiSelect}
      emptyScreenDescription={emptyScreenDescription}
      emptyScreenHeader={emptyScreenHeader}
      searchArea={searchArea}
      roomType={convertPluginRoomType(roomType)}
      createDefineRoomLabel={createDefineRoomLabel}
      createDefineRoomType={
        convertPluginRoomType(createDefineRoomType) as RoomsType | undefined
      }
      withCreate={withCreate}
      withSearch={withSearch}
      useAside
      onClose={onClose}
      {...headerProps}
      {...cancelButtonProps}
    />
  );
};

export default PluginRoomSelector;
