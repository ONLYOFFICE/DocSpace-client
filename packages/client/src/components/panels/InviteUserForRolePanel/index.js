import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Aside from "@docspace/components/aside";
import Backdrop from "@docspace/components/backdrop";
import Selector from "@docspace/components/selector";
import PeopleSelector from "@docspace/client/src/components/PeopleSelector";
import Link from "@docspace/components/link";
import { AddUserToRoomPanel } from "../index";
import Portal from "@docspace/components/portal";
import RectangleLoader from "@docspace/common/components/Loaders/RectangleLoader";
import SelectorRowLoader from "@docspace/common/components/Loaders/SelectorRowLoader";
import SelectorSearchLoader from "@docspace/common/components/Loaders/SelectorSearchLoader";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";
import i18n from "./i18n";
import { withTranslation } from "react-i18next";

const StyledAside = styled(Aside)`
  .scroll-body {
    padding-right: 0 !important;
  }
`;

const StyledBlock = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 4px 16px 16px 16px;

  .role {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    color: ${(props) => props.theme.startFillingPanel.roleColor};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .add-user-to-room {
    white-space: nowrap;
    color: ${(props) => props.theme.startFillingPanel.addUserToRoomColor};
  }
`;

const InviteUserForRolePanel = ({
  visible,
  members,
  currentRole,
  onClose,
  onSelectUserForRole,
  onCloseInviteUserForRolePanel,
  addUserToRoomVisible,
  onOpenAddUserToRoom,
  onCloseAddUserToRoom,
  fetchMembers,
  isLoadingFetchMembers,
  roomId,
  theme,
  tReady,
}) => {
  const t = i18n.getFixedT(null, [
    "StartFillingPanel",
    "People",
    "PeopleSelector",
  ]);
  const [isShowLoader, setIsShowLoader] = useState(
    !members.length || isLoadingFetchMembers
  );

  useEffect(() => {
    setIsShowLoader(!members.length || isLoadingFetchMembers);
  }, [members.length, isLoadingFetchMembers]);

  const blockNode = (
    <StyledBlock>
      {tReady ? (
        <>
          <div className="role">({currentRole.title})</div>
          <Link
            className="add-user-to-room"
            fontWeight="600"
            type="action"
            isHovered
            onClick={onOpenAddUserToRoom}
          >
            {t("StartFillingPanel:AddUserToRoom")}
          </Link>
        </>
      ) : (
        <>
          <RectangleLoader width="140" height="22" />
          <RectangleLoader width="110" height="20" />
        </>
      )}
    </StyledBlock>
  );

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  return (
    <Portal
      element={
        <>
          <Backdrop strongBlur visible={visible} zIndex={310} isAside={true} />
          <StyledAside
            visible={visible}
            onClose={onClose}
            zIndex={310}
            isCloseable={false}
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
                headerLabel={t("StartFillingPanel:InviteUserForRole")}
                onBackClick={onCloseInviteUserForRolePanel}
                items={members}
                searchPlaceholder={t(
                  "StartFillingPanel:PlaceholderInviteUserForRole"
                )}
                rowLoader={
                  <SelectorRowLoader
                    isMultiSelect={false}
                    isContainer={isShowLoader}
                    isUser={true}
                  />
                }
                searchLoader={<SelectorSearchLoader />}
                emptyScreenImage={emptyScreenImage}
                emptyScreenHeader={t("PeopleSelector:EmptyHeader")}
                emptyScreenDescription={t("PeopleSelector:EmptyDescription")}
                searchEmptyScreenImage={emptyScreenImage}
                searchEmptyScreenHeader={t("People:NotFoundUsers")}
                searchEmptyScreenDescription={t(
                  "PeopleSelector:SearchEmptyDescription"
                )}
                selectByClick={true}
                onSelectUserForRole={onSelectUserForRole}
                blockNode={blockNode}
                isLoading={isShowLoader}
              />
            )}
          </StyledAside>

          {addUserToRoomVisible && (
            <AddUserToRoomPanel
              visible={addUserToRoomVisible}
              onClose={onCloseAddUserToRoom}
              existUsers={members}
              fetchMembers={fetchMembers}
              roomId={roomId}
            />
          )}
        </>
      }
    />
  );
};

export default withTranslation([
  "StartFillingPanel",
  "PeopleSelector",
  "People",
])(InviteUserForRolePanel);
