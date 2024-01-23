import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { Avatar } from "@docspace/shared/components/avatar";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { useState, useRef } from "react";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";

interface GroupMemberProps {
  isManager: boolean;
  groupMember: {
    id: string;
    displayName: string;
    email: string;
    role: "string";
  };
}

const GroupMember = ({ groupMember, isManager }: GroupMemberProps) => {
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

  const model = [
    groupMember.id === "66faa6e4-f133-11ea-b126-00ffeec8b4ef"
      ? {
          key: "user-menu-profile",
          icon: "http://192.168.0.104/static/images/profile.react.svg",
          label: "Profile",
        }
      : {
          key: "info",
          icon: InfoReactSvgUrl,
          label: "Info",
        },
    {
      key: "room-list",
      icon: FolderReactSvgUrl,
      label: "Room List",
    },
  ];

  return (
    <div className="group-member">
      <Avatar
        className="avatar"
        role={groupMember.role || "user"}
        size={"min"}
        source={DefaultUserPhoto}
      />

      <div className="main-wrapper">
        <div className="name-wrapper">
          <div className="name" style={{}}>
            {groupMember.displayName}
          </div>
        </div>
        <div className="email">{groupMember.email}</div>
      </div>

      <div ref={iconRef} className="context-btn-wrapper">
        {isManager && <div className="group-manager-tag">Head of group</div>}

        <div className="context-btn">
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

export default GroupMember;
