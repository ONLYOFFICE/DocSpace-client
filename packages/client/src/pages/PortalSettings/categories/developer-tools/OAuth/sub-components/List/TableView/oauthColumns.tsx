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

import type { TFunction } from "i18next";
import { inject, observer } from "mobx-react";

import type { IClientProps } from "@docspace/shared/utils/oauth/types";
import {
  contextMenuColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { Tags } from "@onlyoffice/apps-ui-kit/components/tags";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";

import type OAuthStore from "SRC_DIR/store/OAuthStore";

import NameCell from "./columns/name";
import CreatorCell from "./columns/creator";

import styles from "./TableView.styled.module.scss";

/** How wide a tag of the scopes column is taken to be. */
export const SCOPE_TAG_WIDTH = 120;

type TStateCellProps = {
  item: IClientProps;
  t: TFunction;

  changeClientStatus?: OAuthStore["changeClientStatus"];
  setBufferSelection?: OAuthStore["setBufferSelection"];
  setDisableDialogVisible?: OAuthStore["setDisableDialogVisible"];
};

/** The app's switch: disabling asks first, enabling does not. */
const StateCell = inject(({ oauthStore }: { oauthStore: OAuthStore }) => ({
  changeClientStatus: oauthStore.changeClientStatus,
  setBufferSelection: oauthStore.setBufferSelection,
  setDisableDialogVisible: oauthStore.setDisableDialogVisible,
}))(
  observer(
    ({
      item,
      t,
      changeClientStatus,
      setBufferSelection,
      setDisableDialogVisible,
    }: TStateCellProps) => {
      const onChange = async () => {
        if (!changeClientStatus) return;
        try {
          if (item.enabled && setDisableDialogVisible) {
            setBufferSelection!(item.clientId);
            setDisableDialogVisible(true);
            return;
          }
          await changeClientStatus(item.clientId, !item.enabled);

          toastr.success(
            item.enabled
              ? t("ApplicationDisabledSuccessfully")
              : t("ApplicationEnabledSuccessfully"),
          );
        } catch (e) {
          toastr.error(e as string);
        }
      };

      return (
        <ToggleButton
          className="toggle toggleButton"
          isChecked={item.enabled}
          onChange={onChange}
          dataTestId={`${item.name}_toggle_button`}
        />
      );
    },
  ),
) as React.ComponentType<TStateCellProps>;

/**
 * The old header's columns, then the row menu. `tagCount` is how many scope
 * tags fit the scopes column, which `scopesHeaderRef` measures.
 */
export const getOAuthColumns = (
  t: TFunction,
  tagCount: number,
  scopesHeaderRef?: React.Ref<HTMLDivElement>,
): DataTableColumn<IClientProps>[] => [
  {
    id: "Name",
    title: t("Common:Label"),
    width: { type: "fill" },
    cellClassName: styles.cell,
    cell: (item) => (
      <NameCell name={item.name} icon={item.logo} clientId={item.clientId} />
    ),
  },
  {
    id: "Creator",
    title: t("Creator"),
    width: { type: "flex", min: 150 },
    cellClassName: styles.cell,
    cell: (item) => (
      <CreatorCell
        avatar={item.creatorAvatar || ""}
        displayName={item.creatorDisplayName || ""}
      />
    ),
  },
  {
    id: "Modified",
    title: t("Common:ByLastModified"),
    width: { type: "flex", min: 150 },
    cellClassName: styles.cell,
    cell: (item) => (
      <Text
        as="span"
        fontWeight={400}
        className="mr-8 textOverflow description-text"
        dataTestId="app_modified_date_cell"
      >
        {getCorrectDate(getCookie("asc_language") || "", item.modifiedOn || "")}
      </Text>
    ),
  },
  {
    id: "Scopes",
    title: t("Scopes"),
    width: { type: "flex", min: 150 },
    headerRef: scopesHeaderRef,
    cellClassName: styles.cell,
    cell: (item) => (
      <Text
        as="span"
        fontWeight={400}
        className="mr-8 textOverflow description-text"
        dataTestId="app_scopes_tags_cell"
      >
        <Tags
          tags={item.scopes}
          columnCount={tagCount}
          onSelectTag={() => {}}
        />
      </Text>
    ),
  },
  {
    id: "State",
    title: t("Webhooks:State"),
    width: { type: "fixed", size: 64 },
    cell: (item) => <StateCell item={item} t={t} />,
  },
  contextMenuColumn<IClientProps>(),
];
