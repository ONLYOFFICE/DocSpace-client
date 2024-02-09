import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import withLoader from "@docspace/client/src/HOCs/withLoader";
import Loaders from "@docspace/common/components/Loaders";
import { Link } from "@docspace/shared/components/link";

import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";

import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import { StyledAccountContent } from "../../styles/accounts";
import { getUserTypeLabel } from "@docspace/shared/utils/common";

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
  } = props;

  const navigate = useNavigate();

  const [statusLabel, setStatusLabel] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const { role, id, isVisitor, isCollaborator } = infoPanelSelection;

  React.useEffect(() => {
    getStatusLabel();
  }, [infoPanelSelection, getStatusLabel]);

  const getStatusLabel = React.useCallback(() => {
    const status = getUserStatus(infoPanelSelection);
    switch (status) {
      case "active":
        return setStatusLabel(t("Common:Active"));
      case "pending":
        return setStatusLabel(t("PeopleTranslations:PendingTitle"));
      case "disabled":
        return setStatusLabel(t("Settings:Disabled"));
      default:
        return setStatusLabel(t("Common:Active"));
    }
  }, [infoPanelSelection]);

  const getTypesOptions = React.useCallback(() => {
    const options = [];

    const adminOption = {
      id: "info-account-type_docspace-admin",
      key: "admin",
      title: t("Common:DocSpaceAdmin"),
      label: t("Common:DocSpaceAdmin"),
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
      title: t("Common:PowerUser"),
      label: t("Common:PowerUser"),
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

  const typeLabel = React.useCallback(() => getUserTypeLabel(role, t), [])();

  const renderTypeData = () => {
    const typesOptions = getTypesOptions();

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
        manualWidth={"fit-content"}
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

  const statusText = isVisitor ? t("Common:Free") : t("Common:Paid");

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

          {/* <Text className={"info_field"} noSelect title={t("Common:Room")}>
            {t("Common:Room")}
          </Text>
          <div>Rooms list</div> */}

          <Text
            className={"info_field info_field_groups"}
            noSelect
            title={t("Department")}
          >
            {t("Department")}
          </Text>

          <div className={"info_groups"}>
            {infoPanelSelection?.groups?.map((group) => (
              <Link
                key={group.id}
                className={"info_data first-row info_group"}
                isHovered={true}
                fontSize={"13px"}
                lineHeight={"20px"}
                fontWeight={600}
                title={group.name}
                onClick={() => onGroupClick(group.id)}
              >
                {group.name}
              </Link>
            ))}
          </div>
        </div>
      </StyledAccountContent>
    </>
  );
};

export default inject(
  ({ userStore, peopleStore, accessRightsStore, infoPanelStore }) => {
    const { isOwner, isAdmin, id: selfId } = userStore.user;
    const { changeType: changeUserType, usersStore } = peopleStore;
    const { canChangeUserType } = accessRightsStore;

    const { setInfoPanelSelection } = infoPanelStore;

    const {
      setSelection: setPeopleSelection,
      setBufferSelection: setPeopleBufferSelection,
    } = peopleStore.selectionStore;

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
  ])(
    withLoader(observer(Accounts))(
      <Loaders.InfoPanelViewLoader view="accounts" />,
    ),
  ),
);
