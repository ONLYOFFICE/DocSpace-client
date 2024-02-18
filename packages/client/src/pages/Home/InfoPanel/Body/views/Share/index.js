import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { toastr } from "@docspace/shared/components/toast";
import { ShareAccessRights } from "@docspace/shared/enums";

import PublicRoomBar from "../Members/sub-components/PublicRoomBar";
import LinkRow from "./LinkRow";
import ShareLoader from "./ShareLoader";

import { StyledLinks } from "./StyledShare";

const Share = (props) => {
  const {
    isRooms,
    setView,
    infoPanelSelection,
    getPrimaryFileLink,
    getFileLinks,
    editFileLink,
    addFileLink,
    shareChanged,
    setShareChanged,
  } = props;
  const { t } = useTranslation(["SharingPanel", "Files"]);
  const [fileLinks, setFileLinks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState([]);

  const hideSharePanel = isRooms || !infoPanelSelection?.canShare;

  useEffect(() => {
    if (hideSharePanel) {
      setView("info_details");
    }
    fetchLinks();
  }, [infoPanelSelection]);

  useEffect(() => {
    fetchLinks();
    setShareChanged(false);
  }, [shareChanged]);

  const fetchLinks = async () => {
    const res = await getFileLinks(infoPanelSelection.id);
    setFileLinks(res.items);
    setIsLoading(false);
  };

  const addGeneralLink = async () => {
    addLoaderLink();
    const link = await getPrimaryFileLink(infoPanelSelection.id);
    setFileLinks([link]);
    copy(link.sharedTo.shareLink);
    toastr.success(t("SharingPanel:GeneralAccessLinkCopied"));
  };

  const addAdditionalLinks = async () => {
    addLoaderLink();
    const newLink = await addFileLink(
      infoPanelSelection.id,
      ShareAccessRights.ReadOnly,
      false,
      false,
    );
    setFileLinks([...fileLinks, ...[newLink]]);
  };

  const addLoaderLink = () => {
    const link = { isLoaded: true };
    setFileLinks([...fileLinks, ...[link]]);
  };

  const changeShareOption = async (item, link) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const res = await editFileLink(
        infoPanelSelection.id,
        link.sharedTo.id,
        link.access,
        link.sharedTo.primary,
        item.internal,
        link.sharedTo.expirationDate,
      );
      updateLink(link, res);

      copy(link.sharedTo.shareLink);
      toastr.success(t("Files:LinkSuccessfullyCopied"));
    } catch (e) {
      toastr.error(e);
    }
  };

  const changeAccessOption = async (item, link) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const res = await editFileLink(
        infoPanelSelection.id,
        link.sharedTo.id,
        item.access,
        link.sharedTo.primary,
        link.sharedTo.internal,
        link.sharedTo.expirationDate,
      );
      if (item.access === ShareAccessRights.None) {
        deleteLink(link.sharedTo.id);
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
          toastr.success(t("Files:LinkSuccessfullyCopied"));
        }
      }
    } catch (e) {
      toastr.error(e);
    }
  };

  const changeExpirationOption = async (link, expirationDate) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const res = await editFileLink(
        infoPanelSelection.id,
        link.sharedTo.id,
        link.access,
        link.sharedTo.primary,
        link.sharedTo.internal,
        expirationDate,
      );
      updateLink(link, res);

      copy(link.sharedTo.shareLink);
      toastr.success(t("Files:LinkSuccessfullyCopied"));
    } catch (e) {
      toastr.error(e);
    }
  };

  const updateLink = (link, newItem) => {
    const newArr = fileLinks.map((item) => {
      if (item.sharedTo.id === newItem.sharedTo.id) {
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

  const deleteLink = (id) => {
    const newArr = fileLinks.filter((item) => item.sharedTo.id !== id);
    setFileLinks(newArr);
  };

  if (hideSharePanel) return <></>;

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
            <div className="additional-link">
              <Text fontSize="14px" fontWeight={600} className="title-link">
                {t("Files:SharedLinks")}
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
                infoPanelSelection.availableExternalRights
              }
              loadingLinks={loadingLinks}
            />
          </StyledLinks>
        </>
      )}
    </div>
  );
};

export default inject(({ infoPanelStore }) => {
  const {
    setView,
    getPrimaryFileLink,
    getFileLinks,
    editFileLink,
    addFileLink,
    shareChanged,
    setShareChanged,
  } = infoPanelStore;

  return {
    setView,
    getPrimaryFileLink,
    getFileLinks,
    editFileLink,
    addFileLink,
    shareChanged,
    setShareChanged,
  };
})(observer(Share));
