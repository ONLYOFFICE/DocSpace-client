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

import { useState, useEffect, useCallback, useRef, memo } from "react";

import { inject, observer } from "mobx-react";

import { FileAction } from "@docspace/shared/enums";
import { Events } from "@docspace/shared/enums";

import CreateEvent from "./CreateEvent";
import RenameEvent from "./RenameEvent";
import CreateRoomEvent from "./CreateRoomEvent";
import EditRoomEvent from "./EditRoomEvent";
import CreateGroupEvent from "./GroupEvents/CreateGroupEvent";
import EditGroupEvent from "./GroupEvents/EditGroupEvent";
import ChangeUserTypeEvent from "./ChangeUserTypeEvent";
import CreatePluginFile from "./CreatePluginFileEvent";
import ChangeQuotaEvent from "./ChangeQuotaEvent";
const GlobalEvents = ({ enablePlugins, eventListenerItemsList }) => {
  const [createDialogProps, setCreateDialogProps] = useState({
    visible: false,
    id: null,
    type: null,
    extension: null,
    title: "",
    templateId: null,
    fromTemplate: null,
    onClose: null,
  });

  const [renameDialogProps, setRenameDialogProps] = useState({
    visible: false,
    item: null,
    onClose: null,
  });

  const [createRoomDialogProps, setCreateRoomDialogProps] = useState({
    title: "",
    visible: false,
    onClose: null,
  });

  const [editRoomDialogProps, setEditRoomDialogProps] = useState({
    visible: false,
    item: null,
    onClose: null,
  });

  const [createGroupDialogProps, setCreateGroupDialogProps] = useState({
    visible: false,
    onClose: null,
  });

  const [editGroupDialogProps, setEditGroupDialogProps] = useState({
    visible: false,
    onClose: null,
  });

  const [changeUserTypeDialog, setChangeUserTypeDialogProps] = useState({
    visible: false,
    onClose: null,
  });
  const [changeQuotaDialog, setChangeQuotaDialogProps] = useState({
    visible: false,
    type: null,
    ids: null,
    bodyDescription: null,
    headerTitle: null,
  });
  const [createPluginFileDialog, setCreatePluginFileProps] = useState({
    visible: false,
    props: null,
    onClose: null,
  });

  const eventHandlersList = useRef([]);

  const onCreate = useCallback((e) => {
    const { payload } = e;

    const visible = payload.id ? true : false;

    setCreateDialogProps({
      visible: visible,
      id: payload.id,
      type: FileAction.Create,
      extension: payload.extension,
      title: payload.title || null,
      templateId: payload.templateId || null,
      fromTemplate: payload.fromTemplate || null,
      withoutDialog: payload.withoutDialog ?? false,
      preview: payload.preview ?? false,

      onClose: () => {
        setCreateDialogProps({
          visible: false,
          id: null,
          type: null,
          extension: null,
          title: "",
          templateId: null,
          fromTemplate: null,
          onClose: null,
          withoutDialog: false,
          preview: false,
        });
      },
    });
  }, []);

  const onRename = useCallback((e) => {
    const visible = e.item ? true : false;

    setRenameDialogProps({
      visible: visible,
      type: FileAction.Rename,
      item: e.item,
      onClose: () => {
        setRenameDialogProps({
          visible: false,
          type: null,
          item: null,
        });
      },
    });
  }, []);

  const onCreateRoom = useCallback((e) => {
    setCreateRoomDialogProps({
      title: e?.title,
      visible: true,
      onClose: () =>
        setCreateRoomDialogProps({ visible: false, onClose: null }),
    });
  }, []);

  const onEditRoom = useCallback((e) => {
    const visible = !!e.item;

    setEditRoomDialogProps({
      visible: visible,
      item: e.item,
      onClose: () => {
        setEditRoomDialogProps({
          visible: false,
          item: null,
          onClose: null,
        });
      },
    });
  }, []);

  const onCreateGroup = useCallback((e) => {
    setCreateGroupDialogProps({
      title: e?.title,
      visible: true,
      onClose: () =>
        setCreateGroupDialogProps({ title: "", visible: false, onClose: null }),
    });
  }, []);

  const onEditGroup = useCallback((e) => {
    const visible = !!e.item;

    setEditGroupDialogProps({
      visible: visible,
      item: e.item,
      onClose: () => {
        setEditGroupDialogProps({
          visible: false,
          item: null,
          onClose: null,
        });
      },
    });
  }, []);

  const onChangeUserType = useCallback((e) => {
    setChangeUserTypeDialogProps({
      visible: true,
      onClose: () => {
        setChangeUserTypeDialogProps({ visible: false, onClose: null });
      },
    });
  }, []);

  const onCreatePluginFileDialog = useCallback(
    (e) => {
      if (!enablePlugins) return;

      const { payload } = e;
      setCreatePluginFileProps({
        ...payload,
        visible: true,
        onClose: () => {
          payload.onClose && payload.onClose();
          setCreatePluginFileProps({ visible: false, onClose: null });
        },
      });
    },
    [enablePlugins],
  );

  const onChangeQuota = useCallback((e) => {
    const { payload } = e;

    setChangeQuotaDialogProps({
      visible: payload.visible,
      type: payload.type,
      ids: payload.ids,
      bodyDescription: payload.bodyDescriptionKey,
      headerTitle: payload.headerKey,
      successCallback: payload.successCallback,
      abortCallback: payload.abortCallback,
      onClose: () => {
        setChangeQuotaDialogProps({
          visible: false,
          type: null,
          ids: null,
          bodyDescription: null,
          headerTitle: null,
          successCallback: null,
          abortCallback: null,
          onClose: null,
        });
      },
    });
  }, []);
  useEffect(() => {
    window.addEventListener(Events.CREATE, onCreate);
    window.addEventListener(Events.RENAME, onRename);
    window.addEventListener(Events.ROOM_CREATE, onCreateRoom);
    window.addEventListener(Events.ROOM_EDIT, onEditRoom);
    window.addEventListener(Events.CHANGE_USER_TYPE, onChangeUserType);
    window.addEventListener(Events.GROUP_CREATE, onCreateGroup);
    window.addEventListener(Events.GROUP_EDIT, onEditGroup);
    window.addEventListener(Events.CHANGE_QUOTA, onChangeQuota);
    if (enablePlugins) {
      window.addEventListener(
        Events.CREATE_PLUGIN_FILE,
        onCreatePluginFileDialog,
      );

      if (eventListenerItemsList) {
        eventListenerItemsList.forEach((item) => {
          const eventHandler = (e) => {
            item.eventHandler(e);
          };

          eventHandlersList.current.push(eventHandler);

          window.addEventListener(item.eventType, eventHandler);
        });
      }
    }

    return () => {
      window.removeEventListener(Events.CREATE, onCreate);
      window.removeEventListener(Events.RENAME, onRename);
      window.removeEventListener(Events.ROOM_CREATE, onCreateRoom);
      window.removeEventListener(Events.ROOM_EDIT, onEditRoom);
      window.removeEventListener(Events.CHANGE_USER_TYPE, onChangeUserType);
      window.removeEventListener(Events.GROUP_CREATE, onCreateGroup);
      window.removeEventListener(Events.GROUP_EDIT, onEditGroup);

      if (enablePlugins) {
        window.removeEventListener(
          Events.CREATE_PLUGIN_FILE,
          onCreatePluginFileDialog,
        );

        if (eventListenerItemsList) {
          eventListenerItemsList.forEach((item, index) => {
            window.removeEventListener(
              item.eventType,
              eventHandlersList.current[index],
            );
          });
        }
      }
    };
  }, [
    onRename,
    onCreate,
    onCreateRoom,
    onEditRoom,
    onCreateGroup,
    onEditGroup,
    onChangeUserType,
    onCreatePluginFileDialog,
    enablePlugins,
  ]);

  return [
    createDialogProps.visible && (
      <CreateEvent key={Events.CREATE} {...createDialogProps} />
    ),
    renameDialogProps.visible && (
      <RenameEvent key={Events.RENAME} {...renameDialogProps} />
    ),
    createRoomDialogProps.visible && (
      <CreateRoomEvent key={Events.ROOM_CREATE} {...createRoomDialogProps} />
    ),
    editRoomDialogProps.visible && (
      <EditRoomEvent key={Events.ROOM_EDIT} {...editRoomDialogProps} />
    ),
    createGroupDialogProps.visible && (
      <CreateGroupEvent key={Events.GROUP_CREATE} {...createGroupDialogProps} />
    ),
    editGroupDialogProps.visible && (
      <EditGroupEvent key={Events.GROUP_EDIT} {...editGroupDialogProps} />
    ),
    changeUserTypeDialog.visible && (
      <ChangeUserTypeEvent
        key={Events.CHANGE_USER_TYPE}
        {...changeUserTypeDialog}
      />
    ),
    createPluginFileDialog.visible && (
      <CreatePluginFile
        key={Events.CREATE_PLUGIN_FILE}
        {...createPluginFileDialog}
      />
    ),
    changeQuotaDialog.visible && (
      <ChangeQuotaEvent key={Events.CHANGE_QUOTA} {...changeQuotaDialog} />
    ),
  ];
};

export default inject(({ settingsStore, pluginStore }) => {
  const { enablePlugins } = settingsStore;

  const { eventListenerItemsList } = pluginStore;

  return { enablePlugins, eventListenerItemsList };
})(observer(GlobalEvents));
