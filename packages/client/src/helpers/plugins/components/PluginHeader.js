// (c) Copyright Ascensio System SIA 2010-2024
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
import styled from "styled-components";

import { Heading } from "@docspace/shared/components/heading";
import { Badge } from "@docspace/shared/components/badge";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";

const StyledPluginHeader = styled.div`
  display: flex;

  align-items: center;
  justify-content: space-between;

  height: 24px;

  margin-bottom: 24px;

  .plugin-header-info {
    display: flex;

    align-items: center;
    gap: 8px;
  }

  .plugin-header-badge {
    height: 22px;

    margin-top: 4px;
  }
`;

const PluginHeader = ({
  id,
  name,
  enabled,
  system,
  updatePlugin,
  withDelete,
  showModalPluginSettings,
  openSettingsDialog,
  isUserSettings,
  uninstallPlugin,
}) => {
  const badgeLabel = enabled ? "enabled" : "disabled";

  const updatePluginAction = () => {
    updatePlugin && updatePlugin(id, enabled ? "false" : "true");
  };

  const getOptions = () => {
    const enabledOptLabel = !enabled ? "Enable" : "Disable";

    const enabledOpt = {
      key: "enable-plugin",
      label: enabledOptLabel,
      onClick: updatePluginAction,
    };

    const deleteOpt = {
      key: "delete-plugin",
      label: "Delete",
      onClick: () => uninstallPlugin && uninstallPlugin(id),
    };

    const settingsOpt = {
      key: "plugin-settings",
      label: "Settings",
      onClick: () => openSettingsDialog && openSettingsDialog(id),
    };

    const opts = [];

    if (!isUserSettings && !system) opts.push(enabledOpt);

    if (showModalPluginSettings) opts.push(settingsOpt);

    if (withDelete && !system && !isUserSettings) opts.push(deleteOpt);

    return opts;
  };

  const options = getOptions();

  return (
    <StyledPluginHeader>
      <div className="plugin-header-info">
        <Heading className={"plugin-header-text"} level={3} truncate>
          {name}
        </Heading>
        {!isUserSettings && (
          <Badge className={"plugin-header-badge"} label={badgeLabel} />
        )}
      </div>
      {options.length > 0 && <ContextMenuButton getData={getOptions} />}
    </StyledPluginHeader>
  );
};

export default PluginHeader;
