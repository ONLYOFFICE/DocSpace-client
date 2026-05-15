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

import { useState } from "react";
import copy from "copy-to-clipboard";
import type { TFunction } from "i18next";
import type { DateTime } from "luxon";
import { observer, inject } from "mobx-react";
import { useTranslation } from "react-i18next";
import { addToDate, now } from "@docspace/ui-kit/utils/date";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import OutlineReactSvgUrl from "PUBLIC_DIR/images/outline-true.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import { toastr } from "@docspace/ui-kit/components/toast";
import { ShareAccessRights } from "@docspace/shared/enums";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";
import LinkRowComponent from "@docspace/shared/components/share/sub-components/LinkRow";

import type { TFileLink } from "@docspace/shared/api/files/types";

import type { TOption } from "@docspace/ui-kit/components/combobox";

import { LinkRowProps } from "../Members.types";

const MIN_LOADER_TIME = 200;

const LinkRow = (props: LinkRowProps) => {
  const {
    link,
    setLinkParams,
    setEditLinkPanelIsVisible,
    setDeleteLinkDialogVisible,
    setEmbeddingPanelData,
    isArchiveFolder,
    setIsScrollLocked,
    setExternalLink,
    deleteExternalLink,
    item,
  } = props;

  const availableShareRights = item.availableShareRights;

  const { t } = useTranslation(["Files", "Settings", "Translations"]);

  const { password, isExpired } = link.sharedTo;

  const isLocked = !!password;
  const isDisabled = isExpired;

  const [loadingLinks, setLoadingLinks] = useState<(string | number)[]>([]);

  const onCloseContextMenu = () => {
    setIsScrollLocked!(false);
  };

  const onEditLink = () => {
    setEditLinkPanelIsVisible?.(true);
    setLinkParams?.({
      link,
      item,
    });
    onCloseContextMenu();
  };

  const onCopyPassword = () => {
    if (password) {
      copy(password);
      toastr.success(t("Common:PasswordSuccessfullyCopied"));
    }
  };

  const onEmbeddingClick = () => {
    setLinkParams!({
      link,
      item,
    });
    setEmbeddingPanelData!({ visible: true });
    onCloseContextMenu();
  };

  const onDeleteLink = () => {
    setLinkParams!({
      link,
      item,
    });
    setDeleteLinkDialogVisible!(true);
    onCloseContextMenu();
  };

  const onCopyExternalLink = () => {
    copyShareLink(item, link, t as TFunction);
    onCloseContextMenu();
  };

  const onOpenContextMenu = () => {
    setIsScrollLocked!(true);
  };

  const getData = () => {
    return [
      {
        key: "edit-link-key",
        label: t("Common:LinkSettings"),
        icon: SettingsReactSvgUrl,
        onClick: onEditLink,
      },
      {
        key: "copy-link-settings-key",
        label: t("Common:CopySharedLink"),
        icon: CopyToReactSvgUrl,
        onClick: onCopyExternalLink,
        disabled: isDisabled,
      },
      {
        key: "copy-link-password-key",
        label: t("Files:CopyLinkPassword"),
        icon: LockedReactSvgUrl,
        onClick: onCopyPassword,
        disabled: isDisabled || !isLocked,
      },
      {
        key: "embedding-settings-key",
        label: t("Common:Embed"),
        icon: CodeReactSvgUrl,
        onClick: onEmbeddingClick,
        disabled: isDisabled,
      },
      {
        key: "delete-link-separator",
        isSeparator: true,
      },
      {
        key: "delete-link-key",
        label: link.canRevoke ? t("Common:RevokeLink") : t("Common:Delete"),
        icon: link.canRevoke ? OutlineReactSvgUrl : TrashReactSvgUrl,
        onClick: onDeleteLink,
      },
    ];
  };

  const editExternalLinkAction = async (newLink: TFileLink) => {
    if (link.sharedTo.isExpired) {
      newLink.sharedTo.expirationDate =
        addToDate(now(), 7, "days")?.toISO() ?? null;
    }

    setLoadingLinks([newLink.sharedTo.id]);

    const startLoaderTime = new Date();

    try {
      const linkData = await ShareLinkService.editLink(item, newLink);
      setExternalLink!(linkData);
      setLinkParams!({
        link: linkData,
        item,
      });

      if (linkData) {
        copyShareLink(item, linkData, t);
      }
    } catch (err: unknown) {
      console.log(err);
      toastr.error((err as Error)?.message);
    } finally {
      const currentDate = new Date();

      const ms = currentDate.getTime() - startLoaderTime.getTime();

      if (ms < MIN_LOADER_TIME) {
        setTimeout(() => {
          setLoadingLinks([]);
        }, MIN_LOADER_TIME - ms);
      } else {
        setLoadingLinks([]);
      }
    }
  };
  const removedExpiredLink = async (
    link: TFileLink,
    isReactivate: boolean = false,
  ) => {
    setLoadingLinks([link.sharedTo.id]);

    try {
      await ShareLinkService.editLink(item, {
        ...link,
        access: isReactivate ? link.access : ShareAccessRights.None,
        sharedTo: {
          ...link.sharedTo,
          expirationDate: addToDate(now(), 7, "days")?.toISO() ?? null,
        },
      });

      if (!isReactivate) {
        deleteExternalLink!(null, link.sharedTo.id);
        toastr.success(t("Files:LinkDeletedSuccessfully"));
      }
    } catch (err: unknown) {
      console.log(err);
      toastr.error((err as Error)?.message);
    } finally {
      setLoadingLinks([]);
    }
  };

  const onAccessRightsSelect = (opt: TOption) => {
    const newLink = { ...link };
    if (opt.access) newLink.access = opt.access;
    editExternalLinkAction(newLink);
  };

  const changeExpirationOption = async (
    _linkData: TFileLink,
    expirationDate: DateTime | null,
  ) => {
    const newLink = { ...link };
    newLink.sharedTo.expirationDate = expirationDate
      ? expirationDate.toISO()
      : null;
    editExternalLinkAction(newLink);
  };

  const changeShareOption = (option: TOption): void => {
    const newLink = { ...link };

    if ("internal" in option && typeof option.internal === "boolean")
      newLink.sharedTo.internal = option.internal;

    editExternalLinkAction(newLink);
  };

  const onCopyLink = (linkArg: TFileLink) => {
    copyShareLink(item, linkArg, t);
  };

  return (
    <LinkRowComponent
      isRoomsLink
      links={[link]}
      getData={getData}
      onCopyLink={onCopyLink}
      loadingLinks={loadingLinks}
      isArchiveFolder={isArchiveFolder!}
      changeShareOption={changeShareOption}
      onOpenContextMenu={onOpenContextMenu}
      onCloseContextMenu={onCloseContextMenu}
      removedExpiredLink={removedExpiredLink}
      availableShareRights={availableShareRights}
      onAccessRightsSelect={onAccessRightsSelect}
      changeExpirationOption={changeExpirationOption}
    />
  );
};

export default inject<TStore>(
  ({ dialogsStore, treeFoldersStore, infoPanelStore, publicRoomStore }) => {
    const { setIsScrollLocked } = infoPanelStore;

    const {
      setEditLinkPanelIsVisible,
      setDeleteLinkDialogVisible,
      setEmbeddingPanelData,
      setLinkParams,
    } = dialogsStore;
    const { isArchiveFolderRoot } = treeFoldersStore;

    const { setExternalLink, deleteExternalLink } = publicRoomStore;

    return {
      isArchiveFolder: isArchiveFolderRoot,

      setLinkParams,
      setEditLinkPanelIsVisible,
      setDeleteLinkDialogVisible,
      setEmbeddingPanelData,

      setExternalLink,
      deleteExternalLink,

      setIsScrollLocked,
    };
  },
)(observer(LinkRow));

