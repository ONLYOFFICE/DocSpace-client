import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { Avatar } from "@docspace/shared/components/avatar";
import {
  ContextMenu,
  ContextMenuModel,
} from "@docspace/shared/components/context-menu";
import { useState, useRef } from "react";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { inject, observer } from "mobx-react";
import { EmployeeStatus } from "@docspace/shared/enums";
import { useTranslation } from "react-i18next";

interface GroupMemberProps {
  userId: string;
  isManager?: boolean;
  groupMember: {
    id: string;
    displayName: string;
    email: string;
    role: string;
    avatarSmall: string;
    status: EmployeeStatus;
  };

  getUserRole: (user: any) => string;
  getStatusType: (user: any) => string;

  getUserContextOptions: (
    isMySelf: boolean,
    statusType: any,
    userRole: any,
    status: EmployeeStatus
  ) => string[];

  getUserContextOptionsModel: (
    t: any,
    options: string[],
    item: any
  ) => ContextMenuModel[];
}

const GroupMember = ({
  userId,
  groupMember,
  isManager,
  getUserRole,
  getStatusType,
  getUserContextOptions,
  getUserContextOptionsModel,
}: GroupMemberProps) => {
  const { t } = useTranslation([
    "People",
    "Profile",
    "PeopleTranslations",
    "ProfileAction",
    "Common",
  ]);

  const iconRef = useRef(null);
  const buttonMenuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const onClick = (e) => {
    if (!isOpen) buttonMenuRef?.current?.show(e);
    else buttonMenuRef?.current?.hide(e);
    setIsOpen(!isOpen);
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const model = getUserContextOptionsModel(
    t,
    getUserContextOptions(
      groupMember.id === userId,
      getStatusType(groupMember),
      getUserRole(groupMember),
      groupMember.status
    ),
    groupMember
  );

  return (
    <div className="group-member">
      <Avatar
        className="avatar"
        role={groupMember.role || "user"}
        size={"min"}
        source={groupMember.avatarSmall}
      />

      <div className="main-wrapper">
        <div className="name-wrapper">
          <div className="name" style={{}} title={groupMember.displayName}>
            {groupMember.displayName}
          </div>
        </div>
        <div className="email" title={groupMember.email}>
          {groupMember.email}
        </div>
      </div>

      <div className="context-btn-wrapper">
        {isManager && <div className="group-manager-tag">Head of group</div>}

        <div className="context-btn" ref={iconRef}>
          <ContextMenuButton
            isFill
            className="expandButton"
            directionX="right"
            displayType="toggle"
            onClick={onClick}
            getData={() => model}
          />
          <ContextMenu
            model={model}
            containerRef={iconRef}
            ref={buttonMenuRef}
            onHide={onHide}
            scaled={false}
            leftOffset={-8}
            topOffset={8}
          />
        </div>
      </div>
    </div>
  );
};

export default inject(({ peopleStore }) => ({
  userId: peopleStore.userStore.user.id,
  getUserRole: peopleStore.getUserRole,
  getStatusType: peopleStore.getStatusType,
  getUserContextOptions: peopleStore.usersStore.getUserContextOptions,
  getUserContextOptionsModel:
    peopleStore.contextOptionsStore.getUserContextOptions,
}))(GroupMember);
