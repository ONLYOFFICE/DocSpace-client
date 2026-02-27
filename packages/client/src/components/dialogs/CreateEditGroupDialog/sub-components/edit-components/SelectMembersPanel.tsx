import React from "react";
import { inject, observer } from "mobx-react";

import { TOnSubmit } from "@docspace/ui-kit/components/selector";
import type { PeopleSelectorProps } from "@docspace/ui-kit/selectors/People/PeopleSelector.types";

import EditGroupStore from "SRC_DIR/store/contacts/EditGroupStore";

import { MembersSelector } from "../MembersSelector/MembersSelector";

type InjectedProps = Pick<
  EditGroupStore,
  "group" | "removedMembersMap" | "addedMembersMap"
>;

type SelectMembersPanelProps = {
  onClose: () => void;
  onParentPanelClose: () => void;
  addMembers: TOnSubmit;

  injectedProps?: InjectedProps;
};

const Panel = ({
  onClose,
  onParentPanelClose,
  addMembers,

  injectedProps,
}: SelectMembersPanelProps) => {
  const { addedMembersMap, removedMembersMap, group } = injectedProps!;

  const checkIfUserInvited: NonNullable<
    PeopleSelectorProps["checkIfUserInvited"]
  > = (user) => {
    if (!user.id) return false;

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
      onClose={onClose}
      onParentPanelClose={onParentPanelClose}
      isVisible
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
