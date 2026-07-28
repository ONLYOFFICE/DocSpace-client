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

import { type FC } from "react";

import type { TFileLink } from "../../../api/files/types";

import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@docspace/ui-kit/components/combobox";
import { AccessRightSelect } from "@docspace/ui-kit/components/access-right-select";

import { IconDisplay } from "./IconDisplay";

export interface AccessRightSelectorProps {
  isLoaded: boolean;
  isRoomsLink: boolean;
  isFolder: boolean;
  isArchiveFolder: boolean;
  isMobileViewLink: boolean;
  isBlockedByAdmin?: boolean;

  link: TFileLink;
  accessOptions: TOption[];
  roomAccessOptions?: TOption[];
  selectedAccessOption?: TOption;
  roomSelectedOptions?: TOption;

  changeAccessOption: (item: TOption, link: TFileLink) => void;
}

export const AccessRightSelector: FC<AccessRightSelectorProps> = ({
  isLoaded,
  isRoomsLink,
  isFolder,
  isArchiveFolder,
  isMobileViewLink,
  isBlockedByAdmin,
  link,
  accessOptions,
  roomAccessOptions,
  selectedAccessOption,
  roomSelectedOptions,
  changeAccessOption,
}) => {
  if (
    accessOptions.length === 1 ||
    roomAccessOptions?.length === 1 ||
    isBlockedByAdmin
  ) {
    const option =
      isRoomsLink || isFolder ? roomSelectedOptions : selectedAccessOption;

    return (
      <IconDisplay
        option={option ?? ({} as TOption)}
        withMargin={isBlockedByAdmin}
      />
    );
  }

  if (isRoomsLink || isFolder) {
    return (
      <AccessRightSelect
        fillIcon
        modernView
        topSpace={16}
        type="onlyIcon"
        noSelect={false}
        directionY="both"
        usePortalBackdrop
        manualWidth="300px"
        isAside={isMobileViewLink}
        withBlur={isMobileViewLink}
        isMobileView={isMobileViewLink}
        fixedDirection={isMobileViewLink}
        shouldShowBackdrop={isMobileViewLink}
        accessOptions={roomAccessOptions ?? []}
        onSelect={(item) => changeAccessOption(item, link)}
        selectedOption={roomSelectedOptions ?? ({} as TOption)}
        isDisabled={isLoaded || isArchiveFolder}
      />
    );
  }

  return (
    <ComboBox
      fillIcon
      modernView
      scaled={false}
      type="onlyIcon"
      noSelect={false}
      directionY="both"
      showDisabledItems
      manualWidth="auto"
      withBackdrop={false}
      scaledOptions={false}
      options={accessOptions}
      size={ComboBoxSize.content}
      isDisabled={isLoaded}
      selectedOption={selectedAccessOption ?? ({} as TOption)}
      onSelect={(item) => changeAccessOption(item, link)}
      useImageIcon
    />
  );
};
