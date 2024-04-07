// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { copyShareLink } from "../../utils/copy";
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
    if (requestRunning.current || hideSharePanel) return;
    requestRunning.current = true;
    const res = await getExternalLinks(infoPanelSelection.id);

    setFileLinks(res.items);
    setIsLoading(false);
    requestRunning.current = false;
  }, [infoPanelSelection.id, hideSharePanel]);

  useEffect(() => {
    if (hideSharePanel) {
      setView?.("info_details");
    } else {
      fetchLinks();
    }
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
    try {
      addLoaderLink();

      const link = getPrimaryFileLink
        ? await getPrimaryFileLink(infoPanelSelection.id)
        : await getPrimaryLink(infoPanelSelection.id);

      setFileLinks([link]);
      copyShareLink(link.sharedTo.shareLink);
      toastr.success(t("Common:GeneralAccessLinkCopied"));
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

      copyShareLink(link.sharedTo.shareLink);
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
            item.access ?? ({} as ShareAccessRights),
            link.sharedTo.primary,
            link.sharedTo.internal || false,
            expDate,
          )
        : await editExternalLink(
            infoPanelSelection.id,
            link.sharedTo.id,
            item.access ?? ({} as ShareAccessRights),
            link.sharedTo.primary,
            link.sharedTo.internal || false,
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
          copyShareLink(link.sharedTo.shareLink);
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

      copyShareLink(link.sharedTo.shareLink);
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
