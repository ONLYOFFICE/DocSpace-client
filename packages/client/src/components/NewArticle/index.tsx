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

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import type {
  NavMenuGroup,
  NavMenuItem,
} from "@docspace/ui-kit/components/nav-menu";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";

import {
  InstallAiFormsDialog,
  InstallDocsCloudDialog,
} from "SRC_DIR/pages/Dashboard/InstallModuleDialog";
import { InstallAiArbiterDialog } from "SRC_DIR/pages/Dashboard/InstallAiArbiterDialog";
import { EnableAiRoomsDialog } from "SRC_DIR/pages/Dashboard/EnableAiRoomsDialog";

import CatalogOverviewReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-integration.svg?url";
import CatalogDocumentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import CatalogAiAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import CatalogFavoritesReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.favorites.react.svg?url";
import CatalogSharedReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.shared.outline.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import CatalogArchiveReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.archive.react.svg?url";
import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogRestoreReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-restore.svg?url";
import CatalogPrivateReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.private.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import CatalogAiArbiterReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-arbiter.react.svg?url";

import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
import AppsSidebar from "../AppsSidebar";
import { useSidebarShowText } from "../AppsSidebar/useSidebarShowText";

const OVERVIEW_ID = "overview";
const DOCS_CLOUD_ID = "docs-cloud";
const AI_FILES_ID = "ai-files";
const AI_FORMS_ID = "ai-forms";
const AI_ROOMS_ID = "ai-rooms";
const AI_AGENTS_ID = "ai-agents";
const AI_ARBITER_ID = "ai-arbiter";
const E2E_ROOMS_ID = "e2e-rooms";

const PATH_TO_PARENT_ID: Record<string, string> = {
  "/docs-cloud": DOCS_CLOUD_ID,
  "/ai-files": AI_FILES_ID,
  "/ai-forms": AI_FORMS_ID,
  "/ai-arbiter": AI_ARBITER_ID,
  "/ai-rooms": AI_ROOMS_ID,
  "/e2e-rooms": E2E_ROOMS_ID,
};

const E2E_ROOMS_SECTION_TO_ID: Record<string, string> = {
  archive: "e2e-rooms-archive",
};

// ai-files / ai-rooms use direct URLs that mirror the SDK pathname under the
// host prefix (e.g. /ai-files/personal-files?folder=4567). The `folder` query
// is the concrete folder id; it maps back to the sidebar child via the
// per-app id->childId map built at render time (see `buildFolderToChildId`).
const FILES_SECTION_TO_ID: Record<string, string> = {
  "shared-with-me": "ai-files-shared-with-me",
  recent: "ai-files-recent",
  favorites: "ai-files-favorites",
  trash: "ai-files-trash",
};

const ROOMS_SECTION_TO_ID: Record<string, string> = {
  recent: "ai-rooms-recent",
  favorites: "ai-rooms-favorites",
  trash: "ai-rooms-trash",
};

// Direct-URL builder for a personal-files view. `folder` is the concrete
// folder id. recent/favorites are scoped under "My documents", so they carry
// `parentId` — mirrors the SDK's own alias resolution (personal-files page).
// The SDK fills in default sort/page, so we don't duplicate that here.
const personalFilesHref = (
  hostPrefix: string,
  folder: number,
  parentId?: number | null,
) => {
  const params = new URLSearchParams({ folder: String(folder) });
  if (parentId != null) params.set("parentId", String(parentId));
  return `${hostPrefix}/personal-files?${params}`;
};

const AI_FORMS_SECTION_TO_ID: Record<string, string> = {
  "in-progress": "ai-forms-in-progress",
  "completed-forms": "ai-forms-completed",
  library: "ai-forms-library",
  settings: "ai-forms-settings",
};

const AI_AGENTS_SECTION_TO_ID: Record<string, string> = {
  recent: "ai-agents-recent",
  favorites: "ai-agents-favorites",
  trash: "ai-agents-trash",
  settings: "ai-agents-settings",
};

type NewArticleProps = {
  user?: TUser | null;
  currentDeviceType: DeviceType;
  articleOpen: boolean;
  isNotPaidPeriod: boolean;
  docsCloudEnabled: boolean;
  aiFilesEnabled: boolean;
  aiFormsEnabled: boolean;
  aiRoomsEnabled: boolean;
  aiAgentsEnabled: boolean;
  aiArbiterEnabled: boolean;
  e2eRoomsEnabled: boolean;
  sharedWithMeFolderId?: number | null;
  sharedWithMeNewItems?: number;
  myFolderId?: number | null;
  recentFolderId?: number | null;
  favoritesFolderId?: number | null;
  trashFolderId?: number | null;
  fetchTreeFolders: () => Promise<unknown>;
  activate: (id: string) => Promise<boolean>;
  enable: (id: string, enabled: boolean) => Promise<unknown>;
  ensureAppsLoaded: () => void;
  toggleArticleOpen: () => void;
};

const NewArticle = ({
  user,
  currentDeviceType,
  articleOpen,
  isNotPaidPeriod,
  docsCloudEnabled,
  aiFilesEnabled,
  aiFormsEnabled,
  aiRoomsEnabled,
  aiAgentsEnabled,
  aiArbiterEnabled,
  e2eRoomsEnabled,
  sharedWithMeFolderId,
  sharedWithMeNewItems = 0,
  myFolderId,
  recentFolderId,
  favoritesFolderId,
  trashFolderId,
  fetchTreeFolders,
  activate,
  enable,
  ensureAppsLoaded,
  toggleArticleOpen,
}: NewArticleProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const [installDialogVisible, setInstallDialogVisible] = React.useState(false);
  const [arbiterDialogVisible, setArbiterDialogVisible] = React.useState(false);
  const [installDocsCloudVisible, setInstallDocsCloudVisible] =
    React.useState(false);
  const [enableAiRoomsVisible, setEnableAiRoomsVisible] = React.useState(false);
  const [enableAiRoomsLoading, setEnableAiRoomsLoading] = React.useState(false);

  const handleConfirmEnableAiRooms = async () => {
    setEnableAiRoomsLoading(true);
    try {
      await enable("ai-rooms", true);
      setEnableAiRoomsVisible(false);
      navigate("/ai-rooms/rooms");
    } catch (err) {
      console.error("Failed to enable ai-rooms", err);
      toastr.error(t("Common:SomethingWentWrong"));
    } finally {
      setEnableAiRoomsLoading(false);
    }
  };

  React.useEffect(() => {
    ensureAppsLoaded();
  }, [ensureAppsLoaded]);

  // ai-files / ai-rooms build their personal-files links from concrete folder
  // ids (recent/favorites/trash/...), so the tree must be loaded. The new
  // client doesn't visit the main file list that would populate it, so fetch
  // it here once if the ids aren't available yet.
  React.useEffect(() => {
    if (recentFolderId == null) fetchTreeFolders();
  }, [recentFolderId, fetchTreeFolders]);

  // Navigate to a personal-files folder identified by its root type. recent
  // and favorites are scoped under "My documents", so they carry a parentId
  // (mirrors the SDK's alias resolution). The mount effect above eagerly
  // fetches the tree, so the id is normally already known; if a click beats
  // that (id still null), fetch the tree and resolve from the result so we
  // never navigate to a broken URL.
  const goToFolder = React.useCallback(
    async (
      hostPrefix: string,
      rootFolderType: FolderType,
      folderId?: number | null,
    ) => {
      const scoped =
        rootFolderType === FolderType.Recent ||
        rootFolderType === FolderType.Favorites;

      if (folderId != null) {
        const parentId = scoped ? (myFolderId ?? null) : null;
        navigate(personalFilesHref(hostPrefix, folderId, parentId));
        return;
      }

      const tree = (await fetchTreeFolders()) as
        | { id: number; rootFolderType: FolderType }[]
        | undefined;
      const byType = new Map((tree ?? []).map((f) => [f.rootFolderType, f]));
      const folder = byType.get(rootFolderType);
      if (!folder) {
        navigate(`${hostPrefix}/personal-files`);
        return;
      }
      const parentId = scoped ? (byType.get(FolderType.USER)?.id ?? null) : null;
      navigate(personalFilesHref(hostPrefix, folder.id, parentId));
    },
    [navigate, fetchTreeFolders, myFolderId],
  );

  const { showText, toggleShowText } = useSidebarShowText({
    storageKey: "home_showSidebarText",
    currentDeviceType,
  });

  const isAdminOrOwner = (user?.isAdmin ?? false) || (user?.isOwner ?? false);
  const isGuest = user?.isVisitor ?? false;
  const canManageAgents =
    isAdminOrOwner || (user?.isRoomAdmin ?? false);
  const canCreateForms = !isGuest && !(user?.isCollaborator ?? false);

  const activeId = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section") ?? "";
    if (location.pathname.startsWith("/dashboard")) {
      return OVERVIEW_ID;
    }
    // The personal-files `folder` param is the concrete folder id (the sidebar
    // links carry ids resolved from the tree). Map it to the section the
    // sidebar highlights; the `@alias` cases are a defensive fallback in case
    // the SDK ever reports an unresolved alias.
    const folderSection = (folder: string): string => {
      switch (folder) {
        case "@share":
          return "shared-with-me";
        case "@recent":
          return "recent";
        case "@favorites":
          return "favorites";
        case "@trash":
          return "trash";
        case "@my":
          return "my";
        default:
          break;
      }
      const id = Number(folder);
      if (sharedWithMeFolderId != null && id === sharedWithMeFolderId)
        return "shared-with-me";
      if (recentFolderId != null && id === recentFolderId) return "recent";
      if (favoritesFolderId != null && id === favoritesFolderId)
        return "favorites";
      if (trashFolderId != null && id === trashFolderId) return "trash";
      return "my";
    };

    // ai-files / ai-rooms read the direct URL: the first SDK path segment
    // (after the host prefix) names the view; a personal-files folder section
    // selects the child; rooms/archive/room-detail fall back to the parent.
    if (location.pathname.startsWith("/ai-files")) {
      const sdkSegment = location.pathname.split("/")[2]; // /ai-files/<seg>
      if (sdkSegment === "personal-files") {
        return (
          FILES_SECTION_TO_ID[folderSection(params.get("folder") ?? "")] ??
          AI_FILES_ID
        );
      }
      return AI_FILES_ID;
    }
    if (location.pathname.startsWith("/ai-forms")) {
      return AI_FORMS_SECTION_TO_ID[section] ?? AI_FORMS_ID;
    }
    if (location.pathname.startsWith("/agents")) {
      return AI_AGENTS_SECTION_TO_ID[section] ?? AI_AGENTS_ID;
    }
    if (location.pathname.startsWith("/ai-rooms")) {
      const sdkSegment = location.pathname.split("/")[2]; // /ai-rooms/<seg>
      if (sdkSegment === "archive") return "ai-rooms-archive";
      if (sdkSegment === "personal-files") {
        return (
          ROOMS_SECTION_TO_ID[folderSection(params.get("folder") ?? "")] ??
          AI_ROOMS_ID
        );
      }
      return AI_ROOMS_ID;
    }
    if (location.pathname.startsWith("/e2e-rooms")) {
      return E2E_ROOMS_SECTION_TO_ID[section] ?? E2E_ROOMS_ID;
    }
    for (const [path, id] of Object.entries(PATH_TO_PARENT_ID)) {
      if (location.pathname.startsWith(path)) return id;
    }
    return undefined;
  }, [
    location.pathname,
    location.search,
    sharedWithMeFolderId,
    recentFolderId,
    favoritesFolderId,
    trashFolderId,
  ]);

  const handleDocsCloudClick = React.useCallback(() => {
    if (docsCloudEnabled) {
      navigate("/docs-cloud");
    } else {
      setInstallDocsCloudVisible(true);
    }
  }, [docsCloudEnabled, navigate]);

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    // const underDevelopment = () => toastr.info(t("Common:UnderDevelopment"));

    const overviewItem: NavMenuItem = {
      id: OVERVIEW_ID,
      label: t("Common:Overview"),
      icon: CatalogOverviewReactSvgUrl,
      onClick: () => navigate("/dashboard"),
    };

    const docsCloudItem: NavMenuItem = {
      id: DOCS_CLOUD_ID,
      label: t("Common:DocsCloud"),
      icon: CatalogDocumentsReactSvgUrl,
      onClick: handleDocsCloudClick,
    };

    const sharedWithMeHasNew =
      sharedWithMeNewItems > 0 && sharedWithMeFolderId != null;

    const aiFilesItem: NavMenuItem = {
      id: AI_FILES_ID,
      label: t("Common:DashboardFilesTitle"),
      icon: CatalogFolderReactSvgUrl,
      // "My documents": the bare personal-files path; the SDK defaults to @my.
      onClick: () => navigate("/ai-files/personal-files"),
      children: aiFilesEnabled
        ? [
            {
              id: "ai-files-shared-with-me",
              label: t("Common:SharedWithMe"),
              icon: CatalogSharedReactSvgUrl,
              onClick: () =>
                goToFolder("/ai-files", FolderType.SHARE, sharedWithMeFolderId),
              showBadge: sharedWithMeHasNew,
              badgeComponent: sharedWithMeHasNew ? (
                <NewFilesBadge
                  newFilesCount={sharedWithMeNewItems}
                  folderId={sharedWithMeFolderId!}
                />
              ) : undefined,
            },
            {
              id: "ai-files-recent",
              label: t("Common:Recent"),
              icon: CatalogRestoreReactSvgUrl,
              onClick: () =>
                goToFolder("/ai-files", FolderType.Recent, recentFolderId),
            },
            {
              id: "ai-files-favorites",
              label: t("Common:Favorites"),
              icon: CatalogFavoritesReactSvgUrl,
              onClick: () =>
                goToFolder(
                  "/ai-files",
                  FolderType.Favorites,
                  favoritesFolderId,
                ),
            },
            {
              id: "ai-files-trash",
              label: t("Common:TrashSection"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () =>
                goToFolder("/ai-files", FolderType.TRASH, trashFolderId),
              withTopSeparator: true,
            },
          ]
        : undefined,
    };

    const handleAiFormsClick = async () => {
      if (aiFormsEnabled) {
        navigate("/ai-forms");
        return;
      }
      try {
        const activated = await activate("ai-forms");
        if (activated) {
          navigate("/ai-forms");
        } else {
          setInstallDialogVisible(true);
        }
      } catch (err) {
        console.error("Failed to activate ai-forms", err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
    };

    const aiFormsItem: NavMenuItem = {
      id: AI_FORMS_ID,
      label: t("Common:DashboardFormsTitle"),
      icon: FormFileReactSvgUrl,
      onClick: handleAiFormsClick,
      children: aiFormsEnabled
        ? [
            {
              id: "ai-forms-in-progress",
              label: t("Common:InProgress"),
              icon: FormFillRectSvgUrl,
              onClick: () => navigate("/ai-forms?section=in-progress"),
            },
            {
              id: "ai-forms-completed",
              label: t("Common:CompletedForms"),
              icon: FormGalleryReactSvgUrl,
              onClick: () => navigate("/ai-forms?section=completed-forms"),
            },
            {
              id: "ai-forms-recent",
              label: t("Common:Recent"),
              icon: CatalogRestoreReactSvgUrl,
              onClick: () => navigate("/ai-forms?section=recent"),
              withTopSeparator: true,
            },
            {
              id: "ai-forms-favorites",
              label: t("Common:Favorites"),
              icon: CatalogFavoritesReactSvgUrl,
              onClick: () => navigate("/ai-forms?section=favorites"),
            },
            ...(canCreateForms
              ? [
                  {
                    id: "ai-forms-library",
                    label: t("Common:Library"),
                    icon: FormGalleryReactSvgUrl,
                    onClick: () => navigate("/ai-forms?section=library"),
                  },
                ]
              : []),
            {
              id: "ai-forms-trash",
              label: t("Common:TrashSection"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () => navigate("/ai-forms?section=trash"),
              withTopSeparator: true,
            },
            ...(isAdminOrOwner
              ? [
                  {
                    id: "ai-forms-settings",
                    label: t("Common:Settings"),
                    icon: CatalogSettingsReactSvgUrl,
                    onClick: () => navigate("/ai-forms?section=settings"),
                  },
                ]
              : []),
          ]
        : undefined,
    };

    const aiRoomsItem: NavMenuItem = {
      id: AI_ROOMS_ID,
      label: t("Common:DashboardRoomsTitle"),
      icon: CatalogRoomsReactSvgUrl,
      onClick: aiRoomsEnabled
        ? () => navigate("/ai-rooms/rooms")
        : () => setEnableAiRoomsVisible(true),
      children: aiRoomsEnabled
        ? [
            {
              id: "ai-rooms-recent",
              label: t("Common:Recent"),
              icon: CatalogRestoreReactSvgUrl,
              onClick: () =>
                goToFolder("/ai-rooms", FolderType.Recent, recentFolderId),
            },
            {
              id: "ai-rooms-favorites",
              label: t("Common:Favorites"),
              icon: CatalogFavoritesReactSvgUrl,
              onClick: () =>
                goToFolder(
                  "/ai-rooms",
                  FolderType.Favorites,
                  favoritesFolderId,
                ),
            },
            {
              id: "ai-rooms-archive",
              label: t("Common:Archive"),
              icon: CatalogArchiveReactSvgUrl,
              onClick: () => navigate("/ai-rooms/archive"),
              withTopSeparator: true,
            },
            {
              id: "ai-rooms-trash",
              label: t("Common:TrashSection"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () =>
                goToFolder("/ai-rooms", FolderType.TRASH, trashFolderId),
            },
          ]
        : undefined,
    };

    const handleAiAgentsClick = async () => {
      if (aiAgentsEnabled) {
        navigate("/agents");
        return;
      }
      try {
        const activated = await activate("ai-agents");
        if (activated) {
          navigate("/agents");
        } else {
          toastr.error(t("Common:SomethingWentWrong"));
        }
      } catch (err) {
        console.error("Failed to activate ai-agents", err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
    };

    const aiAgentsItem: NavMenuItem = {
      id: AI_AGENTS_ID,
      label: t("Common:DashboardAIChatAgentsTitle"),
      icon: CatalogAiAgentsReactSvgUrl,
      onClick: handleAiAgentsClick,
      children: aiAgentsEnabled && canManageAgents
        ? [
            {
              id: "ai-agents-recent",
              label: t("Common:Recent"),
              icon: CatalogRestoreReactSvgUrl,
              onClick: () => navigate("/agents?section=recent"),
            },
            {
              id: "ai-agents-favorites",
              label: t("Common:Favorites"),
              icon: CatalogFavoritesReactSvgUrl,
              onClick: () => navigate("/agents?section=favorites"),
            },
            {
              id: "ai-agents-trash",
              label: t("Common:TrashSection"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () => navigate("/agents?section=trash"),
              withTopSeparator: true,
            },
            {
              id: "ai-agents-settings",
              label: t("Common:Settings"),
              icon: CatalogSettingsReactSvgUrl,
              onClick: () => navigate("/agents?section=settings"),
            },
          ]
        : undefined,
    };

    const handleAiArbiterClick = async () => {
      if (aiArbiterEnabled) {
        navigate("/ai-arbiter");
        return;
      }
      try {
        const activated = await activate("ai-arbiter");
        if (activated) {
          navigate("/ai-arbiter");
        } else {
          setArbiterDialogVisible(true);
        }
      } catch (err) {
        console.error("Failed to activate ai-arbiter", err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
    };

    const aiArbiterItem: NavMenuItem = {
      id: AI_ARBITER_ID,
      label: t("Common:DashboardAIArbiterTitle"),
      icon: CatalogAiArbiterReactSvgUrl,
      onClick: handleAiArbiterClick,
    };

    const handleE2eRoomsClick = async () => {
      if (e2eRoomsEnabled) {
        navigate("/e2e-rooms");
        return;
      }
      try {
        await enable(E2E_ROOMS_ID, true);
        navigate("/e2e-rooms");
      } catch (err) {
        console.error("Failed to enable e2e-rooms", err);
        toastr.error(t("Common:SomethingWentWrong"));
      }
    };

    const e2eRoomsItem: NavMenuItem = {
      id: E2E_ROOMS_ID,
      label: t("Common:DashboardE2eRoomsTitle"),
      icon: CatalogPrivateReactSvgUrl,
      onClick: handleE2eRoomsClick,
      children: e2eRoomsEnabled
        ? [
            {
              id: "e2e-rooms-archive",
              label: t("Common:Archive"),
              icon: CatalogArchiveReactSvgUrl,
              onClick: () => navigate("/e2e-rooms?section=archive"),
            },
          ]
        : undefined,
    };

    const all: { item: NavMenuItem; enabled: boolean }[] = [
      ...(!isGuest ? [{ item: aiFilesItem, enabled: aiFilesEnabled }] : []),
      { item: aiRoomsItem, enabled: aiRoomsEnabled },
      { item: aiFormsItem, enabled: aiFormsEnabled },
      { item: aiAgentsItem, enabled: aiAgentsEnabled },
      { item: aiArbiterItem, enabled: aiArbiterEnabled },
      { item: e2eRoomsItem, enabled: e2eRoomsEnabled },
      { item: docsCloudItem, enabled: docsCloudEnabled },
    ];

    const enabled = all.filter((x) => x.enabled).map((x) => x.item);
    const available = all.filter((x) => !x.enabled).map((x) => x.item);

    const hasAvailableGroup = isAdminOrOwner && available.length > 0;

    const result: NavMenuGroup[] = [];
    result.push({
      id: "overview",
      items: [overviewItem],
    });
    if (enabled.length > 0) {
      result.push({
        id: "enabled",
        label: hasAvailableGroup ? t("Common:EnabledApps") : undefined,
        items: enabled,
      });
    }
    if (hasAvailableGroup) {
      result.push({
        id: "available",
        label: t("Common:AvailableApps"),
        items: available,
      });
    }
    return result;
  }, [
    t,
    navigate,
    isAdminOrOwner,
    isGuest,
    canCreateForms,
    canManageAgents,
    docsCloudEnabled,
    aiFilesEnabled,
    aiFormsEnabled,
    aiRoomsEnabled,
    aiAgentsEnabled,
    aiArbiterEnabled,
    e2eRoomsEnabled,
    sharedWithMeFolderId,
    sharedWithMeNewItems,
    recentFolderId,
    favoritesFolderId,
    trashFolderId,
    goToFolder,
    handleDocsCloudClick,
    activate,
    enable,
    setArbiterDialogVisible,
  ]);

  return (
    <>
      <AppsSidebar
        groups={groups}
        activeId={activeId}
        showText={showText}
        toggleShowText={toggleShowText}
        currentDeviceType={currentDeviceType}
        user={user}
        isNotPaidPeriod={isNotPaidPeriod}
        articleOpen={articleOpen}
        toggleArticleOpen={toggleArticleOpen}
      />
      <InstallAiFormsDialog
        visible={installDialogVisible}
        onClose={() => setInstallDialogVisible(false)}
        onInstalled={() => {
          setInstallDialogVisible(false);
          navigate("/ai-forms");
        }}
      />
      <InstallAiArbiterDialog
        visible={arbiterDialogVisible}
        onClose={() => setArbiterDialogVisible(false)}
        onInstalled={() => {
          setArbiterDialogVisible(false);
          navigate("/ai-arbiter");
        }}
      />
      <InstallDocsCloudDialog
        visible={installDocsCloudVisible}
        onClose={() => setInstallDocsCloudVisible(false)}
        onInstalled={() => {
          setInstallDocsCloudVisible(false);
          navigate("/docs-cloud");
        }}
      />
      <EnableAiRoomsDialog
        visible={enableAiRoomsVisible}
        isLoading={enableAiRoomsLoading}
        onClose={() => setEnableAiRoomsVisible(false)}
        onConfirm={handleConfirmEnableAiRooms}
      />
    </>
  );
};

const NewArticleConnected = inject<TStore>(
  ({
    userStore,
    settingsStore,
    appsStore,
    currentTariffStatusStore,
    treeFoldersStore,
  }) => ({
    user: userStore.user,
    currentDeviceType: settingsStore.currentDeviceType,
    articleOpen: settingsStore.articleOpen,
    toggleArticleOpen: settingsStore.toggleArticleOpen,
    isNotPaidPeriod: currentTariffStatusStore.isNotPaidPeriod,
    docsCloudEnabled: appsStore.isEnabled("docs-cloud"),
    aiFilesEnabled: appsStore.isEnabled("ai-files"),
    aiFormsEnabled: appsStore.isEnabled("ai-forms"),
    aiRoomsEnabled: appsStore.isEnabled("ai-rooms"),
    aiAgentsEnabled: appsStore.isEnabled("ai-agents"),
    aiArbiterEnabled: appsStore.isEnabled("ai-arbiter"),
    e2eRoomsEnabled: appsStore.isEnabled("e2e-rooms"),
    sharedWithMeFolderId: treeFoldersStore.sharedWithMeFolder?.id ?? null,
    sharedWithMeNewItems: treeFoldersStore.sharedWithMeFolder?.newItems ?? 0,
    myFolderId: treeFoldersStore.myFolderId ?? null,
    recentFolderId: treeFoldersStore.recentFolderId ?? null,
    favoritesFolderId: treeFoldersStore.favoritesFolderId ?? null,
    trashFolderId: treeFoldersStore.recycleBinFolderId ?? null,
    fetchTreeFolders: treeFoldersStore.fetchTreeFolders,
    activate: appsStore.activate,
    enable: appsStore.enable,
    ensureAppsLoaded: appsStore.ensureLoaded,
  }),
)(observer(NewArticle));

export default NewArticleConnected;

