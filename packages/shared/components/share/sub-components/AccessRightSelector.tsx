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

import { type FC } from "react";

import type { TFileLink } from "../../../api/files/types";

import { ComboBox, ComboBoxSize, type TOption } from "../../combobox";
import { AccessRightSelect } from "../../access-right-select";

import { IconDisplay } from "./IconDisplay";

export interface AccessRightSelectorProps {
  isLoaded: boolean;
  isRoomsLink: boolean;
  isFolder: boolean;
  isExpiredLink: boolean;
  isArchiveFolder: boolean;
  isMobileViewLink: boolean;

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
  isExpiredLink,
  isArchiveFolder,
  isMobileViewLink,
  link,
  accessOptions,
  roomAccessOptions,
  selectedAccessOption,
  roomSelectedOptions,
  changeAccessOption,
}) => {
  if (accessOptions.length === 1 || roomAccessOptions?.length === 1) {
    const option =
      isRoomsLink || isFolder ? roomSelectedOptions : selectedAccessOption;

    return <IconDisplay option={option ?? ({} as TOption)} />;
  }

  if (isRoomsLink || isFolder) {
    return (
      <AccessRightSelect
        fillIcon
        modernView
        topSpace={16}
        type="onlyIcon"
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
        isDisabled={isExpiredLink || isLoaded || isArchiveFolder}
      />
    );
  }

  return (
    <ComboBox
      fillIcon
      modernView
      scaled={false}
      type="onlyIcon"
      directionY="both"
      showDisabledItems
      manualWidth="auto"
      withBackdrop={false}
      scaledOptions={false}
      options={accessOptions}
      size={ComboBoxSize.content}
      isDisabled={isExpiredLink || isLoaded}
      selectedOption={selectedAccessOption ?? ({} as TOption)}
      onSelect={(item) => changeAccessOption(item, link)}
    />
  );
};
