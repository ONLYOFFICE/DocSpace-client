// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { Aside } from "@docspace/shared/components/aside";
import styles from "./EditRoomGroupsDialog.module.scss";
import RoomSelector from "@docspace/shared/selectors/Room";
import { Backdrop } from "@docspace/shared/components/backdrop";
import GroupIconDialog from "./sub-components/GroupIconDialog";

const EditRoomGroupsDialog = ({
  currentColorScheme,
  getCovers,
  covers,
  setArrRoomGroups,
  setEditRoomGroupsDialogVisible,
  arrRoomGroups,
}) => {
  const { t } = useTranslation(["Common"]);

  const [isOpenRoomList, setIsOpenRoomList] = useState(false);
  const [isOpenGroupIcon, setIsOpenGroupIcon] = useState(false);

  const [arrIdsRooms, setArrIdsRooms] = useState(null);

  const onClickCreateNewGroup = () => {
    setIsOpenRoomList(true);
  };

  const onCloseRoomList = () => {
    setIsOpenRoomList(false);
  };

  const onCloseEditRoomGroupsDialog = () => {
    setEditRoomGroupsDialogVisible(false);
  };

  const onSubmitRoom = (items) => {
    console.log("onSubmitRoom", items);
    const arrIds = [];
    items.forEach((item) => arrIds.push(item.id));
    console.log("arrIds", arrIds);
    setArrIdsRooms(arrIds);
    setIsOpenGroupIcon(true);
  };

  if (isOpenGroupIcon) {
    return (
      <GroupIconDialog
        currentColorScheme={currentColorScheme}
        getCovers={getCovers}
        covers={covers}
        arrIdsRooms={arrIdsRooms}
        setArrRoomGroups={setArrRoomGroups}
        setIsOpenGroupIcon={setIsOpenGroupIcon}
        onCloseEditRoomGroupsDialog={onCloseEditRoomGroupsDialog}
      />
    );
  }

  if (isOpenRoomList) {
    return (
      <div>
        <Backdrop
          visible={isOpenRoomList}
          isAside
          withBackground
          zIndex={309}
          onClick={onCloseRoomList}
        />
        <Aside
          visible={isOpenRoomList}
          withoutBodyScroll
          zIndex={310}
          onClose={onCloseRoomList}
          withoutHeader
        >
          <RoomSelector
            onSubmit={onSubmitRoom}
            withHeader
            headerProps={{
              onBackClick: onCloseRoomList,
              onCloseClick: onCloseRoomList,
              headerLabel: "Room list",
              withoutBorder: false,
              withoutBackButton: false,
            }}
            withSearch
            isMultiSelect
            withCancelButton
          />
        </Aside>
      </div>
    );
  }

  const nodeAddedGroups = () => {
    return arrRoomGroups.map((item) => (
      <div key={item.id}>{item.groupName}</div>
    ));
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={true}
      className={styles.editRoomGroupsDialog}
      onClose={onCloseEditRoomGroupsDialog}
      // isScrollLocked={isScrollLocked}
      // hideContent={isOauthWindowOpen}
      // isTemplate={isTemplate}
      // isBackButton={roomParams.type}
      // onBackClick={goBack}
      // onSubmit={handleSubmit}
      // withForm
      // containerVisible={isTemplate ? templateDialogIsVisible : false}
    >
      <ModalDialog.Header>{"Edit room groups"}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.settingRoomGroups}>
          <div className={styles.roomGroups}>
            <div className={styles.title}>Room groups</div>
            <ToggleButton
              className={styles.roomGroupsToggle}
              // onChange={onClickPermissions}
              // isChecked={selectedEnableSchedule}
              // isDisabled={isLoadingData || !isEnableAuto || isInitialError}
            />
          </div>

          <Text className={styles.description}>
            You can group rooms into folders and easily switch between them. By
            disabling grouping, you can re-enable it in the profile settings.
          </Text>
        </div>
        <SelectorAddButton
          onClick={onClickCreateNewGroup}
          className={styles.selectorAddButton}
          label={"Create a new group"}
        />
        {/* <div className={styles.addedGroups}>{nodeAddedGroups()}</div> */}

        <div className={styles.addedGroups}>
          <div className={styles.group}>
            <div className={styles.groupData}>
              <div className={styles.iconGroup}>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7a1 1 0 0 1-.832-.445L7.465 3H3zM.879 1.879A3 3 0 0 1 3 1h5a1 1 0 0 1 .832.445L10.535 4H17a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V4a3 3 0 0 1 .879-2.121z"
                    fill="#657077"
                  />
                </svg>
              </div>

              <div className={styles.titleContainer}>
                <div className={styles.nameGroup}>MY groups</div>
                <div className={styles.countRooms}> 4 rooms </div>
              </div>
            </div>

            <div className={styles.editGroup}>Edit</div>
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="shared_create-room-modal_submit"
          tabIndex={5}
          label={"Save"}
          size="normal"
          primary
          scale
          // isDisabled={isRoomTitleChanged || isWrongTitle}
          // isLoading={isLoading}
          // type="submit"
          // onClick={onCreateRoom}
        />
        <Button
          id="shared_create-room-modal_cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          // isDisabled={isLoading}
          // onClick={onCloseAndDisconnectThirdparty}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditRoomGroupsDialog;
