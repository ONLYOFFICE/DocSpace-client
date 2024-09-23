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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import withLoader from "@docspace/client/src/HOCs/withLoader";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import { Link } from "@docspace/shared/components/link";

import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import { StyledAccountContent } from "../../styles/accounts";
import { getUserTypeLabel } from "@docspace/shared/utils/common";

import { EmployeeStatus } from "@docspace/shared/enums";

const Accounts = (props) => {
  const {
    t,
    infoPanelSelection,
    isOwner,
    isAdmin,
    changeUserType,
    canChangeUserType,
    setInfoPanelSelection,
    getPeopleListItem,
    setPeopleSelection,
    setPeopleBufferSelection,

    showStorageInfo,
    standalone,
  } = props;

  const navigate = useNavigate();

  const [statusLabel, setStatusLabel] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const { role, id, isVisitor, isCollaborator } = infoPanelSelection;

  React.useEffect(() => {
    getStatusLabel();
  }, [infoPanelSelection, getStatusLabel]);

  const getStatusLabel = React.useCallback(() => {
    switch (infoPanelSelection?.status) {
      case EmployeeStatus.Active:
        return setStatusLabel(t("Common:Active"));
      case EmployeeStatus.Pending:
        return setStatusLabel(t("PeopleTranslations:PendingInviteTitle"));
      case EmployeeStatus.Disabled:
        return setStatusLabel(t("PeopleTranslations:DisabledEmployeeStatus"));
      default:
        return setStatusLabel(t("Common:Active"));
    }
  }, [infoPanelSelection]);

  const getTypesOptions = React.useCallback(() => {
    const options = [];

    const adminOption = {
      id: "info-account-type_portal-admin",
      key: "admin",
      title: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      label: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      action: "admin",
    };
    const managerOption = {
      id: "info-account-type_room-admin",
      key: "manager",
      title: t("Common:RoomAdmin"),
      label: t("Common:RoomAdmin"),
      action: "manager",
    };
    const collaboratorOption = {
      id: "info-account-type_collaborator",
      key: "collaborator",
      title: t("Common:User"),
      label: t("Common:User"),
      action: "collaborator",
    };
    const userOption = {
      id: "info-account-type_user",
      key: "user",
      title: t("Common:User"),
      label: t("Common:User"),
      action: "user",
    };

    isOwner && options.push(adminOption);

    options.push(managerOption);

    if (isVisitor || isCollaborator) options.push(collaboratorOption);

    isVisitor && options.push(userOption);

    return options;
  }, [t, isAdmin, isOwner, isVisitor, isCollaborator]);

  const onAbort = () => {
    setIsLoading(false);
  };

  const onSuccess = (users) => {
    if (users) {
      const items = [];
      users.map((u) => items.push(getPeopleListItem(u)));
      if (items.length === 1) {
        setInfoPanelSelection(getPeopleListItem(items[0]));
      } else {
        setInfoPanelSelection(items);
      }
    }
    setIsLoading(false);
  };

  const onTypeChange = React.useCallback(
    ({ action }) => {
      setIsLoading(true);
      if (!changeUserType(action, [infoPanelSelection], onSuccess, onAbort)) {
        setIsLoading(false);
      }
    },
    [infoPanelSelection, changeUserType, t],
  );

  const onGroupClick = (groupId) => {
    navigate(`/accounts/groups/${groupId}/filter`);
    setPeopleSelection([]);
    setPeopleBufferSelection(null);
  };

  const renderTypeData = () => {
    const typesOptions = getTypesOptions();

    const typeLabel = getUserTypeLabel(role, t);

    const combobox = (
      <ComboBox
        id="info-account-type-select"
        className="type-combobox"
        selectedOption={
          typesOptions.find((option) => option.key === role) || {}
        }
        options={typesOptions}
        onSelect={onTypeChange}
        scaled={false}
        size="content"
        displaySelectedOption
        modernView
        manualWidth="auto"
        isLoading={isLoading}
      />
    );

    const text = (
      <Text
        type="page"
        title={typeLabel}
        fontSize="13px"
        fontWeight={600}
        truncate
        noSelect
      >
        {typeLabel}
      </Text>
    );

    const status = getUserStatus(infoPanelSelection);

    const canChange = canChangeUserType({
      ...infoPanelSelection,
      statusType: status,
    });

    return canChange ? combobox : text;
  };

  const typeData = renderTypeData();

  const statusText =
    isVisitor || isCollaborator ? t("Common:Free") : t("Common:Paid");

  return (
    <>
      <StyledAccountContent>
        <div className="data__header">
          <Text className={"header__text"} noSelect title={t("Data")}>
            {t("InfoPanel:Data")}
          </Text>
        </div>
        <div className="data__body">
          <Text className={"info_field first-row"} noSelect title={t("Data")}>
            {t("ConnectDialog:Account")}
          </Text>
          <Text
            className={"info_data first-row"}
            fontSize={"13px"}
            fontWeight={600}
            noSelect
            title={statusLabel}
          >
            {statusLabel}
          </Text>

          <Text className={"info_field"} noSelect title={t("Common:Type")}>
            {t("Common:Type")}
          </Text>
          {typeData}

          {!standalone && (
            <>
              <Text className={"info_field"} noSelect title={t("UserStatus")}>
                {t("UserStatus")}
              </Text>
              <Text
                className={"info_data first-row"}
                fontSize={"13px"}
                fontWeight={600}
                noSelect
                title={statusLabel}
              >
                {statusText}
              </Text>
            </>
          )}
          {showStorageInfo && (
            <>
              <Text
                className={"info_field"}
                noSelect
                title={t("Common:Storage")}
              >
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
          )}

          {/* <Text className={"info_field"} noSelect title={t("Common:Room")}>
            {t("Common:Room")}
          </Text>
          <div>Rooms list</div> */}

          {infoPanelSelection?.groups?.length && (
            <>
              <Text
                className={`info_field info_field_groups`}
                noSelect
                title={t("Common:Group")}
              >
                {t("Common:Group")}
              </Text>

              <div className={"info_groups"}>
                {infoPanelSelection.groups.map((group) => (
                  <Link
                    key={group.id}
                    className={"info_data info_group"}
                    isHovered={true}
                    fontSize={"13px"}
                    lineHeight={"20px"}
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
          )}
        </div>
      </StyledAccountContent>
    </>
  );
};

export default inject(
  ({
    userStore,
    peopleStore,
    accessRightsStore,
    infoPanelStore,
    currentQuotaStore,
    settingsStore,
  }) => {
    const { isOwner, isAdmin, id: selfId } = userStore.user;
    const { changeType: changeUserType, usersStore } = peopleStore;
    const { canChangeUserType } = accessRightsStore;

    const { setInfoPanelSelection } = infoPanelStore;

    const {
      setSelection: setPeopleSelection,
      setBufferSelection: setPeopleBufferSelection,
    } = peopleStore.selectionStore;

    const { showStorageInfo } = currentQuotaStore;
    const { standalone } = settingsStore;

    return {
      isOwner,
      isAdmin,
      changeUserType,
      selfId,
      canChangeUserType,
      loading: usersStore.operationRunning,
      getPeopleListItem: usersStore.getPeopleListItem,
      setInfoPanelSelection,
      setPeopleSelection,
      setPeopleBufferSelection,
      showStorageInfo,
      standalone,
    };
  },
)(
  withTranslation([
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
  ])(withLoader(observer(Accounts))(<InfoPanelViewLoader view="accounts" />)),
);
