/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import type { TServer } from "@docspace/shared/api/ai/types";
import { toastr, TData } from "@docspace/shared/components/toast";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../../AISettings.module.scss";
import { MCPTile } from "../tiles/mcp-tile";
import { AddMCPDialog } from "./dialogs/add";
import { DeleteMCPDialog } from "./dialogs/delete";
import { DisableMCPDialog } from "./dialogs/disable";
import { EditMCPDialog } from "./dialogs/edit";

type MCPListProps = {
  showHeading: boolean;
  headingText: string;
  mcpServers?: TServer[];
  onMCPToggle: (id: TServer["id"], enabled: boolean) => void;
  onSettingsClick: (item: TServer) => void;
  onDeleteClick: (id: TServer["id"]) => void;
};

const MCPList = observer(
  ({
    showHeading,
    headingText,
    mcpServers,
    onMCPToggle,
    onSettingsClick,
    onDeleteClick,
  }: MCPListProps) => {
    if (!mcpServers?.length) return;

    return (
      <div className={styles.mcpListContainer}>
        {showHeading ? (
          <Heading
            className={styles.mcpHeading}
            level={HeadingLevel.h3}
            fontSize="16px"
            fontWeight={700}
            lineHeight="22px"
          >
            {headingText}
          </Heading>
        ) : null}

        <div className={styles.mcpList}>
          {mcpServers.map((mcp) => (
            <MCPTile
              key={mcp.id}
              item={mcp}
              onToggle={onMCPToggle}
              onSettingsClick={onSettingsClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </div>
    );
  },
);

type DisableDeleteDialogData =
  | { visible: false; serverId: null }
  | { visible: true; serverId: TServer["id"] };

type EditDialogData =
  | { visible: false; server: null }
  | { visible: true; server: TServer };

type MCPServersProps = {
  standalone?: boolean;
  customMCPServers?: AISettingsStore["customMCPServers"];
  systemMCPServers?: AISettingsStore["systemMCPServers"];
  updateMCPStatus?: AISettingsStore["updateMCPStatus"];
};

const MCPServersComponent = ({
  // standalone,
  customMCPServers,
  systemMCPServers,
  updateMCPStatus,
}: MCPServersProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [deleteDialogData, setDeleteDialogData] =
    useState<DisableDeleteDialogData>({
      visible: false,
      serverId: null,
    });
  const [disableDialogData, setDisableDialogData] =
    useState<DisableDeleteDialogData>({
      visible: false,
      serverId: null,
    });

  const [editDialogData, setEditDialogData] = useState<EditDialogData>({
    visible: false,
    server: null,
  });

  const showMCPHeadings = !!customMCPServers?.length;

  const onMCPToggle = async (id: TServer["id"], enabled: boolean) => {
    if (!enabled) {
      setDisableDialogData({
        visible: true,
        serverId: id,
      });

      return;
    }

    try {
      await updateMCPStatus?.(id, enabled);
      toastr.success(t("AISettings:ServerEnabledSuccess"));
    } catch (e) {
      console.error(e);
      toastr.error(e as TData);
    }
  };

  const hideDisableDialog = () => {
    setDisableDialogData({
      visible: false,
      serverId: null,
    });
  };

  const onUpdateMCP = (item: TServer) => {
    setEditDialogData({
      visible: true,
      server: item,
    });
  };

  const onDeleteMCP = (id: TServer["id"]) => {
    setDeleteDialogData({
      visible: true,
      serverId: id,
    });
  };

  const showAddDialog = () => setAddDialogVisible(true);

  const hideAddDialog = () => setAddDialogVisible(false);

  const hideDeleteDialog = () => {
    setDeleteDialogData({
      visible: false,
      serverId: null,
    });
  };

  const hideEditDialog = () => {
    setEditDialogData({
      visible: false,
      server: null,
    });
  };

  return (
    <div className={styles.mcpServers}>
      {/* {standalone ? (
        <Heading
          className={styles.heading}
          level={HeadingLevel.h3}
          fontSize="16px"
          fontWeight={700}
          lineHeight="22px"
        >
          {t("AISettings:MCPSettingTitle")}
        </Heading>
      ) : null} */}{" "}
      <Heading
        className={styles.heading}
        level={HeadingLevel.h3}
        fontSize="16px"
        fontWeight={700}
        lineHeight="22px"
      >
        {t("AISettings:MCPSettingTitle")}
      </Heading>
      <Text className={styles.description}>
        {t("AISettings:MCPSettingDescription")}
      </Text>
      <Link
        className={styles.learnMoreLink}
        target={LinkTarget.blank}
        type={LinkType.page}
        fontWeight={600}
        isHovered
        href=""
        color="accent"
      >
        {t("Common:LearnMore")}
      </Link>
      <Button
        primary
        size={ButtonSize.small}
        label={t("AISettings:AddMCPServer")}
        scale={false}
        className={styles.addProviderButton}
        onClick={showAddDialog}
      />
      <MCPList
        headingText={t("AISettings:CustomMCPListTitle")}
        mcpServers={customMCPServers}
        showHeading={showMCPHeadings}
        onMCPToggle={onMCPToggle}
        onSettingsClick={onUpdateMCP}
        onDeleteClick={onDeleteMCP}
      />
      <MCPList
        headingText={t("AISettings:SystemMCPListTitle")}
        mcpServers={systemMCPServers}
        showHeading={showMCPHeadings}
        onMCPToggle={onMCPToggle}
        onSettingsClick={onUpdateMCP}
        onDeleteClick={onDeleteMCP}
      />
      {addDialogVisible ? <AddMCPDialog onClose={hideAddDialog} /> : null}
      {deleteDialogData.visible ? (
        <DeleteMCPDialog
          onClose={hideDeleteDialog}
          serverId={deleteDialogData.serverId}
        />
      ) : null}
      {disableDialogData.visible ? (
        <DisableMCPDialog
          onClose={hideDisableDialog}
          serverId={disableDialogData.serverId}
        />
      ) : null}
      {editDialogData.visible ? (
        <EditMCPDialog
          server={editDialogData.server}
          onClose={hideEditDialog}
        />
      ) : null}
    </div>
  );
};

export const MCPServers = inject(({ aiSettingsStore }: TStore) => {
  const { customMCPServers, systemMCPServers, updateMCPStatus } =
    aiSettingsStore;

  return {
    customMCPServers,
    systemMCPServers,
    updateMCPStatus,
  };
})(observer(MCPServersComponent));
