import moment from "moment";
import axios, { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import OutlineReactSvgUrl from "PUBLIC_DIR/images/outline-true.react.svg?url";

import { isDesktop } from "../../../utils";
import { ShareAccessRights } from "../../../enums";
import type { TFileLink } from "../../../api/files/types";
import { ShareLinkService } from "../../../services/share-link.service";
import { getExternalFolderLinks, getExternalLinks } from "../../../api/files";

import { TOption } from "../../combobox";
import { TData, toastr } from "../../toast";
import { Text } from "../../text";
import { IconButton } from "../../icon-button";
import { Tooltip } from "../../tooltip";

import LinkRow from "../sub-components/LinkRow";
import ShareHeader from "../sub-components/ShareHeader";
import { CreateButton } from "../sub-components/CreateButton";

import styles from "../Share.module.scss";
import { copyShareLink, evenPrimaryLink } from "../Share.helpers";
import type { AccessItem, TLink, UseShareProps } from "../Share.types";

export const useShare = ({
  setView,
  setIsLoading,
  fileLinkProps,
  onlyOneLink,
  shareChanged,
  infoPanelSelection,
  onOpenPanel,
  setLinkParams,
  setShareChanged,
  setIsScrollLocked,
  setEditLinkPanelIsVisible,
  setEmbeddingPanelData,
}: UseShareProps) => {
  const isFolder = infoPanelSelection.isFolder;

  const { t } = useTranslation(["Common"]);
  const [fileLinks, setFileLinks] = useState<TLink[]>(fileLinkProps ?? []);

  const [loadingLinks, setLoadingLinks] = useState<(string | number)[]>([]);

  const mountedRef = useRef(true);

  const requestRunning = useRef(false);
  const isInit = useRef(!!fileLinkProps);

  const [isLoadedAddLinks, setIsLoadedAddLinks] = useState(true);
  const hideSharePanel = !infoPanelSelection?.canShare;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchLinks = useCallback(async () => {
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
  }, [infoPanelSelection?.id, hideSharePanel, isFolder, setIsLoading]);

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
    const link = { key: "loader", isLoaded: true };
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
        copyShareLink(infoPanelSelection, link, t);
      } else {
        setFileLinks([]);
      }
    } catch (error) {
      console.error(error);
      setFileLinks([]);
      if (axios.isAxiosError(error)) {
        const errorData = error as AxiosError<{ error: { message: string } }>;

        if (errorData?.response?.data?.error?.message) {
          toastr.error(errorData?.response?.data?.error?.message);
          return;
        }
      }

      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);
      toastr.error(message);
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
      console.error(error);
      setFileLinks((links) => {
        return links.filter((link) => !("isLoaded" in link && link.isLoaded));
      });

      if (axios.isAxiosError(error)) {
        const errorData = error as AxiosError<{ error: { message: string } }>;

        if (errorData?.response?.data?.error?.message) {
          return toastr.error(errorData?.response?.data?.error?.message);
        }
      }

      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);

      toastr.error(message);
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

      const res = await ShareLinkService.editLink(infoPanelSelection, {
        ...link,
        sharedTo: {
          ...link.sharedTo,
          internal: item.internal || false,
        },
      });

      updateLink(link, res);
      copyShareLink(infoPanelSelection, res, t);
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const changeAccessOption = async (item: AccessItem, link: TFileLink) => {
    const updateAccessLink = async () => {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      try {
        const res = await ShareLinkService.editLink(infoPanelSelection, {
          ...link,
          access: item.access!,
        });

        if (item.access === ShareAccessRights.None) {
          deleteLink(link.sharedTo.id);
          toastr.success(t("Common:LinkRemoved"));
        } else {
          updateLink(link, res);
          if (item.access === ShareAccessRights.DenyAccess) {
            toastr.success(t("Common:LinkAccessDenied"));
          } else {
            copyShareLink(infoPanelSelection, res, t);
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
      setLoadingLinks((val) => [...val, link.sharedTo.id]);

      const newLink = await ShareLinkService.editLink(infoPanelSelection, {
        ...link,
        access: ShareAccessRights.None,
      });

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

      const res = await ShareLinkService.editLink(infoPanelSelection, {
        ...link,
        sharedTo: {
          ...link.sharedTo,
          expirationDate: expirationDate ? expDate.toISOString() : null,
        },
      });

      updateLink(link, res);
      copyShareLink(infoPanelSelection, res, t);
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const onCopyLink = (link: TFileLink) => {
    if (link.sharedTo?.isExpired) return;

    copyShareLink(infoPanelSelection, link, t);
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
        onClick: () => copyShareLink(infoPanelSelection, link, t),
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

  const countCanCreateLink = Math.max(
    0,
    (infoPanelSelection?.shareSettings?.ExternalLink ?? 0) +
      (infoPanelSelection?.shareSettings?.PrimaryExternalLink ?? 0) -
      1,
  );

  const canAddLink = (infoPanelSelection?.shareSettings?.ExternalLink ?? 0) > 0;

  const getTextTooltip = () => {
    return (
      <Text fontSize="12px" noSelect>
        {t("Common:MaximumNumberOfExternalLinksCreated")}
      </Text>
    );
  };

  const getLinkElements = () => {
    const options =
      fileLinks.length > 0 && !onlyOneLink && canAddLink ? (
        <div data-tooltip-id="file-links-tooltip" data-tip="tooltip">
          <IconButton
            className={styles.linkToViewingIcon}
            iconName={LinksToViewingIconUrl}
            onClick={isEvenPrimaryLink ? addAdditionalLinks : addGeneralLink}
            size={16}
            isDisabled={fileLinks.length > countCanCreateLink}
            dataTestId="info_panel_share_add_link_button"
          />
          {fileLinks.length > countCanCreateLink ? (
            <Tooltip
              float={isDesktop()}
              id="file-links-tooltip"
              getContent={getTextTooltip}
              place="bottom"
            />
          ) : null}
        </div>
      ) : null;

    const header = (
      <ShareHeader
        key="share-header"
        title={t("Common:SharedLinks")}
        options={options}
      />
    );

    if (fileLinks.length === 0)
      return [
        header,
        <CreateButton
          key="share-create-link"
          onClick={addGeneralLink}
          title={t("Common:CreateAndCopy")}
        />,
      ];

    return [
      header,
      ...fileLinks.map((link) => (
        <LinkRow
          key={"key" in link ? link.key : link.sharedTo?.id?.toString()}
          links={[link]}
          getData={getData}
          isFolder={isFolder}
          onCopyLink={onCopyLink}
          onAddClick={addGeneralLink}
          loadingLinks={loadingLinks}
          removedExpiredLink={removeLink}
          changeShareOption={changeShareOption}
          onOpenContextMenu={onOpenContextMenu}
          changeAccessOption={changeAccessOption}
          onCloseContextMenu={onCloseContextMenu}
          changeExpirationOption={changeExpirationOption}
          availableExternalRights={availableExternalRights}
        />
      )),
    ];
  };

  return { getLinkElements };
};
