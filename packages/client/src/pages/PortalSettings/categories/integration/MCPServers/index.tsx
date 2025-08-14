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

import React from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { TServer } from "@docspace/shared/api/ai/types";
import {
  addNewServer,
  deleteServers,
  getServersList,
  updateServer,
} from "@docspace/shared/api/ai";
import { getLogoUrl } from "@docspace/shared/utils/common";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { ServerType } from "@docspace/shared/api/ai/enums";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { toastr } from "@docspace/shared/components/toast";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import AddNewDialog from "./sub-components/add-new-dialog";
import DisableDialog from "./sub-components/disable-dialog";
import DeleteDialog from "./sub-components/delete-dialog";
import EditDialog from "./sub-components/edit-dialog";

import styles from "./MCPServers.module.scss";

const MCPServers = () => {
  const { t } = useTranslation(["MCPServers", "Common", "Settings"]);

  const [addNewDialogVisible, setAddNewDialogVisible] = React.useState(false);

  const [disableDialogVisible, setDisableDialogVisible] = React.useState(false);
  const [disableDialogID, setDisableDialogID] = React.useState<string>("");

  const [editDialogVisible, setEditDialogVisible] = React.useState(false);
  const [editDialogID, setEditDialogID] = React.useState<string>("");

  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [deleteDialogID, setDeleteDialogID] = React.useState<string>("");

  const [serversList, setServersList] = React.useState<TServer[]>([]);

  React.useEffect(() => {
    const fetchServersList = async () => {
      const servers = await getServersList(0, 100);
      if (servers) {
        setServersList(servers.items);
      }
    };

    setDocumentTitle(t("Settings:MCPServers"));

    fetchServersList();
  }, []);

  const onCloseDialogs = () => {
    setAddNewDialogVisible(false);
    setDisableDialogVisible(false);
    setEditDialogVisible(false);
    setDeleteDialogVisible(false);
    setDisableDialogID("");
    setEditDialogID("");
    setDeleteDialogID("");
  };

  const onAddNewServer = async (
    endpoint: string,
    name: string,
    description: string,
    headers: Record<string, string>,
  ) => {
    try {
      const result = await addNewServer(endpoint, name, description, headers);

      if (result) {
        setServersList((prev) => [result, ...prev]);
        toastr.success(t("ServerAddedSuccess"));
      }
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    }
  };

  const showAddNewDialog = () => {
    onCloseDialogs();
    setAddNewDialogVisible(true);
  };

  const hideAddNewDialog = () => {
    setAddNewDialogVisible(false);
  };

  const onChangeServerStatus = async (id?: string) => {
    if (!disableDialogID && !id) return;

    const currentId = id || disableDialogID;

    try {
      const server = serversList.find((s) => s.id === currentId);

      if (!server) return;

      if (server.enabled) {
        await updateServer(
          currentId,
          server.endpoint,
          server.name,
          server.description,
          server.headers,
          false,
        );

        toastr.success(t("ServerDisabledSuccess"));
      } else {
        await updateServer(
          currentId,
          server.endpoint,
          server.name,
          server.description,
          server.headers,
          true,
        );

        toastr.success(t("ServerEnabledSuccess"));
      }

      setServersList((prev) =>
        prev.map((s) =>
          s.id === currentId ? { ...s, enabled: !s.enabled } : s,
        ),
      );
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      setDisableDialogID("");
    }
  };

  const showDisableDialog = (id: string) => {
    onCloseDialogs();

    if (!id) return;

    const server = serversList.find((s) => s.id === id);

    if (!server) return;

    if (server.enabled) {
      setDisableDialogVisible(true);
      setDisableDialogID(id);
    } else {
      onChangeServerStatus(id);
    }
  };

  const hideDisableDialog = () => {
    setDisableDialogVisible(false);
  };

  const onEditServer = async (
    endpoint: string,
    name: string,
    description: string,
    headers: Record<string, string>,
  ) => {
    try {
      await updateServer(
        editDialogID,
        endpoint,
        name,
        description,
        headers,
        serversList.find((s) => s.id === editDialogID)?.enabled ?? false,
      );

      setServersList((prev) =>
        prev.map((s) =>
          s.id === editDialogID
            ? { ...s, endpoint, name, description, headers }
            : s,
        ),
      );

      toastr.success(t("ServerUpdatedSuccess"));
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      setEditDialogID("");
    }
  };

  const showEditDialog = (id: string) => {
    onCloseDialogs();

    if (!id) return;

    const server = serversList.find((s) => s.id === id);

    if (!server) return;

    setEditDialogVisible(true);
    setEditDialogID(id);
  };

  const hideEditDialog = () => {
    setEditDialogVisible(false);
  };

  const onDeleteServer = async () => {
    try {
      await deleteServers([deleteDialogID]);

      setServersList((prev) => prev.filter((s) => s.id !== deleteDialogID));

      toastr.success(t("ServerRemovedSuccess"));
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      setDeleteDialogID("");
    }
  };

  const showDeleteDialog = (id: string) => {
    onCloseDialogs();

    if (!id) return;

    const server = serversList.find((s) => s.id === id);

    if (!server) return;

    setDeleteDialogVisible(true);
    setDeleteDialogID(id);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
  };

  const getContextOptions = (id: string) => {
    return [
      {
        key: "edit",
        label: t("Common:EditButton"),
        icon: AccessEditReactSvgUrl,
        onClick: () => showEditDialog(id),
      },
      {
        key: "delete",
        label: t("Common:Delete"),
        onClick: () => showDeleteDialog(id),
        icon: CatalogTrashReactSvgUrl,
      },
    ];
  };

  return (
    <div className={styles.mcpServerContainer}>
      <Text
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
        className={styles.description}
      >
        {t("Description")}
      </Text>
      <Link
        target={LinkTarget.blank}
        type={LinkType.page}
        fontWeight={600}
        isHovered
        href=""
        style={{ marginBottom: "8px" }}
        color="accent"
      >
        {t("Common:LearnMore")}
      </Link>
      <Button
        primary
        size={ButtonSize.small}
        label={t("AddServer")}
        scale={false}
        className={styles.button}
        onClick={showAddNewDialog}
      />
      <div className={styles.serverList}>
        {serversList.map((server) => {
          const isPortalMCP = server.serverType === ServerType.Portal;
          return (
            <div className={styles.serverItem} key={server.id}>
              <img
                src={
                  isPortalMCP
                    ? getLogoUrl(WhiteLabelLogoType.Favicon)
                    : getLogoUrl(WhiteLabelLogoType.Favicon)
                }
                className={styles.serverIcon}
                alt="server-icon"
              />
              <div className={styles.serverInfo}>
                <div className={styles.serverInfoHeader}>
                  <Text fontSize="16px" fontWeight={700} lineHeight="22px">
                    {isPortalMCP ? t("Common:ProductName") : server.name}
                  </Text>
                  {isPortalMCP ? null : (
                    <div className={styles.serverInfoButtons}>
                      <ToggleButton
                        className={styles.toggleButton}
                        isChecked={server.enabled}
                        onChange={() => showDisableDialog(server.id)}
                      />
                      <ContextMenuButton
                        displayType={ContextMenuButtonDisplayType.dropdown}
                        getData={() => getContextOptions(server.id)}
                      />
                    </div>
                  )}
                </div>
                <Text
                  fontSize="13px"
                  fontWeight={400}
                  lineHeight="20px"
                  className={styles.serverDescription}
                >
                  {isPortalMCP
                    ? `${t("Common:ProductName")} description`
                    : server.description}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
      {addNewDialogVisible ? (
        <AddNewDialog onSubmit={onAddNewServer} onClose={hideAddNewDialog} />
      ) : null}
      {disableDialogVisible ? (
        <DisableDialog
          onSubmit={onChangeServerStatus}
          onClose={hideDisableDialog}
        />
      ) : null}
      {deleteDialogVisible ? (
        <DeleteDialog onSubmit={onDeleteServer} onClose={hideDeleteDialog} />
      ) : null}
      {editDialogVisible ? (
        <EditDialog
          server={serversList.find((s) => s.id === editDialogID)!}
          onSubmit={onEditServer}
          onClose={hideEditDialog}
        />
      ) : null}
    </div>
  );
};

export default MCPServers;
