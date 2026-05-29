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
import { DeviceType } from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";

import {
  InstallAiFormsDialog,
  InstallDocsCloudDialog,
} from "SRC_DIR/pages/Dashboard/InstallModuleDialog";
import { InstallAiArbiterDialog } from "SRC_DIR/pages/Dashboard/InstallAiArbiterDialog";
import { EnableAiRoomsDialog } from "SRC_DIR/pages/Dashboard/EnableAiRoomsDialog";

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
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import CatalogAiArbiterReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-arbiter.react.svg?url";

import NewFilesBadge from "SRC_DIR/components/NewFilesBadge";
import AppsSidebar from "../AppsSidebar";
import { useSidebarShowText } from "../AppsSidebar/useSidebarShowText";

const DOCS_CLOUD_ID = "docs-cloud";
const AI_FILES_ID = "ai-files";
const AI_FORMS_ID = "ai-forms";
const AI_ROOMS_ID = "ai-rooms";
const AI_AGENTS_ID = "ai-agents";
const AI_ARBITER_ID = "ai-arbiter";

const PATH_TO_PARENT_ID: Record<string, string> = {
  "/docs-cloud": DOCS_CLOUD_ID,
  "/ai-files": AI_FILES_ID,
  "/ai-forms": AI_FORMS_ID,
  "/ai-arbiter": AI_ARBITER_ID,
  "/ai-rooms": AI_ROOMS_ID,
};

const AI_FILES_SECTION_TO_ID: Record<string, string> = {
  "shared-with-me": "ai-files-shared-with-me",
  recent: "ai-files-recent",
  favorites: "ai-files-favorites",
  trash: "ai-files-trash",
  settings: "ai-files-settings",
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

const AI_ROOMS_SECTION_TO_ID: Record<string, string> = {
  recent: "ai-rooms-recent",
  favorites: "ai-rooms-favorites",
  archive: "ai-rooms-archive",
  trash: "ai-rooms-trash",
  settings: "ai-rooms-settings",
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
  sharedWithMeFolderId?: number | null;
  sharedWithMeNewItems?: number;
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
  sharedWithMeFolderId,
  sharedWithMeNewItems = 0,
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
      navigate("/ai-rooms?section=rooms");
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
    const section = new URLSearchParams(location.search).get("section") ?? "";
    if (location.pathname.startsWith("/ai-files")) {
      return AI_FILES_SECTION_TO_ID[section] ?? AI_FILES_ID;
    }
    if (location.pathname.startsWith("/ai-forms")) {
      return AI_FORMS_SECTION_TO_ID[section] ?? AI_FORMS_ID;
    }
    if (location.pathname.startsWith("/agents")) {
      return AI_AGENTS_SECTION_TO_ID[section] ?? AI_AGENTS_ID;
    }
    if (location.pathname.startsWith("/ai-rooms")) {
      return AI_ROOMS_SECTION_TO_ID[section] ?? AI_ROOMS_ID;
    }
    for (const [path, id] of Object.entries(PATH_TO_PARENT_ID)) {
      if (location.pathname.startsWith(path)) return id;
    }
    return undefined;
  }, [location.pathname, location.search]);

  const handleDocsCloudClick = React.useCallback(() => {
    if (docsCloudEnabled) {
      navigate("/docs-cloud");
    } else {
      setInstallDocsCloudVisible(true);
    }
  }, [docsCloudEnabled, navigate]);

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    // const underDevelopment = () => toastr.info(t("Common:UnderDevelopment"));

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
      label: t("Common:DashboardAIFilesTitle"),
      icon: CatalogFolderReactSvgUrl,
      onClick: () => navigate("/ai-files"),
      children: aiFilesEnabled
        ? [
            {
              id: "ai-files-shared-with-me",
              label: t("Common:SharedWithMe"),
              icon: CatalogSharedReactSvgUrl,
              onClick: () => navigate("/ai-files?section=shared-with-me"),
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
              onClick: () => navigate("/ai-files?section=recent"),
            },
            {
              id: "ai-files-favorites",
              label: t("Common:Favorites"),
              icon: CatalogFavoritesReactSvgUrl,
              onClick: () => navigate("/ai-files?section=favorites"),
            },
            {
              id: "ai-files-trash",
              label: t("Common:TrashSection"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () => navigate("/ai-files?section=trash"),
              withTopSeparator: true,
            },
            ...(isAdminOrOwner
              ? [
                  {
                    id: "ai-files-settings",
                    label: t("Common:Settings"),
                    icon: CatalogSettingsReactSvgUrl,
                    onClick: () => navigate("/ai-files?section=settings"),
                  },
                ]
              : []),
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
      label: t("Common:DashboardAIFormsTitle"),
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
      label: t("Common:DashboardAIRoomsTitle"),
      icon: CatalogRoomsReactSvgUrl,
      onClick: aiRoomsEnabled
        ? () => navigate("/ai-rooms?section=rooms")
        : () => setEnableAiRoomsVisible(true),
      children: aiRoomsEnabled
        ? [
            {
              id: "ai-rooms-recent",
              label: t("Common:Recent"),
              icon: CatalogRestoreReactSvgUrl,
              onClick: () => navigate("/ai-rooms?section=recent"),
            },
            {
              id: "ai-rooms-favorites",
              label: t("Common:Favorites"),
              icon: CatalogFavoritesReactSvgUrl,
              onClick: () => navigate("/ai-rooms?section=favorites"),
            },
            {
              id: "ai-rooms-archive",
              label: t("Common:Archive"),
              icon: CatalogArchiveReactSvgUrl,
              onClick: () => navigate("/ai-rooms?section=archive"),
              withTopSeparator: true,
            },
            {
              id: "ai-rooms-trash",
              label: t("Common:TrashSection"),
              icon: CatalogTrashReactSvgUrl,
              onClick: () => navigate("/ai-rooms?section=trash"),
            },
            ...(isAdminOrOwner
              ? [
                  {
                    id: "ai-rooms-settings",
                    label: t("Common:Settings"),
                    icon: CatalogSettingsReactSvgUrl,
                    onClick: () => navigate("/ai-rooms?section=settings"),
                  },
                ]
              : []),
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

    const all: { item: NavMenuItem; enabled: boolean }[] = [
      ...(!isGuest ? [{ item: aiFilesItem, enabled: aiFilesEnabled }] : []),
      { item: aiRoomsItem, enabled: aiRoomsEnabled },
      { item: aiFormsItem, enabled: aiFormsEnabled },
      { item: aiAgentsItem, enabled: aiAgentsEnabled },
      { item: aiArbiterItem, enabled: aiArbiterEnabled },
      { item: docsCloudItem, enabled: docsCloudEnabled },
    ];

    const enabled = all.filter((x) => x.enabled).map((x) => x.item);
    const available = all.filter((x) => !x.enabled).map((x) => x.item);

    const hasAvailableGroup = isAdminOrOwner && available.length > 0;

    const result: NavMenuGroup[] = [];
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
    docsCloudEnabled,
    aiFilesEnabled,
    aiFormsEnabled,
    aiRoomsEnabled,
    aiAgentsEnabled,
    aiArbiterEnabled,
    sharedWithMeFolderId,
    sharedWithMeNewItems,
    handleDocsCloudClick,
    activate,
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
    sharedWithMeFolderId: treeFoldersStore.sharedWithMeFolder?.id ?? null,
    sharedWithMeNewItems: treeFoldersStore.sharedWithMeFolder?.newItems ?? 0,
    activate: appsStore.activate,
    enable: appsStore.enable,
    ensureAppsLoaded: appsStore.ensureLoaded,
  }),
)(observer(NewArticle));

export default NewArticleConnected;

