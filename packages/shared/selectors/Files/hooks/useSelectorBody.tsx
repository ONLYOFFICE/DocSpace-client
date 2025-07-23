// (c) Copyright Ascensio System SIA 2009-2024
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
import { useContext } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";
import EmptyScreenAltSvgUrl from "PUBLIC_DIR/images/empty_screen_alt.svg?url";
import EmptyScreenAltSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_alt_dark.svg?url";

import { Selector } from "../../../components/selector";
import {
  SelectorProps,
  TSelectorBreadCrumbs,
  TSelectorCancelButton,
  TSelectorCheckbox,
  TSelectorHeader,
  TSelectorInput,
  TSelectorSearch,
  TSelectorSubmitButton,
} from "../../../components/selector/Selector.types";
import {
  BreadCrumbsLoader,
  RowLoader,
  SearchLoader,
} from "../../../skeletons/selector";

import { FilesSelectorProps } from "../FilesSelector.types";
import { LoadersContext } from "../contexts/Loaders";

type PickedSearchProps = Pick<
  TSelectorSearch,
  "searchValue" | "onSearch" | "onClearSearch"
> & { withSearch: boolean };

type PickedSubmitButtonProps = Pick<
  TSelectorSubmitButton,
  "onSubmit" | "disableSubmitButton"
>;

type PickedBreadCrumbsProps = Pick<
  TSelectorBreadCrumbs,
  "onSelectBreadCrumb" | "breadCrumbs"
> & { withBreadCrumbs: boolean };

type PickedSelectorBodyProps = Pick<
  SelectorProps,
  "items" | "onSelect" | "hasNextPage" | "totalItems" | "loadNextPage"
> & { isRoot: boolean };

const useSelectorBody = ({
  // header props
  withHeader,
  headerProps,

  // search input
  withSearch,
  searchValue,
  onSearch,
  onClearSearch,

  // submit button
  submitButtonLabel,
  submitButtonId,
  onSubmit,
  disableSubmitButton,

  // cancel button
  withCancelButton,
  cancelButtonLabel,
  cancelButtonId,
  onCancel,

  // footer input
  withFooterInput,
  footerInputHeader,
  currentFooterInputValue,

  // footer checkbox
  withFooterCheckbox,
  footerCheckboxLabel,

  // with bread crumbs
  withBreadCrumbs,
  breadCrumbs,
  onSelectBreadCrumb,

  // files selector props
  descriptionText,
  withInfoBar,
  infoBarData,
  withPadding,
  isRoot,

  // selector props
  items,
  onSelect,
  hasNextPage,
  totalItems,
  loadNextPage,
  withInit,

  isMultiSelect,
}: Omit<FilesSelectorProps, "withSearch" | "onSubmit"> &
  PickedSearchProps &
  PickedSubmitButtonProps &
  PickedBreadCrumbsProps &
  PickedSelectorBodyProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["Common"]);

  const { showBreadCrumbsLoader, isNextPageLoading, showLoader } =
    useContext(LoadersContext);

  const headerSelectorProps: TSelectorHeader = withHeader
    ? {
        withHeader,
        headerProps: {
          ...headerProps,
          headerLabel: headerProps?.headerLabel || t("Common:SelectAction"),
          onCloseClick: onCancel,
        },
      }
    : {};

  const searchProps: TSelectorSearch = withSearch
    ? {
        withSearch,
        searchLoader: <SearchLoader />,
        searchPlaceholder: t("Common:Search"),
        searchValue,
        isSearchLoading: showBreadCrumbsLoader,
        onSearch: onSearch!,
        onClearSearch: onClearSearch!,
      }
    : {};

  const submitButtonProps: TSelectorSubmitButton = {
    onSubmit,
    submitButtonLabel,
    submitButtonId,
    disableSubmitButton,
  };

  const cancelButtonProps: TSelectorCancelButton = withCancelButton
    ? {
        withCancelButton,
        cancelButtonLabel: cancelButtonLabel || t("Common:CancelButton"),
        cancelButtonId,
        onCancel,
      }
    : {};

  const footerInputProps: TSelectorInput = withFooterInput
    ? {
        withFooterInput,
        footerInputHeader,
        currentFooterInputValue,
      }
    : {};

  const footerCheckboxProps: TSelectorCheckbox = withFooterCheckbox
    ? {
        withFooterCheckbox,
        footerCheckboxLabel,
        isChecked: false,
      }
    : {};

  const breadCrumbsProps: TSelectorBreadCrumbs = withBreadCrumbs
    ? {
        breadCrumbs: breadCrumbs!,
        breadCrumbsLoader: <BreadCrumbsLoader />,
        isBreadCrumbsLoading: showBreadCrumbsLoader,
        withBreadCrumbs: true,
        onSelectBreadCrumb: onSelectBreadCrumb!,
        bodyIsLoading: showLoader,
      }
    : {};

  const SelectorBody = (
    <Selector
      {...headerSelectorProps}
      {...searchProps}
      {...submitButtonProps}
      {...cancelButtonProps}
      {...footerInputProps}
      {...footerCheckboxProps}
      {...breadCrumbsProps}
      isMultiSelect={isMultiSelect ?? false}
      items={items}
      onSelect={onSelect}
      emptyScreenImage={
        theme?.isBase ? EmptyScreenAltSvgUrl : EmptyScreenAltSvgDarkUrl
      }
      emptyScreenHeader={t("Common:SelectorEmptyScreenHeader")}
      emptyScreenDescription=""
      searchEmptyScreenImage={
        theme?.isBase
          ? EmptyScreenFilterAltSvgUrl
          : EmptyScreenFilterAltDarkSvgUrl
      }
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      searchEmptyScreenDescription={t("Common:EmptyFilterDescriptionText")}
      isLoading={showLoader}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isUser={isRoot}
          isContainer={showLoader}
        />
      }
      alwaysShowFooter
      isNextPageLoading={isNextPageLoading}
      hasNextPage={hasNextPage}
      totalItems={totalItems}
      loadNextPage={loadNextPage}
      descriptionText={descriptionText}
      disableFirstFetch
      withInfoBar={withInfoBar}
      infoBarData={infoBarData}
      withPadding={withPadding}
      isSSR={withInit}
    />
  );

  return SelectorBody;
};

export default useSelectorBody;
