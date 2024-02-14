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
  const [primaryFileLink, setPrimaryFileLink] = useState<TLink[] | null>([]);
  const [additionalFileLinks, setAdditionalFileLinks] = useState<TLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState<(string | number)[]>([]);

  const requestRunning = React.useRef(false);

  const hideSharePanel = isRooms || !infoPanelSelection?.canShare;

  const fetchLinks = React.useCallback(async () => {
    if (requestRunning.current) return;
    requestRunning.current = true;
    const res = await getExternalLinks(infoPanelSelection.id);
    const primaryLink = res.items.filter(
      (item) => item.sharedTo.primary === true,
    );
    const additionalLinks = res.items.filter(
      (item) => item.sharedTo.primary !== true,
    );

    setPrimaryFileLink(primaryLink);
    setAdditionalFileLinks(additionalLinks);
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

  const addLoaderLink = (primary: boolean) => {
    const link = { isLoaded: true };
    if (primary) {
      setPrimaryFileLink([link]);
    } else {
      setAdditionalFileLinks([...additionalFileLinks, ...[link]]);
    }
  };

  const addGeneralLink = async () => {
    addLoaderLink(true);

    const link = getPrimaryFileLink
      ? await getPrimaryFileLink(infoPanelSelection.id)
      : await getPrimaryLink(infoPanelSelection.id);

    setPrimaryFileLink([link]);
    copy(link.sharedTo.shareLink);
    toastr.success(t("Common:GeneralAccessLinkCopied"));
  };

  const addAdditionalLinks = async () => {
    addLoaderLink(false);
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
    setAdditionalFileLinks((links) => {
      const newLinks: TLink[] = [...links];

      const idx = newLinks.findIndex((l) => "isLoaded" in l && l.isLoaded);

      if (typeof idx !== "undefined") newLinks[idx] = { ...newLink };

      return newLinks;
    });
  };

  const updateLink = (link: TFileLink, newItem: TFileLink) => {
    if (link.sharedTo.primary) {
      setPrimaryFileLink([newItem]);
    } else {
      const newArr = additionalFileLinks.map((item) => {
        if ("sharedTo" in item && item.sharedTo.id === newItem.sharedTo.id) {
          return newItem || null;
        }
        return item;
      });
      setAdditionalFileLinks(newArr);
    }
    const newLoadingLinks = loadingLinks.filter(
      (item) => item !== link.sharedTo.id,
    );
    setLoadingLinks(newLoadingLinks);
  };

  const deleteLink = (link: TFileLink, id: string | number) => {
    if (link.sharedTo.primary) {
      setPrimaryFileLink(null);
    } else {
      const newArr = additionalFileLinks.filter(
        (item) => "sharedTo" in item && item.sharedTo.id !== id,
      );
      setAdditionalFileLinks(newArr);
    }
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

      if (item.access === ShareAccessRights.None) {
        deleteLink(link, link.sharedTo.id);
        if (link.sharedTo.primary) {
          toastr.success(t("GeneralAccessLinkRemove"));
        } else {
          toastr.success(t("AdditionalLinkRemove"));
        }
      } else {
        updateLink(link, res);
        if (item.access === ShareAccessRights.DenyAccess) {
          toastr.success(t("LinkAccessDenied"));
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
        headerText={t("ShareDocument")}
        bodyText={t("ShareDocumentDescription")}
        iconName={InfoIcon}
      />
      {isLoading ? (
        <ShareLoader t={t} />
      ) : (
        <>
          <StyledLinks>
            <Text fontSize="14px" fontWeight={600} className="title-link">
              {t("GeneralAccessLink")}
            </Text>
            <LinkRow
              onAddClick={addGeneralLink}
              links={primaryFileLink}
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

          {((primaryFileLink && primaryFileLink.length > 0) ||
            additionalFileLinks?.length > 0) && (
            <StyledLinks>
              <div className="additional-link">
                <Text fontSize="14px" fontWeight={600} className="title-link">
                  {t("AdditionalLinks")}
                </Text>
                <IconButton
                  className="link-to-viewing-icon"
                  iconName={LinksToViewingIconUrl}
                  onClick={addAdditionalLinks}
                  size={16}
                />
              </div>
              <LinkRow
                onAddClick={addAdditionalLinks}
                links={additionalFileLinks}
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
        </>
      )}
    </div>
  );
};

export default Share;
