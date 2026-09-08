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

import { useTranslation } from "react-i18next";

import { EmptyView as EmptyViewComponent } from "@docspace/shared/components/empty-view";
import type { EmptyViewOptionsType } from "@docspace/ui-kit/components/empty-view";
import FilesFilter from "@docspace/shared/api/files/filter";
import { FolderType } from "@docspace/shared/enums";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getBrandName } from "@docspace/shared/constants/brands";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import UploadPDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.pdf.form.svg";
import UploadDevicePDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";
import CreateChatIcon from "PUBLIC_DIR/images/emptyview/create.chat.svg";

import {
  useAgentsAIConfigStore,
  useAgentsUserStore,
  useAiRoomStore,
} from "../../../_store";
import useKnowledgeUpload from "../../../_hooks/useKnowledgeUpload";
import KnowledgeDisabledContainer from "./KnowledgeDisabledContainer";

import {
  getRootDescription,
  getRootTitle,
  getIcon,
  getTitle,
  getDescription,
  getRootIcon,
  getFilterIcon,
} from "./EmptyView.helpers";
import { EmptyViewProps } from "./EmptyView.types";

const EmptyView = ({
  current,
  folderId,
  isFiltered,
  shareKey,
}: EmptyViewProps) => {
  const { t } = useTranslation(["Common"]);

  const isRoot =
    current.id === current.rootFolderId ||
    current.parentId === current.rootFolderId;
  const { isBase: isBaseTheme } = useTheme();
  const aiConfigStore = useAgentsAIConfigStore();
  const aiRoomStore = useAiRoomStore();
  const { user } = useAgentsUserStore();
  // Resolve upload handlers up-front (Rules of Hooks: no hook calls
  // after the conditional early-return for KnowledgeDisabledContainer).
  const { onUploadFromDocSpace, onUploadFromDevice } = useKnowledgeUpload();

  const canUseChat = !!user && !user.isVisitor;
  const onOpenChat = () => {
    aiRoomStore.setCurrentTab("chat");
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "chat");
    params.delete("fileId");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  };

  const rootFolderType = current.rootFolderType;

  // Knowledge folder + vectorization disabled in the portal — server
  // rejects any copy/upload here, so render the "configure provider"
  // placeholder instead of the regular empty view + upload CTAs. Mirrors
  // client's Section/Body branch (Home/Section/Body/index.js:492-497).
  if (
    !isFiltered &&
    current.type === FolderType.Knowledge &&
    aiConfigStore.aiConfig &&
    !aiConfigStore.aiConfig.vectorizationEnabled
  ) {
    return <KnowledgeDisabledContainer />;
  }

  const title = isFiltered
    ? t("Common:NoFindingsFound")
    : isRoot
      ? getRootTitle(t, rootFolderType)
      : getTitle(t, current.type);
  const description = isFiltered
    ? t("Common:EmptyFilterFilesDescription")
    : isRoot
      ? getRootDescription(t, rootFolderType)
      : getDescription(t, current.type);
  const icon = isFiltered
    ? getFilterIcon(isBaseTheme)
    : isRoot
      ? getRootIcon(isBaseTheme, rootFolderType)
      : getIcon(isBaseTheme);

  const onResetFilter = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const defaultFilter = FilesFilter.getDefault();

    defaultFilter.folder = folderId.toString();
    defaultFilter.key = shareKey ?? "";

    window.history.pushState(null, "", `?${defaultFilter.toUrlParams()}`);
  };

  const filterOptions = [
    {
      key: "empty-view-filter",
      to: "",
      description: t("Common:ClearFilter"),
      icon: <ClearEmptyFilterSvg />,
      onClick: onResetFilter,
      isNext: true,
    },
  ];

  // Knowledge empty view exposes the same Upload options as the filter
  // main-button (From portal / From device); handlers come from
  // `useKnowledgeUpload` (resolved at the top of the component so the
  // KnowledgeDisabledContainer branch doesn't violate Rules of Hooks).
  // Knowledge is detected by `current.type` (not `rootFolderType`, which
  // is the parent room's type).
  const showUploadOptions =
    !isFiltered && current.type === FolderType.Knowledge;

  const uploadOptions: EmptyViewOptionsType = [
    {
      key: "knowledge-empty-upload-from-docspace",
      title: t("EmptyView:UploadFromPortalTitle", {
        productName: getBrandName("ProductName"),
        defaultValue: "Upload from {{productName}}",
      }),
      description: t("Common:UploadFilesPortal", {
        files: t("Common:Files"),
        rooms: t("Common:Rooms"),
        forms: t("Common:Forms"),
        aiAgents: t("Common:AIAgents"),
        defaultValue:
          "Add files from {{files}}, {{rooms}}, {{forms}}, or other {{aiAgents}}",
      }),
      icon: <UploadPDFFormIcon />,
      onClick: onUploadFromDocSpace,
    },
    {
      key: "knowledge-empty-upload-from-device",
      title: t("EmptyView:UploadDeviceOptionTitle", {
        defaultValue: "Upload from device",
      }),
      description: t("Common:UploadFilesDevice", {
        defaultValue: "Pick files from your device.",
      }),
      icon: <UploadDevicePDFFormIcon />,
      onClick: onUploadFromDevice,
    },
  ];

  const showOpenChatOption =
    !isFiltered && current.type === FolderType.ResultStorage;

  const openChatOptions: EmptyViewOptionsType = [
    {
      key: "result-empty-open-chat",
      title: t("Common:CreateChat", { defaultValue: "Create chat" }),
      description: t("Common:CreateChatDescription", {
        aiChat: t("Common:AIChat", { defaultValue: "AI Chat" }),
        defaultValue: "Go to the {{aiChat}} tab to get started.",
      }),
      icon: <CreateChatIcon />,
      onClick: onOpenChat,
      disabled: !canUseChat,
    },
  ];

  const options = isFiltered
    ? filterOptions
    : showUploadOptions
      ? uploadOptions
      : showOpenChatOption
        ? openChatOptions
        : [];

  return (
    <EmptyViewComponent
      icon={icon}
      title={title}
      description={description}
      options={options}
    />
  );
};

export default EmptyView;
