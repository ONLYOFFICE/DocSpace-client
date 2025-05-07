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

import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { getFetchedRoomParams } from "@docspace/shared/utils/rooms";
import {
  getRoomMembers,
  getTemplateAvailable,
} from "@docspace/shared/api/rooms";
import { EditRoomDialog } from "../dialogs";

const EditRoomEvent = ({
  visible,
  onClose,
  item,
  fetchTags,
  getThirdPartyIcon,
  setCreateRoomDialogVisible,
  isDefaultRoomsQuotaSet,
  cover,
  onSaveEditRoom,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [fetchedTags, setFetchedTags] = useState([]);
  const [fetchedImage, setFetchedImage] = useState(null);
  const [accessItems, setAccessItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const fetchedRoomParams = getFetchedRoomParams(
    item,
    getThirdPartyIcon,
    isDefaultRoomsQuotaSet,
  );

  const onSave = async (roomParams) => {
    setIsLoading(true);

    await onSaveEditRoom(t, roomParams, item);

    setIsLoading(false);
    onClose();
  };

  const fetchLogoAction = useCallback(async (logo) => {
    const imgExst = logo.slice(".")[1];
    const file = await fetch(logo)
      .then((res) => res.arrayBuffer())
      .then(
        (buf) =>
          new File([buf], "fetchedFile", {
            type: `image/${imgExst}`,
          }),
      );
    setFetchedImage(file);
  }, []);

  const getTemplateMembers = useCallback(async () => {
    const templateMembersData = await getRoomMembers(item.id, {});

    if (templateMembersData?.items?.length) {
      const convertedItems = templateMembersData.items.map(
        ({ access, isOwner, sharedTo }) => {
          return {
            templateAccess: access,
            templateIsOwner: isOwner,
            ...sharedTo,
          };
        },
      );
      setAccessItems(convertedItems);
    }
  }, []);

  const getTemplateIsAvailable = useCallback(() => {
    getTemplateAvailable(item.id)
      .then((available) => setIsAvailable(available))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setCreateRoomDialogVisible(true);
    setIsInitLoading(true);

    const logo = item?.logo?.original ? item.logo.original : "";

    const requests = [fetchTags()];

    if (item.isTemplate) {
      requests.push(getTemplateMembers());
      requests.push(getTemplateIsAvailable());
    }

    if (logo) requests.push(fetchLogoAction);

    const fetchInfo = async () => {
      const [tags] = await Promise.all(requests);

      setFetchedTags(tags);

      setIsInitLoading(false);
    };

    fetchInfo();

    return () => setCreateRoomDialogVisible(false);
  }, []);

  return (
    <EditRoomDialog
      t={t}
      visible={visible}
      onClose={onClose}
      fetchedRoomParams={fetchedRoomParams}
      onSave={onSave}
      fetchedTags={fetchedTags}
      fetchedImage={fetchedImage}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      isInitLoading={isInitLoading}
      cover={cover}
      item={item}
      isTemplate={item.isTemplate}
      accessItems={accessItems}
      templateIsAvailable={isAvailable}
    />
  );
};

export default inject(
  ({
    tagsStore,
    dialogsStore,
    filesSettingsStore,
    currentQuotaStore,
    createEditRoomStore,
  }) => {
    const { fetchTags } = tagsStore;

    const { getThirdPartyIcon } = filesSettingsStore.thirdPartyStore;
    const { setCreateRoomDialogVisible, cover } = dialogsStore;

    const { isDefaultRoomsQuotaSet } = currentQuotaStore;
    const { onSaveEditRoom } = createEditRoomStore;

    return {
      isDefaultRoomsQuotaSet,
      fetchTags,
      getThirdPartyIcon,
      setCreateRoomDialogVisible,

      cover,
      onSaveEditRoom,
    };
  },
)(observer(EditRoomEvent));
