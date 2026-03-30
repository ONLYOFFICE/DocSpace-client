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
import {
  TBaseSelector,
  TSelectorItem as TPluginSelectorItem,
} from "@onlyoffice/docspace-plugin-sdk";

import {
  Selector,
  TSelectorItem,
  type SelectorProps,
} from "@docspace/ui-kit/components/selector";

import {
  BreadCrumbsLoader,
  RowLoader,
} from "@docspace/shared/skeletons/selector";

import {
  HeaderProps,
  THeaderBackButton,
  TOnSubmit,
  TSelectorBreadCrumbs,
  TSelectorCancelButton,
  TSelectorHeader,
  TSelectorSubmitButton,
} from "@docspace/ui-kit/components/selector";

import EmptyScreenFilter from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg?url";
import PluginStore from "SRC_DIR/store/PluginStore";

type Props = {
  pluginSelectorProps: TBaseSelector;
  dispatchMessage: PluginStore["dispatchMessage"];
  getPluginIcon: (icon: string) => string | undefined;
  pluginName: string;
};

const PluginBaseSelector = ({
  pluginSelectorProps: selectorProps,
  dispatchMessage,
  getPluginIcon,
  pluginName,
}: Props) => {
  const onLoadEvent = useEffectEvent(async () => {
    if (!selectorProps.onLoad) return;
    const message = await selectorProps.onLoad();
    dispatchMessage({ message, pluginName });
  });

  useEffect(() => {
    onLoadEvent();
  }, []);

  const onSubmit: TOnSubmit = async (
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

  const onSelect: SelectorProps["onSelect"] = async (
    selectedItem,
    isDoubleClick,
  ) => {
    if (!selectorProps.onSelect) return;

    const message = await selectorProps.onSelect({
      selectedId: selectedItem.id,
      isDoubleClick,
    });
    dispatchMessage({ message, pluginName });
  };

  const mapDtoToSelectorItems = (
    items: TPluginSelectorItem[],
  ): TSelectorItem[] => {
    return items.map((item) => {
      const onAcceptInput = async (value: string) => {
        if (!item?.onAcceptInput) return;

        const message = await item.onAcceptInput(value);
        dispatchMessage({ message, pluginName });
      };

      const onCancelInput = async () => {
        if (!item?.onCancelInput) return;

        const message = await item.onCancelInput();
        dispatchMessage({ message, pluginName });
      };

      const onCreateClick = async () => {
        if (!item?.onCreateClick) return;

        const message = await item.onCreateClick();
        dispatchMessage({ message, pluginName });
      };

      if (item.isCreateNewItem)
        return {
          key: item.id?.toString(),
          id: item.id,
          label: item.label,
          isCreateNewItem: true,
          onCreateClick,
          onBackClick: () => {},
        } as TSelectorItem;

      return {
        key: item.id?.toString(),
        id: item.id,
        label: item.label,
        icon: item.icon && getPluginIcon(item.icon),

        isInputItem: Boolean(item.isInputItem),
        defaultInputValue: item.defaultInputValue ?? "",
        onAcceptInput,
        onCancelInput,
      };
    });
  };

  const onCancel: SelectorProps["onCancel"] = async () => {
    if (!selectorProps.onCancel) return;
    const message = await selectorProps.onCancel();
    dispatchMessage({ message, pluginName });
  };

  const onClose: SelectorProps["onClose"] = async () => {
    if (!selectorProps.onClose) return;
    const message = await selectorProps.onClose();
    dispatchMessage({ message, pluginName });
  };

  const items = mapDtoToSelectorItems(selectorProps.items);
  const selectedItems = selectorProps.selectedItems
    ? mapDtoToSelectorItems(selectorProps.selectedItems)
    : undefined;

  const cancelButtonProps: TSelectorCancelButton =
    selectorProps.withCancelButton
      ? {
          withCancelButton: true,
          cancelButtonLabel: selectorProps.cancelButtonLabel ?? "",
          onCancel,
        }
      : {};

  const submitButtonProps: TSelectorSubmitButton = {
    onSubmit,
    submitButtonLabel: selectorProps.submitButtonLabel ?? "",
    disableSubmitButton: selectorProps.disabledSubmitButton ?? false,
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

  const headerProps: TSelectorHeader = selectorProps.withHeader
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

  const onSelectBreadCrumb: SelectorProps["onSelectBreadCrumb"] = async (
    item,
  ) => {
    if (!selectorProps.onSelectBreadCrumb) return;
    const message = await selectorProps.onSelectBreadCrumb(item.id);
    dispatchMessage({ message, pluginName });
  };

  const breadCrumbsProps: TSelectorBreadCrumbs = selectorProps.withBreadCrumbs
    ? {
        withBreadCrumbs: true,
        breadCrumbs: selectorProps.breadCrumbs ?? [],
        onSelectBreadCrumb,
        isBreadCrumbsLoading: selectorProps.isBreadCrumbsLoading ?? false,
        bodyIsLoading: false,
        breadCrumbsLoader: <BreadCrumbsLoader />,
      }
    : {};

  const loadNextPage: SelectorProps["loadNextPage"] = async () => {
    if (!selectorProps.onLoadNextPage) return;
    const message = await selectorProps.onLoadNextPage();
    dispatchMessage({ message, pluginName });
  };

  return (
    <Selector
      className={selectorProps.className}
      items={items}
      hasNextPage={!!selectorProps.hasNextPage}
      isNextPageLoading={!!selectorProps.isNextPageLoading}
      loadNextPage={loadNextPage}
      totalItems={selectorProps.totalItems ?? 0}
      rowLoader={<RowLoader isUser={false} isMultiSelect={false} />}
      isLoading={!!selectorProps.isLoading}
      isMultiSelect={!!selectorProps.isMultiSelect}
      selectedItems={selectedItems}
      maxSelectedItems={selectorProps.maxSelectedItems}
      onSelect={onSelect}
      onClose={onClose}
      descriptionText={selectorProps.descriptionText}
      emptyScreenImage={EmptyScreenFilter}
      emptyScreenHeader={selectorProps.emptyScreenHeader ?? ""}
      emptyScreenDescription={selectorProps.emptyScreenDescription ?? ""}
      searchEmptyScreenImage={EmptyScreenFilter}
      searchEmptyScreenHeader={selectorProps.searchEmptyScreenHeader ?? ""}
      searchEmptyScreenDescription={
        selectorProps.searchEmptyScreenDescription ?? ""
      }
      {...cancelButtonProps}
      {...submitButtonProps}
      {...breadCrumbsProps}
      {...headerProps}
      useAside
    />
  );
};

export default PluginBaseSelector;
