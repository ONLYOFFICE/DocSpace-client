import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";
import moment from "moment";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import { ShareAccessRights } from "../../enums";
import {
  addExternalLink,
  editExternalLink,
  getExternalLinks,
  getPrimaryLink,
} from "../../api/files";
import { TAvailableExternalRights, TFileLink } from "../../api/files/types";
import { TOption } from "../combobox";
import { Text } from "../text";
import { IconButton } from "../icon-button";
import { toastr } from "../toast";
import { TData } from "../toast/Toast.type";
import PublicRoomBar from "../public-room-bar";

import ShareLoader from "../../skeletons/share";

import LinkRow from "./sub-components/LinkRow";

import { StyledLinks } from "./Share.styled";
import { ShareProps, TLink } from "./Share.types";

const Share = (props: ShareProps) => {
  const {
    isRooms,
    setView,
    infoPanelSelection,
    getPrimaryFileLink,

    editFileLink,
    addFileLink,
    shareChanged,
    setShareChanged,
  } = props;
  const { t } = useTranslation(["Common"]);
  const [fileLinks, setFileLinks] = useState<TLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState<(string | number)[]>([]);

  const requestRunning = React.useRef(false);

  const [isLoadedAddLinks, setIsLoadedAddLinks] = useState(true);

  const hideSharePanel = isRooms || !infoPanelSelection?.canShare;

  const fetchLinks = React.useCallback(async () => {
    if (requestRunning.current) return;
    requestRunning.current = true;
    const res = await getExternalLinks(infoPanelSelection.id);

    setFileLinks(res.items);
    setIsLoading(false);
    requestRunning.current = false;
  }, [infoPanelSelection.id]);

  useEffect(() => {
    if (hideSharePanel) {
      setView?.("info_details");
    }
    fetchLinks();
  }, [fetchLinks, hideSharePanel, setView]);

  useEffect(() => {
    fetchLinks();
    setShareChanged?.(false);
  }, [fetchLinks, setShareChanged, shareChanged]);

  const addLoaderLink = () => {
    const link = { isLoaded: true };
    setFileLinks([...fileLinks, ...[link]]);
  };

  const addGeneralLink = async () => {
    addLoaderLink();

    const link = getPrimaryFileLink
      ? await getPrimaryFileLink(infoPanelSelection.id)
      : await getPrimaryLink(infoPanelSelection.id);

    setFileLinks([link]);
    copy(link.sharedTo.shareLink);
    toastr.success(t("Common:GeneralAccessLinkCopied"));
  };

  const addAdditionalLinks = async () => {
    if (!isLoadedAddLinks) return;

    setIsLoadedAddLinks(false);

    addLoaderLink();
    const newLink = addFileLink
      ? await addFileLink(
          infoPanelSelection.id,
          ShareAccessRights.ReadOnly,
          false,
          false,
        )
      : await addExternalLink(
          infoPanelSelection.id,
          ShareAccessRights.ReadOnly,
          false,
          false,
        );
    setFileLinks((links) => {
      const newLinks: TLink[] = [...links];

      const idx = newLinks.findIndex((l) => "isLoaded" in l && l.isLoaded);

      if (typeof idx !== "undefined") newLinks[idx] = { ...newLink };

      return newLinks;
    });

    setIsLoadedAddLinks(true);
  };

  const updateLink = (link: TFileLink, newItem: TFileLink) => {
    const newArr = fileLinks.map((item) => {
      if ("sharedTo" in item && item.sharedTo.id === newItem.sharedTo.id) {
        return newItem || null;
      }
      return item;
    });
    setFileLinks(newArr);

    const newLoadingLinks = loadingLinks.filter(
      (item) => item !== link.sharedTo.id,
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

      const res = editFileLink
        ? await editFileLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            link.access,
            link.sharedTo.primary,
            item.internal || false,
            expDate,
          )
        : await editExternalLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            link.access,
            link.sharedTo.primary,
            item.internal || false,
            expDate,
          );
      updateLink(link, res);

      copy(link.sharedTo.shareLink);
      toastr.success(t("Common:LinkSuccessfullyCopied"));
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const changeAccessOption = async (item: TOption, link: TFileLink) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const expDate = moment(link.sharedTo.expirationDate);

      const res = editFileLink
        ? await editFileLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            item.access || ShareAccessRights.ReadOnly,
            link.sharedTo.primary,
            item.internal || false,
            expDate,
          )
        : await editExternalLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            item.access || ShareAccessRights.ReadOnly,
            link.sharedTo.primary,
            item.internal || false,
            expDate,
          );

      if (item.access === ShareAccessRights.None) {
        deleteLink(link.sharedTo.id);
        if (link.sharedTo.primary) {
          toastr.success(t("Common:GeneralAccessLinkRemove"));
        } else {
          toastr.success(t("Common:AdditionalLinkRemove"));
        }
      } else {
        updateLink(link, res);
        if (item.access === ShareAccessRights.DenyAccess) {
          toastr.success(t("Common:LinkAccessDenied"));
        } else {
          copy(link.sharedTo.shareLink);
          toastr.success(t("Common:LinkSuccessfullyCopied"));
        }
      }
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  const changeExpirationOption = async (
    link: TFileLink,
    expirationDate: moment.Moment | null,
  ) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const expDate = moment(expirationDate);

      const res = editFileLink
        ? await editFileLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            link.access,
            link.sharedTo.primary,
            link.sharedTo.internal || false,
            expDate,
          )
        : await editExternalLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            link.access,
            link.sharedTo.primary,
            link.sharedTo.internal || false,
            expDate,
          );

      updateLink(link, res);

      copy(link.sharedTo.shareLink);
      toastr.success(t("Common:LinkSuccessfullyCopied"));
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  if (hideSharePanel) return null;

  return (
    <div>
      <PublicRoomBar
        headerText={t("Common:ShareDocument")}
        bodyText={t("Common:ShareDocumentDescription")}
        iconName={InfoIcon}
      />
      {isLoading ? (
        <ShareLoader t={t} />
      ) : (
        <StyledLinks>
          <div className="additional-link">
            <Text fontSize="14px" fontWeight={600} className="title-link">
              {t("Common:SharedLinks")}
            </Text>
            {fileLinks.length > 0 && (
              <IconButton
                className="link-to-viewing-icon"
                iconName={LinksToViewingIconUrl}
                onClick={addAdditionalLinks}
                size={16}
              />
            )}
          </div>
          <LinkRow
            onAddClick={addGeneralLink}
            links={fileLinks}
            changeShareOption={changeShareOption}
            changeAccessOption={changeAccessOption}
            changeExpirationOption={changeExpirationOption}
            availableExternalRights={
              infoPanelSelection.availableExternalRights ??
              ({} as TAvailableExternalRights)
            }
            loadingLinks={loadingLinks}
          />
        </StyledLinks>
      )}
    </div>
  );
};

export default Share;
