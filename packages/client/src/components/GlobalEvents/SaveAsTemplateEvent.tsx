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

import { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";

import CreateRoomTemplate from "../dialogs/CreateRoomTemplate/CreateRoomTemplate";

type SaveAsTemplateEventProps = {
  visible: boolean;
  item: TRoom;
  fetchTags: () => TRoom["tags"];
  setTemplateEventVisible: (visible: boolean) => void;
  getThirdPartyIcon: (provider: string) => string;
  isDefaultRoomsQuotaSet: boolean;
  onClose: VoidFunction;
  onSaveAsTemplate: (
    item: TRoom,
    roomParams: TRoom,
    open: boolean,
  ) => Promise<{
    error: string;
    isCompleted: boolean;
    progress: number;
    templateId: number;
  }>;
};

const SaveAsTemplateEvent = (props: SaveAsTemplateEventProps) => {
  const {
    visible,
    item,
    fetchTags,
    setTemplateEventVisible,
    getThirdPartyIcon,
    isDefaultRoomsQuotaSet,
    onClose,
    onSaveAsTemplate,
  } = props;

  const { t } = useTranslation(["Files"]);

  const [fetchedTags, setFetchedTags] = useState<TRoom["tags"]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const startTags = Object.values(item.tags);
  const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));

  const fetchedRoomParams = {
    title: item.title,
    type: item.roomType,
    tags: startObjTags,
    isThirdparty: !!item.providerKey,
    storageLocation: {
      title: item.title,
      parentId: item.parentId,
      providerKey: item.providerKey,
      iconSrc: getThirdPartyIcon(item.providerKey || ""),
    },
    isPrivate: false,
    icon: {
      uploadedFile: item?.logo?.original,
      tmpFile: "",
      x: 0.5,
      y: 0.5,
      zoom: 1,
    },
    roomOwner: item.createdBy,
    canChangeRoomOwner: item?.security?.ChangeOwner || false,
    indexing: item.indexing,
    logo: item.logo,
    lifetime: item.lifetime,
    denyDownload: item.denyDownload,
    watermark: item.watermark,
    ...(isDefaultRoomsQuotaSet && {
      quota: item.quotaLimit,
    }),
  };

  const fetchTagsAction = useCallback(async () => {
    try {
      const tags = await fetchTags();
      setFetchedTags(tags);
    } catch (err) {
      toastr.error(err as TData);
    }
  }, []);

  const onSave = async (roomParams: TRoom, openCreatedTemplate: boolean) => {
    setIsLoading(true);

    onSaveAsTemplate(item, roomParams, openCreatedTemplate)
      .then(() => {
        toastr.success(
          <Trans
            t={t}
            ns="Files"
            i18nKey="SaveAsTemplateToast"
            values={{
              title: roomParams.title,
            }}
            components={{
              1: <Text as="span" fontWeight={600} fontSize="12px" />,
            }}
          />,
        );
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  useEffect(() => {
    setTemplateEventVisible(true);

    return () => {
      setTemplateEventVisible(false);
    };
  }, []);

  useEffect(() => {
    fetchTagsAction();
  }, [fetchTagsAction]);

  const onCloseEvent = () => {
    onClose();

    setTemplateEventVisible(false);
  };

  return (
    <CreateRoomTemplate
      visible={visible}
      item={item}
      onClose={onCloseEvent}
      fetchedTags={fetchedTags}
      fetchedRoomParams={fetchedRoomParams as unknown as TRoom}
      onSave={onSave}
      isLoading={isLoading}
    />
  );
};

export default inject<TStore>(
  ({
    tagsStore,
    dialogsStore,
    filesSettingsStore,
    currentQuotaStore,
    createEditRoomStore,
  }) => {
    const { fetchTags } = tagsStore;
    const { setTemplateEventVisible } = dialogsStore;
    const { getThirdPartyIcon } = filesSettingsStore.thirdPartyStore;
    const { isDefaultRoomsQuotaSet } = currentQuotaStore;
    const { onSaveAsTemplate } = createEditRoomStore;

    return {
      fetchTags,
      setTemplateEventVisible,
      getThirdPartyIcon,
      isDefaultRoomsQuotaSet,
      onSaveAsTemplate,
    };
  },
)(observer(SaveAsTemplateEvent));
