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
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react";
import { Tabs, TTabItem } from "@docspace/shared/components/tabs";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import Branding from "../branding";
import Backup from "../backup";
import AutoBackup from "../auto-backup";
import Restore from "../restore";

const Settings = () => {
  const { t } = useTranslation(["Common", "Settings"]);
  const navigate = useNavigate();
  const [currentTabId, setCurrentTabId] = useState("branding");

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

  const onSelect = (element: TTabItem) => {
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, `/settings/${element.id}`)
    );
    setCurrentTabId(element.id);
  };

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab !== undefined && data.length) setCurrentTabId(currentTab.id);
  }, [location.pathname]);

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={(e) => onSelect(e)}
    />
  );
};

export default observer(Settings);
