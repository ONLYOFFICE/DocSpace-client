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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  EmptyView,
  type EmptyViewOptionsType,
} from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import EmptyFilterAIAgentsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.light.svg";
import EmptyFilterAIAgentsDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.ai.agents.dark.svg";

import { useAgentsListStore, useAgentsUserStore } from "../../_store";

const AgentsEmptyFilter = () => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const store = useAgentsListStore();
  const userStore = useAgentsUserStore();

  const onReset = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const next = RoomsFilter.getDefault(
      userStore.user?.id,
      RoomSearchArea.AIAgents,
    );
    void store.fetchAgents(next);
  };

  // `isNext: true` keeps EmptyViewOption on the ui-kit Link branch instead
  // of LinkRouter — SDK runs under Next.js, not react-router, so the
  // shared EmptyView's `LinkRouter={Link from "react-router"}` would crash
  // with "Cannot destructure property 'basename'" if it ever rendered.
  const options: EmptyViewOptionsType = [
    {
      key: "empty-view-filter",
      to: "",
      isNext: true,
      description: t("Common:ClearFilter", { defaultValue: "Clear filter" }),
      icon: <ClearEmptyFilterSvg />,
      onClick: onReset,
    },
  ];

  const icon = isBase ? (
    <EmptyFilterAIAgentsLightIcon />
  ) : (
    <EmptyFilterAIAgentsDarkIcon />
  );

  return (
    <EmptyView
      icon={icon}
      title={t("Common:NoFindingsFound", { defaultValue: "No results found" })}
      description={t("Common:EmptyFilterAIAgentsDescription", {
        defaultValue:
          "No AI agents match the filter. Try a different search or clear the filter.",
      })}
      options={options}
    />
  );
};

export default observer(AgentsEmptyFilter);
