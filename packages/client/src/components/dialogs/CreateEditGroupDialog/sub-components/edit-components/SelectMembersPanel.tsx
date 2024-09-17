import React from "react";
import { inject, observer } from "mobx-react";

import { TUser } from "@docspace/shared/api/people/types";
import EditGroupStore from "SRC_DIR/store/EditGroupStore";

import { MembersSelector } from "../MembersSelector/MembersSelector";

type InjectedProps = Pick<
  EditGroupStore,
  "group" | "removedMembersMap" | "addedMembersMap"
>;

type SelectMembersPanelProps = {
  isVisible: boolean;
  onClose: () => void;
  onParentPanelClose: () => void;
  addMembers: (members: TUser[]) => void;

  injectedProps?: InjectedProps;
};

const Panel = ({
  isVisible,
  onClose,
  onParentPanelClose,
  addMembers,

  injectedProps,
}: SelectMembersPanelProps) => {
  const { addedMembersMap, removedMembersMap, group } = injectedProps!;

  const checkIfUserInvited = (user: TUser) => {
    if (removedMembersMap.has(user.id)) {
      return false;
    }

    if (addedMembersMap.has(user.id)) {
      return true;
    }

    return Boolean(user.groups?.find((g) => g.id === group?.id));
  };

  return (
    <MembersSelector
      isVisible={isVisible}
      onClose={onClose}
      onParentPanelClose={onParentPanelClose}
      addMembers={addMembers}
      checkIfUserInvited={checkIfUserInvited}
    />
  );
};

export const SelectMembersPanel = inject<{ editGroupStore: EditGroupStore }>(
  ({ editGroupStore }) => {
    const { group, removedMembersMap, addedMembersMap } = editGroupStore;

    return { injectedProps: { group, removedMembersMap, addedMembersMap } };
  },
)(observer(Panel));
