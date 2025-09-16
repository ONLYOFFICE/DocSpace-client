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

import { useMemo, FC } from "react";
import { useTranslation } from "react-i18next";

import { isFile } from "../../../utils/typeGuards";
import { ShareAccessRights } from "../../../enums";
import PeopleSelector from "../../../selectors/People";
import { ShareLinkService } from "../../../services/share-link.service";
import type { TShareToUser } from "../../../api/files/types";

import type { TAccessRight, TOnSubmit } from "../../selector/Selector.types";

import { getShareAccessRightOptions } from "../Share.helpers";
import { toastr, TData } from "../../toast";

import type { ShareSelectorProps } from "./Selector.types";

export const ShareSelector: FC<ShareSelectorProps> = ({
  item,
  onClose,
  onBackClick,
  onCloseClick,
  onSubmit,
  withAccessRights,
}) => {
  const { t } = useTranslation("Common");

  const getDefaultAccessRight = () => {
    const isForm = isFile(item) && item.isForm;

    const accessDefault = isForm
      ? ShareAccessRights.FormFilling
      : ShareAccessRights.ReadOnly;

    return accessDefault;
  };

  const handleSubmit: TOnSubmit = async (selectedItems, accessRight) => {
    const share: TShareToUser[] = selectedItems.map((selectedItem) => {
      return {
        shareTo: selectedItem.id!.toString(),
        access:
          (accessRight?.access as ShareAccessRights) ?? getDefaultAccessRight(),
      };
    });

    try {
      const list = await ShareLinkService.shareItemToUser(share, item);

      onSubmit?.(list);

      toastr.success(t("Common:RoomCreateUser"));
    } catch (error) {
      toastr.error(error as TData);
      console.error(error);
    } finally {
      onClose();
    }
  };

  const accessOptions = useMemo(
    () => getShareAccessRightOptions(t, item, false) as TAccessRight[],
    [t, item],
  );

  const selectedAccessRight = useMemo(() => {
    const isForm = isFile(item) && item.isForm;

    const accessDefault = isForm
      ? ShareAccessRights.FormFilling
      : ShareAccessRights.ReadOnly;

    return accessOptions.find((a) => a.access === accessDefault) || null;
  }, [accessOptions]);

  const invitedUsersArray: string[] = [];

  const accessRightsProps = withAccessRights
    ? ({
        withAccessRights: true,
        accessRights: accessOptions,
        selectedAccessRight,
        onAccessRightsChange: () => {},
      } as const)
    : {};

  return (
    <PeopleSelector
      withHeader
      withGuests
      withGroups
      isMultiSelect
      disableDisabledUsers
      useAside
      withBlur={false}
      withoutBackground={false}
      onClose={onClose}
      submitButtonLabel={t("Common:SelectAction")}
      disableSubmitButton={false}
      onSubmit={handleSubmit}
      disableInvitedUsers={invitedUsersArray}
      data-test-id="share_to_people_selector"
      {...accessRightsProps}
      headerProps={{
        headerLabel: t("Common:Contacts"),
        withoutBackButton: false,
        withoutBorder: true,
        isCloseable: true,
        onBackClick,
        onCloseClick,
      }}
    />
  );
};
