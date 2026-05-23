// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { AsideHeader } from "@docspace/ui-kit/components/aside";
import { Tabs } from "@docspace/ui-kit/components/tabs";

import {
  InfoPanelView,
  useInfoPanelStore,
  type InfoPanelViewType,
} from "../../_store/InfoPanelStore";

import { getAvailableTabs } from "./helpers/tabs";
import styles from "./Header.module.scss";

const InfoPanelHeader = observer(() => {
  const { t } = useTranslation(["Common"]);

  const infoPanelStore = useInfoPanelStore();
  const { selection, fileView, setView, close } = infoPanelStore;

  const availableTabs = React.useMemo(
    () => getAvailableTabs(selection),
    [selection],
  );

  const withTabs = !!selection && availableTabs.length > 1;

  const selectedTabId: InfoPanelViewType = availableTabs.includes(fileView)
    ? fileView
    : (availableTabs[0] ?? InfoPanelView.infoDetails);

  React.useEffect(() => {
    if (selectedTabId !== fileView) {
      setView(selectedTabId);
    }
  }, [selectedTabId, fileView, setView]);

  const tabItems = availableTabs.map((id) => {
    let name: string;
    if (id === InfoPanelView.infoMembers) {
      name = t("Common:Contacts");
    } else if (id === InfoPanelView.infoShare) {
      name = t("Common:Share");
    } else if (id === InfoPanelView.infoHistory) {
      name = t("Common:SubmenuHistory");
    } else {
      name = t("Common:SubmenuDetails");
    }

    return { id, name, onClick: () => setView(id), content: null };
  });

  return (
    <div
      className={classNames(styles.infoPanelHeader, {
        [styles.withTabs]: withTabs,
      })}
    >
      <AsideHeader
        header={t("Common:Info")}
        onCloseClick={close}
        withoutBorder
        className="header-text"
        isCloseable
        dataTestId="info_panel_aside_header"
      />

      {withTabs ? (
        <div className="tabs">
          <Tabs
            style={{ width: "100%" }}
            items={tabItems}
            selectedItemId={selectedTabId}
            withAnimation
          />
        </div>
      ) : null}
    </div>
  );
});

export default InfoPanelHeader;
