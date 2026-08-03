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

import { MainButtonMobile } from "@docspace/ui-kit/components/main-button-mobile";
import type {
  ActionOption,
  ButtonOption,
} from "@docspace/ui-kit/components/main-button-mobile/MainButtonMobile.types";
import type { MainButtonProps } from "@docspace/ui-kit/components/main-button/MainButton.types";

import styles from "./CreateButtonMobile.module.scss";

type ModelItem = ActionOption & {
  id?: string;
  key: string;
  isSeparator?: boolean;
};

const isUploadItem = (option: ModelItem) =>
  /upload/i.test(option.key ?? "") || /upload/i.test(option.id ?? "");

const withoutSeparators = (list: ModelItem[]) =>
  list.filter((option) => option && !option.isSeparator);

const splitItems = (items: ModelItem[]) => {
  const firstUploadIndex = items.findIndex(isUploadItem);
  const actionOptions = withoutSeparators(
    firstUploadIndex === -1 ? items : items.slice(0, firstUploadIndex),
  );
  const buttonOptions = (
    firstUploadIndex === -1
      ? []
      : withoutSeparators(items.slice(firstUploadIndex))
  ) as unknown as ButtonOption[];
  return { actionOptions, buttonOptions, hasUpload: buttonOptions.length > 0 };
};

type CreateButtonMobileViewProps = {
  visible: boolean;
  mainButtonProps?: MainButtonProps;
};

const CreateButtonMobileView = ({
  visible,
  mainButtonProps,
}: CreateButtonMobileViewProps) => {
  if (!visible || !mainButtonProps) return null;

  const { text, isDropdown, model, onAction } = mainButtonProps;

  const items = isDropdown ? (model as unknown as ModelItem[]) : [];
  const { actionOptions, buttonOptions, hasUpload } = splitItems(items);

  return (
    <MainButtonMobile
      className={styles.createButtonMobile}
      title={text}
      withMenu={isDropdown}
      withoutButton={!hasUpload}
      actionOptions={actionOptions as unknown as ActionOption[]}
      buttonOptions={buttonOptions.length > 0 ? buttonOptions : undefined}
      onClick={isDropdown ? undefined : onAction}
    />
  );
};

export default CreateButtonMobileView;
