import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";

import ModalDialog from "@docspace/components/modal-dialog";
import Backdrop from "@docspace/components/backdrop";
import Aside from "@docspace/components/aside";
import Header from "@docspace/components/selector/sub-components/Header";
import Body from "@docspace/components/selector/sub-components/Body";

import Selector from "@docspace/components/selector";
import PeopleSelector from "@docspace/client/src/components/PeopleSelector";
import Link from "@docspace/components/link";
import { AddUserToRoomPanel } from "../index";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const StyledBlock = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 16px 16px 16px;

  .role {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    color: #657077;
  }
`;

const InviteUserForRolePanel = ({
  visible,
  currentRole,
  onClose,
  getRoomMembers,
  roomId,
  onSelectUserForRole,
  setVisibleInviteUserForRolePanel,
  updateRoomMembers,
}) => {
  const [members, setMembers] = useState([]);

  const [isBackButtonPressed, setIsBackButtonPressed] = useState(false);
  const [addUserToRoomVisible, setAddUserToRoomVisible] = useState(false);

  const fetchMembers = async (roomId) => {
    let data = await getRoomMembers(roomId);

    data = data.filter((m) => m.sharedTo.email || m.sharedTo.displayName);

    let inRoomMembers = [];
    data.map((fetchedMember) => {
      const member = {
        label: fetchedMember.sharedTo.displayName,
        ...fetchedMember.sharedTo,
      };
      inRoomMembers.push(member);
    });

    setMembers(inRoomMembers);
  };

  useEffect(() => {
    fetchMembers();

    return () => {
      setIsBackButtonPressed(false);
    };
  }, [addUserToRoomVisible]);

  const onBackClickAction = () => {
    setIsBackButtonPressed(true);
  };

  const onOpenAddUserToRoom = () => {
    setAddUserToRoomVisible(true);
  };

  const onCloseAddUserToRoom = () => {
    setAddUserToRoomVisible(false);
  };

  const blockNode = (
    <StyledBlock>
      <div className="role">({currentRole})</div>
      <Link
        fontWeight="600"
        type="action"
        isHovered
        onClick={onOpenAddUserToRoom}
      >
        Add user to room
      </Link>
    </StyledBlock>
  );

  console.log("members", members);

  return (
    <>
      <Backdrop
        onClose={onClose}
        visible={visible && !isBackButtonPressed}
        zIndex={410}
        isAside={true}
      />
      <Aside
        className="header_aside-panel"
        visible={visible && !isBackButtonPressed}
        onClose={onClose}
        withoutBodyScroll
        zIndex={410}
      >
        {!addUserToRoomVisible && (
          // <PeopleSelector
          //   headerLabel="Invite user for role"
          //   onBackClickAction={onBackClickAction}
          //   items={members}
          //   placeholder="Search users"
          //   zIndex={410}
          //   selectByClick={true}
          //   onSelectUserForRole={onSelectUserForRole}
          //   blockNode={blockNode}
          // />

          <Selector
            headerLabel={"Invite user for role"}
            onBackClick={onBackClickAction}
            items={members}
            placeholder="Search users"
            zIndex={410}
            selectByClick={true}
            onSelectUserForRole={onSelectUserForRole}
            blockNode={blockNode}
          />
        )}
      </Aside>

      {addUserToRoomVisible && (
        <AddUserToRoomPanel
          visible={addUserToRoomVisible}
          onClose={onCloseAddUserToRoom}
        />
      )}
    </>
  );
};

export default inject(({ filesStore, auth }) => {
  const { getRoomMembers } = filesStore;
  const { updateRoomMembers } = auth.infoPanelStore;

  return {
    getRoomMembers,
    updateRoomMembers,
  };
})(withTranslation(["Common"])(observer(InviteUserForRolePanel)));
