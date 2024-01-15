import { Avatar } from "@docspace/shared/components/avatar";
import * as Styled from "./index.styled";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { ReactSVG } from "react-svg";

interface GroupMemberRowProps {
  groupMember: {
    avatarSmall: string;
    displayName: string;
    email: string;
  };
  onClickRemove: () => void;
}

const GroupMemberRow = ({
  groupMember,
  onClickRemove,
}: GroupMemberRowProps) => {
  console.log(groupMember);
  return (
    <Styled.GroupMemberRow>
      <Avatar
        className={"avatar"}
        size={"min"}
        source={groupMember.avatarSmall || groupMember.avatar}
      />
      <div className="info">
        <div className="name">{groupMember.displayName}</div>
        <div className="email">{groupMember.email}</div>
      </div>
      <ReactSVG
        className="remove-icon"
        src={RemoveReactSvgUrl}
        onClick={onClickRemove}
      />
    </Styled.GroupMemberRow>
  );
};

export default GroupMemberRow;
