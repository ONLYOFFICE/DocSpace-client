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

import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import { EmployeeType } from "@docspace/shared/enums";
import PeopleSelector from "@docspace/shared/selectors/People";
import { TOnSubmit } from "@docspace/shared/components/selector/Selector.types";
import { TUser } from "@docspace/shared/api/people/types";

const PEOPLE_TAB_ID = "0";

type TemplateAccessSelectorProps = {
  roomId: string | number;
  onSubmit: TOnSubmit;
  onClose?: () => void;
  onBackClick: () => void;
  onCloseClick: () => void;
  checkIfUserInvited?: (user: TUser) => boolean;
  disableInvitedUsers?: string[];
};

const TemplateAccessSelector = ({
  roomId,
  onSubmit,
  onClose,
  onBackClick,
  onCloseClick,
  checkIfUserInvited,
  disableInvitedUsers,
}: TemplateAccessSelectorProps) => {
  const [selectedTab, setSelectedTab] = useState(PEOPLE_TAB_ID);

  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const getSelectedTab = (id: string) => setSelectedTab(id);

  const getInfoText = () => {
    return selectedTab === PEOPLE_TAB_ID ? (
      <Trans
        t={t}
        ns="Files"
        i18nKey="AddUsersOrGroupsInfo"
        values={{ productName: t("Common:ProductName") }}
        components={{ 1: <strong /> }}
      />
    ) : (
      <Trans
        t={t}
        ns="Files"
        i18nKey="AddUsersOrGroupsInfoGroups"
        values={{ productName: t("Common:ProductName") }}
        components={{ 1: <strong /> }}
      />
    );
  };

  const infoText = getInfoText() as unknown as string;

  const filter = Filter.getDefault();
  filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];

  return (
    <PeopleSelector
      useAside
      onClose={onClose!}
      onSubmit={onSubmit}
      submitButtonLabel={t("Common:AddButton")}
      disableSubmitButton={false}
      isMultiSelect
      disableDisabledUsers
      withGroups
      withInfo
      infoText={infoText}
      withInfoBadge
      roomId={roomId}
      disableInvitedUsers={disableInvitedUsers}
      checkIfUserInvited={checkIfUserInvited}
      withHeader
      filter={filter}
      headerProps={{
        headerLabel: t("Common:Contacts"),
        withoutBackButton: false,
        withoutBorder: true,
        isCloseable: true,
        onBackClick,
        onCloseClick,
      }}
      setActiveTab={getSelectedTab}
    />
  );
};

export default TemplateAccessSelector;
