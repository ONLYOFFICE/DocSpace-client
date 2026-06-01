// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import copy from "copy-to-clipboard";
import type { DateTime } from "luxon";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ShareAccessRights } from "@docspace/ui-kit/enums";
import type { TOption } from "@docspace/ui-kit/components/combobox";

import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import type { TFileLink } from "@docspace/shared/api/files/types";
import LinkRowComponent from "@docspace/shared/components/share/sub-components/LinkRow";

import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import OutlineReactSvgUrl from "PUBLIC_DIR/images/outline-true.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";

import { useInfoPanelStore } from "@/app/(docspace)/_store/InfoPanelStore";

import type { LinkRowProps } from "../Members.types";
import styles from "../Members.module.scss";
import DeleteLinkDialog from "./DeleteLinkDialog";
import { addToDate, now } from "@docspace/ui-kit/utils/date";
import { copyShareLink } from "@docspace/shared/components/share/Share.helpers";

const MIN_LOADER_TIME = 200;

const LinkRow = ({
  link,
  selection,
  t,
  onLinkUpdate,
  onLinkRemoved,
}: LinkRowProps) => {
  const infoPanelStore = useInfoPanelStore();
  const [loadingLinks, setLoadingLinks] = React.useState<(string | number)[]>(
    [],
  );

  const [deleteVisible, setDeleteVisible] = React.useState(false);

  const editExternalLinkAction = React.useCallback(
    async (newLink: TFileLink) => {
      if (link.sharedTo.isExpired) {
        newLink.sharedTo.expirationDate =
          addToDate(now(), 7, "days")?.toISO() ?? null;
      }

      setLoadingLinks([newLink.sharedTo.id]);

      const startLoaderTime = new Date();

      try {
        const linkData = await ShareLinkService.editLink(selection, newLink);

        if (linkData) {
          onLinkUpdate(linkData);
          copyShareLink(selection, linkData, t);
        }
      } catch (err) {
        toastr.error((err as Error)?.message ?? t("Common:UnexpectedError"));
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
    },
    [selection, onLinkUpdate, t],
  );

  const changeShareOption = React.useCallback(
    (option: TOption) => {
      const newLink = { ...link };

      if ("internal" in option && typeof option.internal === "boolean")
        newLink.sharedTo.internal = option.internal;

      editExternalLinkAction(newLink);
    },
    [link, editExternalLinkAction],
  );

  const onAccessRightsSelect = React.useCallback(
    (option: TOption) => {
      const newLink = { ...link };

      if (option.access) newLink.access = option.access;

      editExternalLinkAction(newLink);
    },
    [link, editExternalLinkAction],
  );

  const changeExpirationOption = React.useCallback(
    async (_linkData: TFileLink, expirationDate: DateTime | null) => {
      const newLink = { ...link };

      newLink.sharedTo.expirationDate = expirationDate
        ? expirationDate.toISO()
        : null;

      editExternalLinkAction(newLink);
    },
    [editExternalLinkAction],
  );

  const removedExpiredLink = React.useCallback(
    async (link: TFileLink, isReactivate: boolean = false) => {
      setLoadingLinks([link.sharedTo.id]);

      try {
        await ShareLinkService.editLink(selection, {
          ...link,
          access: isReactivate ? link.access : ShareAccessRights.None,
          sharedTo: {
            ...link.sharedTo,
            expirationDate: addToDate(now(), 7, "days")?.toISO() ?? null,
          },
        });

        if (!isReactivate) {
          onLinkRemoved();
          toastr.success(t("Common:RoomLinkDeletedSuccessfully"));
        }
      } catch (err: unknown) {
        console.log(err);
        toastr.error((err as Error)?.message);
      } finally {
        setLoadingLinks([]);
      }
    },
    [editExternalLinkAction, onLinkRemoved],
  );

  const onEditLink = React.useCallback(() => {
    infoPanelStore.setEditLinkPanelIsVisible(true);
    infoPanelStore.setLinkParams({
      link,
      item: selection,
      updateLink: onLinkUpdate,
    });
  }, [link, selection, onLinkUpdate, infoPanelStore]);

  const onCopyLink = React.useCallback(
    (link: TFileLink) => {
      copyShareLink(selection, link, t);
    },
    [t, selection, link, copyShareLink],
  );

  const onCopyPassword = () => {
    const password = link.sharedTo.password;

    if (password) {
      copy(password);
      toastr.success(t("Common:PasswordSuccessfullyCopied"));
    }
  };

  const getData = React.useCallback(
    (link: TFileLink) => {
      const { password, isExpired } = link.sharedTo;

      const isLocked = !!password;
      const isDisabled = isExpired;

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
          onClick: () => onCopyLink(link),
          disabled: isDisabled,
        },
        {
          key: "copy-link-password-key",
          label: t("Common:RoomCopyLinkPassword"),
          icon: LockedReactSvgUrl,
          onClick: onCopyPassword,
          disabled: isDisabled || !isLocked,
        },
        {
          key: "embedding-settings-key",
          label: t("Common:Embed"),
          icon: CodeReactSvgUrl,
          onClick: () => {
            infoPanelStore.setLinkParams({ link, item: selection });
            infoPanelStore.setEmbeddingPanelData({ visible: true });
          },
          disabled: true,
        },
        {
          key: "separator-1",
          isSeparator: true,
        },
        {
          key: "delete-link-key",
          label: link.canRevoke ? t("Common:RevokeLink") : t("Common:Delete"),
          icon: link.canRevoke ? OutlineReactSvgUrl : TrashReactSvgUrl,
          onClick: () => setDeleteVisible(true),
        },
      ];
    },
    [t, onEditLink, onCopyLink, removedExpiredLink, infoPanelStore, selection],
  );

  return (
    <>
      <div className={styles.linkRowWrapper}>
        <LinkRowComponent
          isRoomsLink
          links={[link]}
          getData={getData}
          onCopyLink={onCopyLink}
          loadingLinks={loadingLinks}
          isArchiveFolder={false}
          changeShareOption={changeShareOption}
          onOpenContextMenu={() => {}}
          onCloseContextMenu={() => {}}
          removedExpiredLink={removedExpiredLink}
          availableShareRights={selection.availableShareRights}
          onAccessRightsSelect={onAccessRightsSelect}
          changeExpirationOption={changeExpirationOption}
        />
      </div>

      {deleteVisible ? (
        <DeleteLinkDialog
          link={link}
          selection={selection}
          onClose={() => setDeleteVisible(false)}
          onDeleted={onLinkRemoved}
        />
      ) : null}
    </>
  );
};

export default LinkRow;

