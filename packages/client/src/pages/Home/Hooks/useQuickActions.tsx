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

import React from "react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";

import { useOpenAiChat } from "@docspace/ui-kit/ai-agent/ai-chat-panel/hooks/useOpenAiChat";

import type { QuickActionItem } from "@docspace/ui-kit/components/quick-actions";
import {
  BlankPdfIcon,
  CreateDocumentIcon,
  CreatePresentationIcon,
  CreateSpreadsheetIcon,
  UseRoomTemplateIllustrationIcon,
  QuickVdrRoomIcon,
  QuickCollaborationRoomIcon,
  QuickPublicRoomIcon,
  QuickCustomRoomIcon,
  QuickFormRoomIcon,
  CreateFromTemplateIcon,
  CreateAgentIcon,
  AIChatIcon,
} from "@docspace/ui-kit/components/quick-actions/icons";
import { toastr } from "@docspace/ui-kit/components/toast";
import { RoomsType } from "@docspace/ui-kit/enums";
import { Events, RoomSearchArea } from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getConstName } from "@docspace/shared/constants/consts";

import {
  getQuickActionsSection,
  type SectionFlags,
} from "SRC_DIR/helpers/quickActions";

// Dispatches the same custom event the Article MainButton fires, so creation
// opens the regular client dialog and lands in the current folder. Mirrors
// MainButton.onCreate (the PDF flow carries `edit: true` and is blocked on
// mobile, where the editor cannot create a blank PDF form).
const dispatchCreate = (
  parentId: number | string | null,
  extension: string | null,
  t: (key: string) => string,
) => {
  const isPDF = extension === "pdf";

  if (isPDF && isMobile) {
    toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
    return;
  }

  const event = new CustomEvent(Events.CREATE, {
    detail: { parentId, context: "sidebar", extension },
  });
  // @ts-expect-error custom payload consumed by GlobalEvents/CreateEvent
  event.payload = { extension, id: -1, edit: isPDF };
  window.dispatchEvent(event);
};

// Opens the create-room dialog. When `startRoomType` is passed, GlobalEvents'
// onCreateRoom reads it off `event.payload.startRoomType` to open the dialog on
// that preset type and lock the type chooser (see CreateRoomEvent). Without it,
// the dialog opens on its default type chooser.
const dispatchCreateRoom = (
  parentId: number | string | null,
  startRoomType?: RoomsType,
) => {
  const event = new CustomEvent(Events.ROOM_CREATE, {
    detail: { parentId, context: "sidebar" },
  });
  // @ts-expect-error custom payload consumed by GlobalEvents/onCreateRoom
  event.payload = { startRoomType };
  window.dispatchEvent(event);
};

// Opens the Templates list — the Rooms list scoped to the Templates search
// area. Mirrors the sidebar's Templates item (ClientArticleSidebar.goTemplates).
const goTemplates = (userId?: string) => {
  const filter = RoomsFilter.getDefault(userId, RoomSearchArea.Templates);
  filter.searchArea = RoomSearchArea.Templates;
  window.DocSpace.navigate(
    `/rooms/shared/filter?${filter.toUrlParams(userId, false)}`,
  );
};

// Opens the create-agent dialog scoped to the current folder, via the same
// AGENT_CREATE event the agents header button fires (consumed by GlobalEvents
// / CreateAgentEvent).
const dispatchCreateAgent = (parentId: number | string | null) => {
  const event = new CustomEvent(Events.AGENT_CREATE, {
    detail: { parentId, context: "sidebar" },
  });
  window.dispatchEvent(event);
};

// Opens the form templates list — the Templates search area scoped to the
// Forms section. Mirrors the sidebar's Forms → Templates item
// (ClientArticleSidebar.goFormsTemplates).
const goFormsTemplates = (userId?: string) => {
  const filter = RoomsFilter.getDefault(userId, RoomSearchArea.FormTemplates);
  filter.searchArea = RoomSearchArea.FormTemplates;
  window.DocSpace.navigate(
    `/forms/filter?${filter.toUrlParams(userId, false)}`,
  );
};

export type UseQuickActionsProps = SectionFlags & {
  currentFolderId: number | string | null;
  // selectedFolderStore.security?.Create — folder-level create permission.
  canCreateFiles?: boolean;
  // Private rooms only: the user has encryption keys registered.
  canCreateEncrypted?: boolean;
  // SDK's canCreateRooms: admins / owners / room admins.
  canCreateRooms?: boolean;
  // AI is ready and the user can manage agents (admins / owners / room admins).
  canCreateAgents?: boolean;
  userId?: string;
  // Whether the OForms template gallery is reachable (settingsStore). The
  // FormRoom "from template" tile is only offered when it is.
  templateGalleryAvailable?: boolean;
  // OformsStore actions used to open the template gallery scoped to the current
  // folder (mirrors MainButton.onShowTemplateGallery).
  setTemplateGalleryVisible?: (visible: boolean) => void;
  setOformFromFolderId?: (id: number | string | null) => void;
  // Makes the gallery create a form space out of the picked template instead of
  // a file — used by the Forms root tile, which has no folder to create in.
  setCreateRoomFromTemplate?: (value: boolean) => void;
};

export type QuickActionsResult = {
  show: boolean;
  items: QuickActionItem[];
};

// Builds the quick-actions tile set for the current Files/Rooms section,
// ported from the SDK (docs-layout + rooms-layout). Returns `show: false`
// when the current section has no banner.
export const useQuickActions = (
  props: UseQuickActionsProps,
): QuickActionsResult => {
  const { t } = useTranslation(["Files", "Common", "Translations"]);

  const {
    currentFolderId,
    canCreateFiles,
    canCreateEncrypted,
    canCreateRooms,
    canCreateAgents,
    userId,
    templateGalleryAvailable,
    setTemplateGalleryVisible,
    setOformFromFolderId,
    setCreateRoomFromTemplate,
    ...sectionFlags
  } = props;

  const openChat = useOpenAiChat();

  const section = getQuickActionsSection(sectionFlags);

  const aiChatItems = React.useMemo<QuickActionItem>(
    () => ({
      id: "quick-ai-chat",
      dataTestId: "quick-ai-chat",
      icon: <AIChatIcon />,
      label: t("Common:AIChat"),
      onClick: openChat,
    }),
    [t, openChat],
  );

  const createFileTiles = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "quick-docx",
        dataTestId: "quick-docx",
        icon: <CreateDocumentIcon />,
        label: t("Common:Document"),
        onClick: () => dispatchCreate(currentFolderId, "docx", t),
      },
      {
        id: "quick-xlsx",
        dataTestId: "quick-xlsx",
        icon: <CreateSpreadsheetIcon />,
        label: t("Common:Spreadsheet"),
        onClick: () => dispatchCreate(currentFolderId, "xlsx", t),
      },
      {
        id: "quick-pptx",
        dataTestId: "quick-pptx",
        icon: <CreatePresentationIcon />,
        label: t("Common:Presentation"),
        onClick: () => dispatchCreate(currentFolderId, "pptx", t),
      },
      {
        id: "quick-pdf",
        dataTestId: "quick-pdf",
        icon: <BlankPdfIcon />,
        label: getConstName("PDF"),
        onClick: () => dispatchCreate(currentFolderId, "pdf", t),
      },
    ],
    [t, currentFolderId],
  );

  const fileItems = React.useMemo<QuickActionItem[]>(
    () => [...createFileTiles, aiChatItems],
    [createFileTiles, aiChatItems],
  );

  const roomItems = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "quick-vdr-room",
        dataTestId: "quick-vdr-room",
        icon: <QuickVdrRoomIcon />,
        label: t("Common:VirtualDataRoom"),
        onClick: () =>
          dispatchCreateRoom(currentFolderId, RoomsType.VirtualDataRoom),
      },
      {
        id: "quick-collaboration-room",
        dataTestId: "quick-collaboration-room",
        icon: <QuickCollaborationRoomIcon />,
        label: t("Common:CollaborationRoomTitle"),
        onClick: () =>
          dispatchCreateRoom(currentFolderId, RoomsType.EditingRoom),
      },
      {
        id: "quick-public-room",
        dataTestId: "quick-public-room",
        icon: <QuickPublicRoomIcon />,
        label: t("Common:PublicRoom"),
        onClick: () =>
          dispatchCreateRoom(currentFolderId, RoomsType.PublicRoom),
      },
      {
        id: "quick-custom-room",
        dataTestId: "quick-custom-room",
        icon: <QuickCustomRoomIcon />,
        label: t("Common:CustomRoomTitle"),
        onClick: () =>
          dispatchCreateRoom(currentFolderId, RoomsType.CustomRoom),
      },
      // Opens the Templates list (sidebar Rooms → Templates).
      {
        id: "quick-use-template",
        dataTestId: "quick-use-template",
        icon: <UseRoomTemplateIllustrationIcon />,
        label: t("Files:RoomTemplate"),
        onClick: () => goTemplates(userId),
      },
      aiChatItems,
    ],
    [t, currentFolderId, userId, aiChatItems],
  );

  const formItems = React.useMemo<QuickActionItem[]>(() => {
    const items: QuickActionItem[] = [
      // Collect forms → create a Form Filling Room.
      {
        id: "quick-form-room",
        dataTestId: "quick-form-room",
        icon: <QuickFormRoomIcon />,
        label: t("Common:FormSpaceTitle"),
        onClick: () => dispatchCreateRoom(currentFolderId, RoomsType.FormRoom),
      },
      // Opens the form templates list (sidebar Forms → Templates). Note the
      // in-room tile below reuses this `id` for the OForms gallery; only this
      // one carries a testid, so the two can never collide in the DOM.
      {
        id: "quick-form-template",
        dataTestId: "quick-form-space-template",
        icon: <UseRoomTemplateIllustrationIcon />,
        label: t("Common:SpaceTemplate"),
        onClick: () => goFormsTemplates(userId),
      },
    ];

    // The OForms gallery. There is no folder to create a form in at the Forms
    // root, so `createRoomFromTemplate` makes the picked template produce a
    // form space built around it (see onCreateTemplateImpl).
    if (templateGalleryAvailable) {
      items.push({
        id: "quick-form-gallery",
        dataTestId: "quick-form-gallery",
        icon: <CreateFromTemplateIcon />,
        label: t("Common:TemplateGallery"),
        onClick: () => {
          setCreateRoomFromTemplate?.(true);
          setTemplateGalleryVisible?.(true);
          setOformFromFolderId?.(currentFolderId);
        },
      });
    }

    items.push(aiChatItems);

    return items;
  }, [
    t,
    currentFolderId,
    userId,
    aiChatItems,
    templateGalleryAvailable,
    setCreateRoomFromTemplate,
    setTemplateGalleryVisible,
    setOformFromFolderId,
  ]);

  // Inside a Form Filling room only PDF forms can be created. A blank PDF form
  // is the same `pdf` create flow as the personal-files PDF tile (dispatchCreate
  // carries `edit: true` for PDF, opening the form editor). When the OForms
  // template gallery is available, also offer a "from template" tile that opens
  // it scoped to the current folder (mirrors MainButton's FormRoom gallery item).
  const formRoomItems = React.useMemo<QuickActionItem[]>(() => {
    const items: QuickActionItem[] = [
      {
        id: "quick-blank-pdf-form",
        icon: <BlankPdfIcon />,
        label: t("Common:BlankPDFForm"),
        onClick: () => dispatchCreate(currentFolderId, "pdf", t),
      },
    ];

    if (templateGalleryAvailable) {
      items.push({
        id: "quick-form-template",
        icon: <CreateFromTemplateIcon />,
        label: t("Common:TemplateGallery"),
        onClick: () => {
          setTemplateGalleryVisible?.(true);
          setOformFromFolderId?.(currentFolderId);
        },
      });
    }

    items.push(aiChatItems);

    return items;
  }, [
    t,
    currentFolderId,
    templateGalleryAvailable,
    setTemplateGalleryVisible,
    setOformFromFolderId,
    aiChatItems,
  ]);

  const agentItems = React.useMemo<QuickActionItem[]>(
    () => [
      {
        id: "quick-new-agent",
        icon: <CreateAgentIcon />,
        label: t("Common:NewAgent"),
        onClick: () => dispatchCreateAgent(currentFolderId),
      },
    ],
    [t, currentFolderId],
  );

  if (section === "files" && canCreateFiles)
    return { show: true, items: fileItems };

  if (section === "rooms" && canCreateRooms)
    return { show: true, items: roomItems };

  if (section === "forms" && canCreateRooms)
    return { show: true, items: formItems };

  if (section === "form-room" && canCreateFiles)
    return { show: true, items: formRoomItems };

  if (section === "ai-agents" && canCreateAgents)
    return { show: true, items: agentItems };

  if (section === "private" && canCreateFiles && canCreateEncrypted)
    return { show: true, items: createFileTiles };

  return { show: false, items: [] };
};

export default useQuickActions;

