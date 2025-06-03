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
import classNames from "classnames";

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
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { EmployeeStatus } from "@docspace/shared/enums";
import { Nullable } from "@docspace/shared/types";

import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import { getContactsUrl, TPeopleListItem } from "SRC_DIR/helpers/contacts";
import ContactsConextOptionsStore from "SRC_DIR/store/contacts/ContactsContextOptionsStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import AccessRightsStore from "SRC_DIR/store/AccessRightsStore";

import SeveralItems from "../../sub-components/SeveralItems";
import NoItem from "../../sub-components/NoItem";

import ItemTitle from "./ItemTitle";

import styles from "./Users.module.scss";

type UsersProps = {
  canChangeUserType?: AccessRightsStore["canChangeUserType"];

  setUsersSelection?: UsersStore["setSelection"];
  setUsersBufferSelection?: UsersStore["setBufferSelection"];

  getUsersChangeTypeOptions?: ContactsConextOptionsStore["getUsersChangeTypeOptions"];
  getUserContextOptions?: ContactsConextOptionsStore["getUserContextOptions"];

  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];

  standalone?: SettingsStore["standalone"];

  userSelection?: TPeopleListItem[] | Nullable<TPeopleListItem>;

  isGuests?: boolean;
};

const Users = ({
  canChangeUserType,

  setUsersSelection,
  setUsersBufferSelection,

  getUsersChangeTypeOptions,
  getUserContextOptions,

  showStorageInfo,
  standalone,
  userSelection,
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

  const getStatusLabel = React.useCallback(() => {
    if (!userSelection || Array.isArray(userSelection)) return;

    let label = "";

    switch (userSelection.status) {
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
  }, [userSelection, t]);

  React.useEffect(() => {
    getStatusLabel();
  }, [userSelection, getStatusLabel]);

  const onAbort = () => {
    setIsLoading(false);
  };

  const onGroupClick = (groupId: string) => {
    const url = getContactsUrl("inside_group", groupId);
    navigate(url);
    setUsersSelection!([]);
    setUsersBufferSelection!(null);
  };

  const renderTypeData = () => {
    if (!userSelection || Array.isArray(userSelection)) return;
    const { role } = userSelection;

    const typesOptions = getUsersChangeTypeOptions!(t, userSelection);

    const typeLabel = getUserTypeTranslation(role, t);

    const selectedOption = typesOptions.find((option) => option.key === role);

    const text = (
      <Text
        title={typeLabel}
        fontSize="13px"
        fontWeight={600}
        truncate
        noSelect
      >
        {typeLabel}
      </Text>
    );

    const status = getUserStatus(userSelection);

    const canChange = canChangeUserType!({
      ...userSelection,
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
        className={styles.typeCombobox}
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

  if (
    !userSelection ||
    (Array.isArray(userSelection) && userSelection.length === 0)
  )
    return <NoItem isGuests={isGuests!} isUsers={!isGuests} />;

  if (Array.isArray(userSelection))
    return (
      <SeveralItems isUsers isGroups={false} selectedItems={userSelection} />
    );

  const typeData = renderTypeData();

  const { isVisitor, isCollaborator } = userSelection;

  const statusText =
    isVisitor || isCollaborator ? t("Common:Free") : t("Common:Paid");

  if (!ready) return <InfoPanelViewLoader view="users" />;

  return (
    <>
      <ItemTitle
        userSelection={userSelection}
        getUserContextOptions={getUserContextOptions!}
      />
      <div className={styles.userContent}>
        <div className={styles.header}>
          <Text
            noSelect
            title={t("Data")}
            fontSize="14px"
            fontWeight={600}
            lineHeight="16px"
          >
            {t("InfoPanel:Data")}
          </Text>
        </div>
        <div className={styles.body}>
          <Text
            className={classNames(styles.infoField, styles.firstRow)}
            noSelect
            title={t("Data")}
          >
            {t("Common:Account")}
          </Text>
          <Text
            className={classNames(styles.infoData, styles.firstRow)}
            fontSize="13px"
            fontWeight={600}
            noSelect
            title={statusLabel}
          >
            {statusLabel}
          </Text>

          <Text className={styles.infoField} noSelect title={t("Common:Type")}>
            {t("Common:Type")}
          </Text>
          {typeData}

          {isGuests && userSelection.createdBy?.displayName ? (
            <>
              <Text
                className={styles.infoField}
                noSelect
                title={t("Common:Inviter")}
              >
                {t("Common:Inviter")}
              </Text>
              <Text
                fontSize="13px"
                fontWeight={600}
                noSelect
                title={statusLabel}
              >
                {userSelection.createdBy.displayName}
              </Text>
            </>
          ) : null}

          {userSelection.status === EmployeeStatus.Active ? (
            <>
              <Text
                className={styles.infoField}
                noSelect
                title={t("PeopleTranslations:RegistrationDate")}
              >
                {t("PeopleTranslations:RegistrationDate")}
              </Text>
              <Text
                fontSize="13px"
                fontWeight={600}
                noSelect
                title={userSelection.registrationDate}
              >
                {userSelection.registrationDate}
              </Text>
            </>
          ) : null}
          {!standalone ? (
            <>
              <Text
                className={styles.infoField}
                noSelect
                title={t("UserStatus")}
              >
                {t("UserStatus")}
              </Text>
              <Text
                fontSize="13px"
                fontWeight={600}
                noSelect
                title={statusLabel}
              >
                {statusText}
              </Text>
            </>
          ) : null}
          {showStorageInfo && !isGuests ? (
            <>
              <Text
                className={styles.infoField}
                noSelect
                title={t("Common:Storage")}
              >
                {t("Common:Storage")}
              </Text>
              <SpaceQuota
                type="user"
                item={userSelection}
                className={styles.typeCombobox}
                onAbort={onAbort}
              />
            </>
          ) : null}

          {userSelection?.groups?.length && !isGuests ? (
            <>
              <Text
                className={styles.infoFieldGroups}
                noSelect
                title={t("Common:Group")}
              >
                {t("Common:Group")}
              </Text>

              <div className={styles.groups}>
                {userSelection.groups.map((group) => (
                  <Link
                    key={group.id}
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
      </div>
    </>
  );
};

export default inject(
  ({
    peopleStore,
    accessRightsStore,
    currentQuotaStore,
    settingsStore,
  }: TStore) => {
    const { usersStore, contextOptionsStore } = peopleStore;

    const { canChangeUserType } = accessRightsStore;

    const {
      setSelection: setUsersSelection,
      setBufferSelection: setUsersBufferSelection,

      selection,
      bufferSelection,
    } = usersStore!;

    const { getUsersChangeTypeOptions, getUserContextOptions } =
      contextOptionsStore!;

    const { showStorageInfo } = currentQuotaStore;
    const { standalone } = settingsStore;

    const userSelection = selection.length
      ? selection.length > 1
        ? selection
        : selection[0]
      : bufferSelection;

    return {
      canChangeUserType,

      setUsersSelection,
      setUsersBufferSelection,

      getUserContextOptions,
      getUsersChangeTypeOptions,

      showStorageInfo,
      standalone,

      userSelection,
    };
  },
)(observer(Users));
