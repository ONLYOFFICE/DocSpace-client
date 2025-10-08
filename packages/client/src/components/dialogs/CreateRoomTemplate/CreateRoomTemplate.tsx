// (c) Copyright Ascensio System SIA 2009-2024
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
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { TUser } from "@docspace/shared/api/people/types";
import { TRoomParams, TRoomTagsParams } from "@docspace/shared/utils/rooms";

import TagHandler from "../../../helpers/TagHandler";
import SetRoomParams from "../CreateEditRoomDialog/sub-components/SetRoomParams";
import { StyledFooter } from "./CreateRoomTemplate.styled";
import TemplateAccessSettingsPanel from "../../panels/TemplateAccessSettingsPanel";
import TemplateAccessSelector from "../../TemplateAccessSelector";

type CreateRoomTemplateProps = {
  visible: boolean;
  onClose: VoidFunction;
  onSave: (params: TRoom, open: boolean) => void;
  item: TRoom;
  fetchedTags: TRoom["tags"];
  fetchedRoomParams: TRoomParams;
  isLoading: boolean;
};

const CreateRoomTemplate = (props: CreateRoomTemplateProps) => {
  const {
    visible,
    onClose,
    onSave,
    item,
    fetchedTags,
    fetchedRoomParams,
    isLoading,
  } = props;

  const [roomParams, setRoomParams] = useState<TRoomParams | TSelectorItem[]>({
    ...fetchedRoomParams,
  });
  const [inviteItems, setInviteItems] = useState([
    { ...item.createdBy, templateIsOwner: true },
  ]);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const [openCreatedIsChecked, setOpenCreatedIsChecked] = useState(true);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [accessSettingsIsVisible, setAccessSettingsIsVisible] = useState(false);
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const setRoomType = (newRoomType: RoomsType) =>
    setRoomParams((prev) => ({
      ...prev,
      type: newRoomType,
    }));

  const onCreateRoomTemplate = () => {
    // Check if roomParams is a TRoom object (has a title property) and not an array
    if (!roomParams || Array.isArray(roomParams) || !("title" in roomParams)) {
      console.error("Room parameters are in an invalid format");
      return;
    }

    if (!roomParams.title.trim()) {
      setIsValidTitle(false);
      return;
    }

    // Now TypeScript knows roomParams is a TRoom-like object
    onSave(
      { ...roomParams, isAvailable } as unknown as TRoom,
      openCreatedIsChecked,
    );
  };

  const setRoomTags = (newTags: TRoomTagsParams[]) => {
    setRoomParams({ ...roomParams, tags: newTags });
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (isWrongTitle) return;
    if (e.key === "Enter") onCreateRoomTemplate();
  };

  const onChangeOpenCreated = () => {
    setOpenCreatedIsChecked(!openCreatedIsChecked);
  };

  const onOpenAccessSettings = () => {
    setAccessSettingsIsVisible(true);
  };

  const onCloseAccessSettings = () => {
    setAccessSettingsIsVisible(false);
  };

  const onCloseAddUsersPanel = () => {
    setAddUsersPanelVisible(false);
  };

  const onSetAccessSettings = () => {
    onCloseAccessSettings();

    const invitations = inviteItems
      .filter((i) => !i.templateIsOwner)
      .map((inviteItem) => {
        return {
          id: inviteItem.id,
          access: inviteItem.templateAccess ?? ShareAccessRights.ReadOnly,
        };
      });

    setRoomParams({ ...roomParams, invitations });
  };

  const checkIfUserInvited = (user: TUser) => {
    return inviteItems.findIndex((x) => x.id === user.id) > -1;
  };

  const onSubmitItems = (users: TSelectorItem[]) => {
    // Transform TSelectorItem objects to match the expected inviteItems format
    const mappedUsers = users.map((user) => ({
      ...user,
      templateIsOwner: false,
      avatarSmall: user.avatar || "",
      profileUrl: "", // Add the required profileUrl property
      displayName: user.displayName || "", // Ensure displayName is a string
      hasAvatar: !!user.avatar,
      templateAccess: 1, // Default access right (assuming 1 is ReadWrite)
    }));

    const items = [...inviteItems, ...mappedUsers];

    // Use type assertion since we've ensured the structure matches
    setInviteItems(items as typeof inviteItems);
    onCloseAddUsersPanel();
  };

  const tagHandler = new TagHandler(
    !Array.isArray(roomParams) && "tags" in roomParams ? roomParams.tags : [],
    setRoomTags,
    fetchedTags,
  );

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={visible}
      onClose={onClose}
      withFooterBorder
      withForm
      onSubmit={onCreateRoomTemplate}
      // withBodyScroll={!isTemplate}
      isScrollLocked={isScrollLocked}
      containerVisible={addUsersPanelVisible || accessSettingsIsVisible}
    >
      <ModalDialog.Container>
        {addUsersPanelVisible ? (
          <TemplateAccessSelector
            roomId={item.id}
            onSubmit={onSubmitItems}
            onClose={onClose}
            onBackClick={onCloseAddUsersPanel}
            checkIfUserInvited={checkIfUserInvited}
            onCloseClick={onClose}
          />
        ) : (
          <TemplateAccessSettingsPanel
            templateItem={item}
            setUsersPanelIsVisible={setAddUsersPanelVisible}
            onCloseAccessSettings={onCloseAccessSettings}
            onClosePanels={onClose}
            isContainer
            inviteItems={inviteItems}
            setInviteItems={setInviteItems}
            setIsVisible={setAccessSettingsIsVisible}
            onSetAccessSettings={onSetAccessSettings}
            templateIsAvailable={isAvailable}
            setTemplateIsAvailable={setIsAvailable}
          />
        )}
      </ModalDialog.Container>

      <ModalDialog.Header>
        <Text fontSize="21px" fontWeight={700}>
          {t("Files:SaveAsTemplate")}
        </Text>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <SetRoomParams
          isTemplate
          t={t}
          tagHandler={tagHandler}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          setRoomType={setRoomType}
          setIsScrollLocked={setIsScrollLocked}
          isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUp}
          onOpenAccessSettings={onOpenAccessSettings}
          createdBy={item.createdBy}
          inviteItems={inviteItems}
          templateIsAvailable={isAvailable}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <StyledFooter>
          <Checkbox
            label={t("Files:OpenCreatedTemplate")}
            isChecked={openCreatedIsChecked}
            onChange={onChangeOpenCreated}
            dataTestId="create_room_template_open_checkbox"
          />

          <div className="create-room-template_buttons">
            <Button
              id="create-room-template-modal_submit"
              tabIndex={5}
              label={t("Files:CreateTemplate")}
              size={ButtonSize.normal}
              primary
              scale
              isDisabled={isWrongTitle}
              isLoading={isLoading}
              type="submit"
            />
            <Button
              id="create-room-template-modal_cancel"
              tabIndex={5}
              label={t("Common:CancelButton")}
              size={ButtonSize.normal}
              scale
              isDisabled={isLoading}
              onClick={onClose}
            />
          </div>
        </StyledFooter>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default CreateRoomTemplate;
