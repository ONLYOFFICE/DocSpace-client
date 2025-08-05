// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import OutlineReactSvgUrl from "PUBLIC_DIR/images/outline-true.react.svg?url";

import { ShareAccessRights } from "../../enums";
import { LINKS_LIMIT_COUNT } from "../../constants";
import {
  editExternalFolderLink,
  editExternalLink,
  getExternalFolderLinks,
  getExternalLinks,
} from "../../api/files";
import type { TFileLink } from "../../api/files/types";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import ShareLoader from "../../skeletons/share";
import { isDesktop } from "../../utils";
import { ShareLinkService } from "../../services/share-link.service";

import { Text } from "../text";
import { toastr } from "../toast";
import { Tooltip } from "../tooltip";
import { IconButton } from "../icon-button";
import type { TOption } from "../combobox";
import type { TData } from "../toast/Toast.type";
import PublicRoomBar from "../public-room-bar";

import LinkRow from "./sub-components/LinkRow";

import type { AccessItem, ShareProps, TLink } from "./Share.types";
import { copyDocumentShareLink, evenPrimaryLink } from "./Share.helpers";
import styles from "./Share.module.scss";

const Share = (props: ShareProps) => {
  const {
    setView,
    infoPanelSelection,
    selfId,
    shareChanged,
    setShareChanged,
    onOpenPanel,
    onlyOneLink,
    setIsScrollLocked,
    setEditLinkPanelIsVisible,
    setLinkParams,
    setEmbeddingPanelData,
    fileLinkProps,
  } = props;

  const isFolder = infoPanelSelection.isFolder;

  const { t } = useTranslation(["Common"]);
  const [fileLinks, setFileLinks] = useState<TLink[]>(fileLinkProps ?? []);
  const [isLoading, setIsLoading] = useState(!fileLinkProps);
  const [loadingLinks, setLoadingLinks] = useState<(string | number)[]>([]);

  const mountedRef = useRef(true);

  const [visibleBar, setVisibleBar] = useLocalStorage(
    `document-bar-${selfId}`,
    true,
  );

  const requestRunning = React.useRef(false);
  const isInit = React.useRef(!!fileLinkProps);

  const [isLoadedAddLinks, setIsLoadedAddLinks] = useState(true);

  const hideSharePanel = !infoPanelSelection?.canShare;

  const editLinkApi = isFolder ? editExternalFolderLink : editExternalLink;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchLinks = React.useCallback(async () => {
    if (requestRunning.current || hideSharePanel) return;

    requestRunning.current = true;

    const getExternalLinksMethod = isFolder
      ? getExternalFolderLinks
      : getExternalLinks;

    const res = await getExternalLinksMethod(infoPanelSelection.id);

    setFileLinks(res.items);
    setIsLoading(false);
    isInit.current = false;
    requestRunning.current = false;
  }, [infoPanelSelection?.id, hideSharePanel, isFolder]);

  useEffect(() => {
    if (hideSharePanel) {
      setView?.("info_details");

      return;
    }

    if (!fileLinkProps) fetchLinks();
  }, [fetchLinks, hideSharePanel, fileLinkProps, setView]);

  useEffect(() => {
    if (shareChanged) {
      fetchLinks();
      setShareChanged?.(false);
    }
  }, [fetchLinks, setShareChanged, shareChanged]);

  useEffect(() => {
    if (fileLinkProps) setFileLinks(fileLinkProps);
  }, [fileLinkProps]);

  const addLoaderLink = () => {
    const link = { isLoaded: true };
    setFileLinks([...fileLinks, ...[link]]);
  };

  const addGeneralLink = async () => {
    try {
      addLoaderLink();

      const link = await ShareLinkService.getPrimaryLink(infoPanelSelection);

      if (link) {
        setFileLinks((links) => {
          const newLinks: TLink[] = [...links];

          const idx = newLinks.findIndex((l) => "isLoaded" in l && l.isLoaded);

          if (typeof idx !== "undefined") newLinks[idx] = { ...link };

          return newLinks;
        });
        copyDocumentShareLink(link, t);
      } else {
        setFileLinks([]);
      }
    } catch (error) {
      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);
      toastr.error(message);
      setFileLinks([]);
    }
  };

  const addAdditionalLinks = async () => {
    if (!isLoadedAddLinks) return;

    setIsLoadedAddLinks(false);

    addLoaderLink();

    try {
      const newLink =
        await ShareLinkService.addExternalLink(infoPanelSelection);

      setFileLinks((links) => {
        const newLinks: TLink[] = [...links];

        const idx = newLinks.findIndex((l) => "isLoaded" in l && l.isLoaded);

        if (typeof idx !== "undefined") newLinks[idx] = { ...newLink };

        return newLinks;
      });
    } catch (error) {
      console.error({ error });

      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);
      toastr.error(message);

      setFileLinks((links) => {
        return links.filter((link) => !("isLoaded" in link && link.isLoaded));
      });
    } finally {
      setIsLoadedAddLinks(true);
    }
  };

  const updateLink = (oldLink: TFileLink, newLink: TFileLink) => {
    const newArr = fileLinks.map((item) => {
      if ("sharedTo" in item && item.sharedTo.id === newLink.sharedTo.id) {
        return newLink || null;
      }
      return item;
    });
    setFileLinks(newArr);

    const newLoadingLinks = loadingLinks.filter(
      (item) => item !== oldLink.sharedTo.id,
    );
    setLoadingLinks(newLoadingLinks);
  };

  const deleteLink = (id: string | number) => {
    const newArr = fileLinks.filter(
      (item) => "sharedTo" in item && item.sharedTo.id !== id,
    );
    setFileLinks(newArr);
  };

  const changeShareOption = async (item: TOption, link: TFileLink) => {
    try {
      setLoadingLinks((val) => [...val, link.sharedTo.id]);

      const expDate = moment(link.sharedTo.expirationDate);

      const res = await editLinkApi(
        infoPanelSelection.id,
        link.sharedTo.id,
        link.access,
        link.sharedTo.primary,
        item.internal || false,
        expDate,
      );

      updateLink(link, res);
      copyDocumentShareLink(res, t);
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const changeAccessOption = async (item: AccessItem, link: TFileLink) => {
    const updateAccessLink = async () => {
      const expDate = moment(link.sharedTo.expirationDate);
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      try {
        const res = await editLinkApi(
          infoPanelSelection.id,
          link.sharedTo.id,
          item.access ?? ({} as ShareAccessRights),
          link.sharedTo.primary,
          link.sharedTo.internal || false,
          expDate,
        );

        if (item.access === ShareAccessRights.None) {
          deleteLink(link.sharedTo.id);
          toastr.success(t("Common:LinkRemoved"));
        } else {
          updateLink(link, res);
          if (item.access === ShareAccessRights.DenyAccess) {
            toastr.success(t("Common:LinkAccessDenied"));
          } else {
            copyDocumentShareLink(res, t);
          }
        }
      } catch (e) {
        toastr.error(e as TData);
      }
    };

    if (item.access === ShareAccessRights.FormFilling && onOpenPanel) {
      onOpenPanel({
        visible: true,
        updateAccessLink,
        fileId: infoPanelSelection.id,
      });
      return;
    }

    updateAccessLink();
  };

  const removeLink = async (link: TFileLink) => {
    try {
      const removeLinkApi = isFolder ? editExternalFolderLink : editLinkApi;

      setLoadingLinks((val) => [...val, link.sharedTo.id]);

      const expDate = moment(link.sharedTo.expirationDate);
      const newLink = await removeLinkApi(
        infoPanelSelection.id,
        link.sharedTo.id,
        ShareAccessRights.None,
        link.sharedTo.primary,
        false,
        expDate,
      );

      if (link.canEditExpirationDate) {
        deleteLink(link.sharedTo.id);
        toastr.success(t("Common:LinkRemoved"));
      } else {
        setLoadingLinks((prev) => prev.filter((l) => l !== link.sharedTo.id));
        setFileLinks((links) =>
          links.map((l) =>
            "sharedTo" in l && l.sharedTo.id === link.sharedTo.id ? newLink : l,
          ),
        );
        toastr.success(t("Common:GeneralLinkRevokedAndCreatedSuccessfully"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onCloseContextMenu = () => {
    setIsScrollLocked?.(false);
  };

  const onOpenContextMenu = () => {
    setIsScrollLocked?.(true);
  };

  const onEditLink = (link: TFileLink) => {
    setEditLinkPanelIsVisible(true);
    setLinkParams({
      link,
      item: infoPanelSelection,
      updateLink: (newLink: TFileLink) => {
        if (!mountedRef.current) return;
        updateLink(link, newLink);
      },
    });
    onCloseContextMenu();
  };

  const onEmbeddingClick = (link: TFileLink) => {
    setLinkParams({ link, item: infoPanelSelection });
    setEmbeddingPanelData?.({ visible: true, item: infoPanelSelection });
  };

  const changeExpirationOption = async (
    link: TFileLink,
    expirationDate: moment.Moment | null,
  ) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const expDate = moment(expirationDate);

      const res = await editLinkApi(
        infoPanelSelection.id,
        link.sharedTo.id,
        link.access,
        link.sharedTo.primary,
        link.sharedTo.internal || false,
        expDate,
      );

      updateLink(link, res);
      copyDocumentShareLink(res, t);
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const getTextTooltip = () => {
    return (
      <Text fontSize="12px" noSelect>
        {t("Common:MaximumNumberOfExternalLinksCreated")}
      </Text>
    );
  };

  const getData = (link: TFileLink): ContextMenuModel[] => {
    return [
      {
        key: "edit-link-key",
        label: t("Common:LinkSettings"),
        icon: SettingsReactSvgUrl,
        onClick: () => onEditLink(link),
      },
      {
        key: "copy-link-settings-key",
        label: t("Common:CopySharedLink"),
        icon: CopyToReactSvgUrl,
        onClick: () => copyDocumentShareLink(link, t),
      },
      {
        key: "embedding-settings-key",
        label: t("Common:Embed"),
        icon: CodeReactSvgUrl,
        onClick: () => onEmbeddingClick(link),
        disabled: !infoPanelSelection.security.Embed,
      },
      {
        key: "delete-link-separator",
        isSeparator: true,
      },
      {
        key: "delete-link-key",
        label: link.canEditExpirationDate
          ? t("Common:Delete")
          : t("Common:RevokeLink"),
        icon: link.canEditExpirationDate
          ? TrashReactSvgUrl
          : OutlineReactSvgUrl,
        onClick: () => removeLink(link),
      },
    ];
  };

  const isEvenPrimaryLink = useMemo(
    () => evenPrimaryLink(fileLinks as TFileLink[]),
    [fileLinks],
  );

  const availableExternalRights =
    infoPanelSelection && "availableExternalRights" in infoPanelSelection
      ? infoPanelSelection.availableExternalRights
      : undefined;

  if (hideSharePanel) return null;

  return (
    <div data-testid="shared-links">
      {visibleBar ? (
        <PublicRoomBar
          headerText={t("Common:ShareDocument")}
          bodyText={t("Common:ShareDocumentDescription")}
          iconName={InfoIcon}
          onClose={() => setVisibleBar(false)}
        />
      ) : null}

      {isLoading ? (
        <ShareLoader t={t} />
      ) : (
        <div className={styles.links}>
          <div className={styles.additionalLink}>
            <Text fontSize="14px" fontWeight={600} className={styles.titleLink}>
              {t("Common:SharedLinks")}
            </Text>
            {fileLinks.length > 0 && !onlyOneLink ? (
              <div data-tooltip-id="file-links-tooltip" data-tip="tooltip">
                <IconButton
                  className={styles.linkToViewingIcon}
                  iconName={LinksToViewingIconUrl}
                  onClick={
                    isEvenPrimaryLink ? addAdditionalLinks : addGeneralLink
                  }
                  size={16}
                  isDisabled={fileLinks.length > LINKS_LIMIT_COUNT}
                />
                {fileLinks.length > LINKS_LIMIT_COUNT ? (
                  <Tooltip
                    float={isDesktop()}
                    id="file-links-tooltip"
                    getContent={getTextTooltip}
                    place="bottom"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
          <LinkRow
            links={fileLinks}
            isFolder={isFolder}
            loadingLinks={loadingLinks}
            getData={getData}
            onAddClick={addGeneralLink}
            removedExpiredLink={removeLink}
            changeShareOption={changeShareOption}
            onOpenContextMenu={onOpenContextMenu}
            changeAccessOption={changeAccessOption}
            onCloseContextMenu={onCloseContextMenu}
            changeExpirationOption={changeExpirationOption}
            availableExternalRights={availableExternalRights}
          />
        </div>
      )}
    </div>
  );
};

export default Share;
