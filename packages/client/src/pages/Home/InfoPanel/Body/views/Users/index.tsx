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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { TContextMenuValueTypeOnClick } from "@docspace/shared/components/context-menu/ContextMenu.types";

import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { TUser } from "@docspace/shared/api/people/types";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { EmployeeStatus } from "@docspace/shared/enums";

import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import { getContactsUrl } from "SRC_DIR/helpers/contacts";
import ContactsConextOptionsStore from "SRC_DIR/store/contacts/ContactsContextOptionsStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import AccessRightsStore from "SRC_DIR/store/AccessRightsStore";

import { StyledUsersContent } from "../../styles/Users";

type TInfoPanelSelection = ReturnType<UsersStore["getPeopleListItem"]>;

type UsersProps = {
  infoPanelSelection: TInfoPanelSelection;
  setInfoPanelSelection: InfoPanelStore["setInfoPanelSelection"];

  canChangeUserType: AccessRightsStore["canChangeUserType"];

  getPeopleListItem: UsersStore["getPeopleListItem"];
  setUsersSelection: UsersStore["setSelection"];
  setUsersBufferSelection: UsersStore["setBufferSelection"];
  getUsersChangeTypeOptions: ContactsConextOptionsStore["getUsersChangeTypeOptions"];

  showStorageInfo: CurrentQuotasStore["showStorageInfo"];

  standalone: SettingsStore["standalone"];

  isGuests: boolean;
};

const Users = ({
  infoPanelSelection,
  canChangeUserType,
  setInfoPanelSelection,
  getPeopleListItem,
  setUsersSelection,
  setUsersBufferSelection,
  getUsersChangeTypeOptions,

  showStorageInfo,
  standalone,
  isGuests,
}: UsersProps) => {
  const { t, ready } = useTranslation([
    "People",
    "InfoPanel",
    "ConnectDialog",
    "Common",
    "PeopleTranslations",
    "People",
    "Settings",
    "SmartBanner",
    "DeleteProfileEverDialog",
    "Translations",
  ]);

  const navigate = useNavigate();

  const [statusLabel, setStatusLabel] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const { role, isVisitor, isCollaborator } = infoPanelSelection;

  const getStatusLabel = React.useCallback(() => {
    let label = "";

    switch (infoPanelSelection.status) {
      case EmployeeStatus.Pending:
        label = t("PeopleTranslations:PendingInviteTitle");
        break;

      case EmployeeStatus.Disabled:
        label = t("PeopleTranslations:DisabledEmployeeStatus");
        break;

      case EmployeeStatus.Active:
      default:
        label = t("Common:Active");
        break;
    }

    setStatusLabel(label);
  }, [infoPanelSelection.status, t]);

  React.useEffect(() => {
    getStatusLabel();
  }, [infoPanelSelection, getStatusLabel]);

  const onAbort = () => {
    setIsLoading(false);
  };

  const onSuccess = (users: TUser[]) => {
    if (users) {
      const items = users.map((u) => getPeopleListItem(u));

      if (items.length === 1) {
        setInfoPanelSelection(items[0]);
      } else {
        setInfoPanelSelection(items);
      }
    }
    setIsLoading(false);
  };

  const onGroupClick = (groupId: string) => {
    const url = getContactsUrl("inside_group", groupId);
    navigate(url);
    setUsersSelection([]);
    setUsersBufferSelection(null);
  };

  const renderTypeData = () => {
    const typesOptions = getUsersChangeTypeOptions(t, infoPanelSelection);

    const typeLabel = getUserTypeTranslation(role, t);

    const selectedOption = typesOptions.find((option) => option.key === role);

    const text = (
      <Text title={typeLabel} fontSize="13px" fontWeight={600} truncate>
        {typeLabel}
      </Text>
    );

    const status = getUserStatus(infoPanelSelection);

    const canChange = canChangeUserType({
      ...infoPanelSelection,
      statusType: status,
    });

    if (!canChange || isGuests || !selectedOption) return text;

    const onSelect = (option: TOption) => {
      if (option.onClick)
        option.onClick(option as unknown as TContextMenuValueTypeOnClick);
    };

    const combobox = (
      <ComboBox
        id="info-account-type-select"
        className="type-combobox"
        selectedOption={selectedOption}
        onSelect={onSelect}
        options={typesOptions}
        scaled={false}
        size={ComboBoxSize.content}
        displaySelectedOption
        modernView
        manualWidth="auto"
        isLoading={isLoading}
      />
    );

    return combobox;
  };

  const typeData = renderTypeData();

  const statusText =
    isVisitor || isCollaborator ? t("Common:Free") : t("Common:Paid");

  if (!ready) return <InfoPanelViewLoader view="users" />;

  return (
    <StyledUsersContent>
      <div className="data__header">
        <Text className="header__text" title={t("Data")}>
          {t("InfoPanel:Data")}
        </Text>
      </div>
      <div className="data__body">
        <Text className="info_field first-row" title={t("Data")}>
          {t("Common:Account")}
        </Text>
        <Text
          className="info_data first-row"
          fontSize="13px"
          fontWeight={600}
          title={statusLabel}
        >
          {statusLabel}
        </Text>

        <Text className="info_field" title={t("Common:Type")}>
          {t("Common:Type")}
        </Text>
        {typeData}

        {isGuests && infoPanelSelection.createdBy?.displayName ? (
          <>
            <Text className="info_field" title={t("Common:Inviter")}>
              {t("Common:Inviter")}
            </Text>
            <Text
              className="info_data first-row"
              fontSize="13px"
              fontWeight={600}
              title={statusLabel}
            >
              {infoPanelSelection.createdBy.displayName}
            </Text>
          </>
        ) : null}

        {infoPanelSelection.status === EmployeeStatus.Active ? (
          <>
            <Text
              className="info_field"
              title={t("PeopleTranslations:RegistrationDate")}
            >
              {t("PeopleTranslations:RegistrationDate")}
            </Text>
            <Text
              className="info_data first-row"
              fontSize="13px"
              fontWeight={600}
              title={infoPanelSelection.registrationDate}
            >
              {infoPanelSelection.registrationDate}
            </Text>
          </>
        ) : null}
        {!standalone ? (
          <>
            <Text className="info_field" title={t("UserStatus")}>
              {t("UserStatus")}
            </Text>
            <Text
              className="info_data first-row"
              fontSize="13px"
              fontWeight={600}
              title={statusLabel}
            >
              {statusText}
            </Text>
          </>
        ) : null}
        {showStorageInfo && !isGuests ? (
          <>
            <Text className="info_field" title={t("Common:Storage")}>
              {t("Common:Storage")}
            </Text>
            <SpaceQuota
              type="user"
              item={infoPanelSelection}
              className="type-combobox"
              onSuccess={onSuccess}
              onAbort={onAbort}
            />
          </>
        ) : null}

        {infoPanelSelection?.groups?.length && !isGuests ? (
          <>
            <Text
              className="info_field info_field_groups"
              title={t("Common:Group")}
            >
              {t("Common:Group")}
            </Text>

            <div className="info_groups">
              {infoPanelSelection.groups.map((group) => (
                <Link
                  key={group.id}
                  className="info_data info_group"
                  isHovered
                  fontSize="13px"
                  lineHeight="20px"
                  fontWeight={600}
                  title={group.name}
                  onClick={() => onGroupClick(group.id)}
                  isTextOverflow
                >
                  {group.name}
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </StyledUsersContent>
  );
};

export default inject(
  ({
    peopleStore,
    accessRightsStore,
    infoPanelStore,
    currentQuotaStore,
    settingsStore,
  }: TStore) => {
    const { usersStore, contextOptionsStore } = peopleStore;

    const { canChangeUserType } = accessRightsStore;

    const { setInfoPanelSelection } = infoPanelStore;

    const {
      setSelection: setUsersSelection,
      setBufferSelection: setUsersBufferSelection,
      getPeopleListItem,
    } = usersStore!;

    const { getUsersChangeTypeOptions } = contextOptionsStore!;

    const { showStorageInfo } = currentQuotaStore;
    const { standalone } = settingsStore;

    return {
      canChangeUserType,
      getPeopleListItem,
      setInfoPanelSelection,
      setUsersSelection,
      setUsersBufferSelection,
      getUsersChangeTypeOptions,

      showStorageInfo,
      standalone,
    };
  },
)(observer(Users));
