import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import * as Styled from "../../styles/groups.styled";
import { Text } from "@docspace/shared/components/text";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { StyledAccountContent } from "../../styles/accounts";
import withLoader from "@docspace/client/src/HOCs/withLoader";
import Loaders from "@docspace/common/components/Loaders";
import { Avatar } from "@docspace/shared/components/avatar";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { IconButton } from "@docspace/shared/components/icon-button";
import { useState, useRef } from "react";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import GroupMember from "./GroupMember";

const Groups = ({ t, selection, peopleList }) => {
  const sortedArr = selection?.members?.reduce((acc, element) => {
    console.log(element, selection.manager.id);
    if (element.id === selection.manager.id) return [element, ...acc];
    return [...acc, element];
  }, []);

  return (
    <Styled.GroupsContent>
      {sortedArr?.map((groupMember) => {
        const [user] = peopleList.filter(
          (person) => person.id === groupMember.id
        );
        return (
          <GroupMember
            groupMember={user}
            isManager={user.id === selection.manager.id}
          />
        );
      })}
      {/* <Text className={"info_field first-row"} noSelect title={t("Data")}>
          {t("ConnectDialog:Account")}
        </Text>
        <Text
          className={"info_data first-row"}
          fontSize={"13px"}
          fontWeight={600}
          noSelect
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
        </Text> */}
    </Styled.GroupsContent>
  );
};

export default inject(({ auth, peopleStore, accessRightsStore }) => ({
  peopleList: peopleStore.usersStore.peopleList,
  //   const { isOwner, isAdmin, id: selfId } = auth.userStore.user,
  //   const { changeType: changeUserType, usersStore } = peopleStore,
  //   const { canChangeUserType } = accessRightsStore,

  //   const { setSelection } = auth.infoPanelStore;

  //   return {
  //     isOwner,
  //     isAdmin,
  //     changeUserType,
  //     selfId,
  //     canChangeUserType,
  //     loading: usersStore.operationRunning,
  //     getPeopleListItem: usersStore.getPeopleListItem,
  //     setSelection,
  //   };
}))(
  withTranslation([])(
    withLoader(observer(Groups))(
      <Loaders.InfoPanelViewLoader view="accounts" />
    )
  )
);
