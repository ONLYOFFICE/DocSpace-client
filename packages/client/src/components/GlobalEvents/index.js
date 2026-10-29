/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, useEffect, useCallback } from "react";
import { Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { FileAction, Events } from "@docspace/shared/enums";
import { getStartRoomParams } from "@docspace/shared/utils/rooms";
import { PDF_FORM_DIALOG_KEY } from "@docspace/shared/constants";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";


import CreateEvent from "./CreateEvent";
import RenameEvent from "./RenameEvent";
import CreateRoomEvent from "./CreateRoomEvent";
import EditRoomEvent from "./EditRoomEvent";
import CreateGroupEvent from "./GroupEvents/CreateGroupEvent";
import EditGroupEvent from "./GroupEvents/EditGroupEvent";
import ChangeUserTypeEvent from "./ChangeUserTypeEvent";
import CreatePluginFile from "./CreatePluginFileEvent";
import ChangeQuotaEvent from "./ChangeQuotaEvent";
import ChangeAILimitDialog from "../dialogs/ChangeAILimitDialog";
import SaveAsTemplateEvent from "./SaveAsTemplateEvent";
import { CreatedPDFFormDialog } from "../dialogs/CreatedPDFFormDialog";

const GlobalEvents = ({
  enablePlugins,
  eventListenerItemsList,
  editRoomDialogProps,
  setEditRoomDialogProps,
  createRoomDialogProps,
  setCreateRoomDialogProps,
  setCover,

  setCreatePDFFormFile,
  createPDFFormFileProps,
  userId,
}) => {

  const [createDialogProps, setCreateDialogProps] = useState({
    visible: false,
    id: null,
    type: null,
    extension: null,
    title: "",
    templateId: null,
    fromTemplate: null,
    onClose: null,
    toForm: false,
  });

  const [renameDialogProps, setRenameDialogProps] = useState({
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
  const [changeAILimitDialog, setChangeAILimitDialogProps] = useState({
    visible: false,
    items: [],
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
  const [saveAsTemplateDialog, setSaveAsTemplateDialog] = useState({
    visible: false,
    props: null,
    onClose: null,
  });

  const onCreate = useCallback((e) => {
    const { payload } = e;

    const visible = !!payload.id;

    setCreateDialogProps({
      visible,
      id: payload.id,
      type: FileAction.Create,
      extension: payload.extension,
      title: payload.title || null,
      templateId: payload.templateId || null,
      fromTemplate: payload.fromTemplate || null,
      withoutDialog: payload.withoutDialog ?? false,
      preview: payload.preview ?? false,
      actionEdit: payload.edit ?? false,
      openEditor: payload.openEditor ?? true,
      toForm: payload.toForm ?? false,
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
          actionEdit: false,
          openEditor: true,
          toForm: false,
        });
      },
    });
  }, []);

  const onRename = useCallback((e) => {
    const visible = !!e.item;

    setRenameDialogProps({
      visible,
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
    const startRoomParams = getStartRoomParams(
      e?.payload?.startRoomType,
      e?.title,
    );
    setCreateRoomDialogProps({
      ...startRoomParams,
      // CreateRoomEvent reads `startRoomType` (not `type`) to open the dialog
      // straight on a preset room type and lock the chooser.
      startRoomType: e?.payload?.startRoomType,
      isFormsCreate: e?.payload?.isFormsCreate,
      // Opens the dialog straight on the "from template" picker instead of the
      // room-type chooser (quick-actions "Room template" tile).
      withTemplateSelector: e?.payload?.withTemplateSelector,
      item: e.item,
      context: e.context || e.detail?.context || "",
      visible: true,
      onClose: () =>
        setCreateRoomDialogProps({
          visible: false,
          onClose: null,
          startRoomType: undefined,
          isFormsCreate: undefined,
          withTemplateSelector: undefined,
        }),
    });
  }, []);

  const onEditRoom = useCallback((e) => {
    const visible = !!e.item;

    setEditRoomDialogProps({
      visible,
      item: e.item,
      cb: e.cb,
      onClose: () => {
        setCover();
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
      visible,
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

  const onChangeUserType = useCallback(() => {
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

      const onClose = () => {
        payload.onClose && payload.onClose();
        setCreatePluginFileProps({
          visible: false,
          onClose: null,
        });
      };

      setCreatePluginFileProps({
        ...payload,
        visible: true,
        onClose,
        updateCreatePluginFileProps: (newProps) => {
          setCreatePluginFileProps((prevProps) => ({
            ...prevProps,
            ...newProps,
            onClose,
          }));
        },
      });
    },
    [enablePlugins],
  );

  const handleCreatePDFFormFile = useCallback(
    /**
     * @typedef {Object} DetailType
     * @property {import("@docspace/shared/api/files/types").TFile} file
     * @property {boolean} show
     * @param {CustomEvent<DetailType>} event
     */
    (event) => {
      const { file, show } = event.detail;

      const localKey = `${PDF_FORM_DIALOG_KEY}-${userId}`;

      if (!show) {
        return toastr.success(
          <Trans
            ns="PDFFormDialog"
            i18nKey="PDFFormIsReadyToast"
            components={{ 1: <strong key="create-pdf-form-file-strong" /> }}
            values={{ filename: file.title }}
          />,
        );
      }

      setCreatePDFFormFile({
        visible: true,
        file,
        localKey,
        onClose: () => {
          setCreatePDFFormFile({
            visible: false,
            onClose: null,
            file: null,
            localKey: "",
          });
        },
      });
    },
    [],
  );

  const onChangeAILimit = useCallback((e) => {
    const { payload } = e;

    setChangeAILimitDialogProps({
      visible: payload.visible,
      items: payload.items ?? [],
    });
  }, []);

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

  const onSaveAsTemplate = useCallback((e) => {
    const visible = !!e.item;

    setSaveAsTemplateDialog({
      visible,
      item: e.item,
      onClose: () => {
        setCover();
        setSaveAsTemplateDialog({
          visible: false,
          item: null,
        });
      },
    });
  }, []);

  useEffect(() => {
    window.addEventListener(
      Events.CREATE_PDF_FORM_FILE,
      handleCreatePDFFormFile,
    );

    return () => {
      window.removeEventListener(
        Events.CREATE_PDF_FORM_FILE,
        handleCreatePDFFormFile,
      );
    };
  }, [handleCreatePDFFormFile]);

  useEffect(() => {
    const pluginEventHandlers = [];

    window.addEventListener(Events.CREATE, onCreate);
    window.addEventListener(Events.RENAME, onRename);
    window.addEventListener(Events.ROOM_CREATE, onCreateRoom);
    window.addEventListener(Events.ROOM_EDIT, onEditRoom);
    window.addEventListener(Events.CHANGE_USER_TYPE, onChangeUserType);
    window.addEventListener(Events.GROUP_CREATE, onCreateGroup);
    window.addEventListener(Events.GROUP_EDIT, onEditGroup);
    window.addEventListener(Events.CHANGE_QUOTA, onChangeQuota);
    window.addEventListener(Events.CHANGE_AI_LIMIT, onChangeAILimit);
    window.addEventListener(Events.SAVE_AS_TEMPLATE, onSaveAsTemplate);
    if (enablePlugins) {
      window.addEventListener(
        Events.CREATE_PLUGIN_FILE,
        onCreatePluginFileDialog,
      );

      if (eventListenerItemsList) {
        eventListenerItemsList.forEach((item) => {
          const eventHandler = (e) => {
            item.value.eventHandler(e);
          };

          pluginEventHandlers.push(eventHandler);

          window.addEventListener(item.value.eventType, eventHandler);
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
      window.removeEventListener(Events.CHANGE_QUOTA, onChangeQuota);
      window.removeEventListener(Events.CHANGE_AI_LIMIT, onChangeAILimit);
      window.removeEventListener(Events.SAVE_AS_TEMPLATE, onSaveAsTemplate);

      if (enablePlugins) {
        window.removeEventListener(
          Events.CREATE_PLUGIN_FILE,
          onCreatePluginFileDialog,
        );

        if (eventListenerItemsList) {
          eventListenerItemsList.forEach((item, index) => {
            window.removeEventListener(
              item.value.eventType,
              pluginEventHandlers[index],
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
    onChangeQuota,
    onChangeAILimit,
    onSaveAsTemplate,
    onCreatePluginFileDialog,
    enablePlugins,
    eventListenerItemsList,
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
    saveAsTemplateDialog.visible && (
      <SaveAsTemplateEvent
        key={Events.SAVE_AS_TEMPLATE}
        {...saveAsTemplateDialog}
      />
    ),
    changeQuotaDialog.visible && (
      <ChangeQuotaEvent key={Events.CHANGE_QUOTA} {...changeQuotaDialog} />
    ),
    changeAILimitDialog.visible && (
      <ChangeAILimitDialog
        key={Events.CHANGE_AI_LIMIT}
        visible
        items={changeAILimitDialog.items}
        onClose={() =>
          setChangeAILimitDialogProps({ visible: false, items: [] })
        }
      />
    ),
    createPDFFormFileProps.visible && !createDialogProps.visible ? (
      <CreatedPDFFormDialog
        key="created-pdf-form-dialog"
        {...createPDFFormFileProps}
      />
    ) : null,
  ];
};

export default inject(
  ({ settingsStore, pluginStore, dialogsStore, userStore }) => {
    const { enablePlugins } = settingsStore;

    const {
      editRoomDialogProps,
      setEditRoomDialogProps,
      createRoomDialogProps,
      setCreateRoomDialogProps,
      setCover,
      setCreatePDFFormFile,
      createPDFFormFileProps,
    } = dialogsStore;

    const { eventListenerItemsList } = pluginStore;

    return {
      enablePlugins,
      eventListenerItemsList,
      editRoomDialogProps,
      setEditRoomDialogProps,
      createRoomDialogProps,
      setCreateRoomDialogProps,
      setCover,
      setCreatePDFFormFile,
      createPDFFormFileProps,
      userId: userStore?.user?.id,
    };
  },
)(observer(GlobalEvents));
