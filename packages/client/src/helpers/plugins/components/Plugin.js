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

import PluginHeader from "./PluginHeader";
import PluginInfo from "./PluginInfo";
import PluginSettings from "./PluginSettings";

import { PluginScopes } from "../enums";

const StyledPlugin = styled.div`
  display: flex;

  flex-direction: column;

  max-width: 700px;

  .plugin-separator {
    height: 1px;
    width: 100%;

    background-color: #858585;
  }
`;

const Plugin = ({
  id,
  name,
  image,
  enabled,
  version,
  author,
  status,
  description,
  createBy,
  createOn,
  homePage,

  system,
  url,

  userPluginSettings,
  adminPluginSettings,

  scopes,

  updatePlugin,

  withDelete,

  isUserSettings,

  openSettingsDialog,

  uninstallPlugin,

  isLast,
}) => {
  const pluginSettings = isUserSettings
    ? userPluginSettings
    : adminPluginSettings;

  return (
    <StyledPlugin>
      <PluginHeader
        id={id}
        name={name}
        enabled={enabled}
        system={system}
        updatePlugin={updatePlugin}
        isUserSettings={isUserSettings}
        withDelete={withDelete}
        showModalPluginSettings={showModalPluginSettings}
        openSettingsDialog={openSettingsDialog}
        uninstallPlugin={uninstallPlugin}
      />
      <PluginInfo
        image={image}
        version={version}
        author={author}
        status={status}
        description={description}
        createBy={createBy.displayName}
        createOn={createOn}
        homePage={homePage}
        url={url}
      />
      {showPluginSettingsPage && <PluginSettings {...pluginSettings} id={id} />}
      {!isLast && <div className="plugin-separator"></div>}
    </StyledPlugin>
  );
};

export default Plugin;
