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
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Submenu } from "@docspace/shared/components/submenu";
import { DeviceType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { useStore } from "SRC_DIR/store";

import Branding from "../branding";
import Backup from "../backup";
import AutoBackup from "../auto-backup";
import Restore from "../restore";

import config from "PACKAGE_FILE";

const Settings = () => {
  const { t } = useTranslation(["Common", "Settings"]);
  const navigate = useNavigate();
  const { settingsStore } = useStore();
  const { currentDeviceType } = settingsStore;

  const data = [
    {
      id: "branding",
      name: t("Settings:Branding"),
      content: <Branding />,
    },
    {
      id: "data-backup",
      name: t("Settings:DataBackup"),
      content: <Backup />,
    },
    {
      id: "auto-backup",
      name: t("Settings:AutoBackup"),
      content: <AutoBackup />,
    },
    {
      id: "restore",
      name: t("Settings:RestoreBackup"),
      content: <Restore />,
    },
  ];

  const onSelect = (e) => {
    console.log("e", e);
    navigate(
      combineUrl(window.DocSpaceConfig?.proxy?.url, `/settings/${e.id}`)
    );
  };

  const getCurrentTab = () => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    return currentTab !== -1 ? currentTab : 0;
  };

  const currentTab = getCurrentTab();

  return (
    <Submenu
      data={data}
      startSelect={currentTab}
      onSelect={(e) => onSelect(e)}
      topProps={
        currentDeviceType === DeviceType.desktop
          ? "0px"
          : currentDeviceType === DeviceType.mobile
            ? "53px"
            : "61px"
      }
    />
  );
};

export default Settings;
