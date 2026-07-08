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
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import AIAgentsIcon from "PUBLIC_DIR/images/icons/12/AI.svg";
import ManageAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.access.rights.dark.svg";
import ManageAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.access.rights.light.svg";

// Mirrors client `NoAccessContainer` with `type=Agent`: shown when the agent
// is not available (404 / no access). Redirects to the agents list after 5s
// to match the client UX.
const NoAccessAgent = () => {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const onGoTo = React.useCallback(
    (event?: React.MouseEvent<HTMLAnchorElement>) => {
      event?.preventDefault();
      router.push("/ai-agents");
    },
    [router],
  );

  React.useEffect(() => {
    const timer = window.setTimeout(onGoTo, 5000);
    return () => window.clearTimeout(timer);
  }, [onGoTo]);

  return (
    <EmptyView
      title={t("Common:NoAccessAIAgentTitle", {
        aiAgent: t("Common:AIAgent", { defaultValue: "AI Agent" }),
        defaultValue: "You don't have access to this {{aiAgent}}",
      })}
      description={t("Common:AIAgentAccessRedirectNote", {
        sectionName: t("Common:AIAgents", { defaultValue: "AI Agents" }),
        defaultValue: "Redirecting to {{sectionName}}...",
      })}
      icon={
        isBase ? <ManageAccessRightsLightIcon /> : <ManageAccessRightsDarkIcon />
      }
      options={[
        {
          // `isNext: true` forces EmptyViewOption to render the ui-kit
          // <Link> instead of the shared `LinkRouter={Link from "react-router"}`.
          // SDK runs under Next.js — react-router has no provider here, and
          // its <Link> destructures `basename` from a null NavigationContext
          // on mount → "Cannot destructure property 'basename'". Same fix
          // as `files-empty-filter` / `agents-empty-filter`.
          isNext: true,
          to: "",
          icon: <AIAgentsIcon />,
          onClick: onGoTo,
          key: "empty-view-goto-agents",
          description: t("Common:GoToSection", {
            sectionName: t("Common:AIAgents", { defaultValue: "AI Agents" }),
            defaultValue: "Go to {{sectionName}}",
          }),
        },
      ]}
    />
  );
};

export default observer(NoAccessAgent);
