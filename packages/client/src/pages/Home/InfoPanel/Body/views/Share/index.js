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
    selection,
    getPrimaryFileLink,
    getFileLinks,
    editFileLink,
    addFileLink,
    shareChanged,
    setShareChanged,
  } = props;
  const { t } = useTranslation(["SharingPanel", "Files"]);
  const [primaryFileLink, setPrimaryFileLink] = useState([]);
  const [additionalFileLinks, setAdditionalFileLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState([]);

  const hideSharePanel = isRooms || !selection?.canShare;

  useEffect(() => {
    if (hideSharePanel) {
      setView("info_details");
    }
    fetchLinks();
  }, [selection]);

  useEffect(() => {
    fetchLinks();
    setShareChanged(false);
  }, [shareChanged]);

  const fetchLinks = async () => {
    const res = await getFileLinks(selection.id);
    const primaryLink = res.items.filter(
      (item) => item.sharedTo.primary === true
    );
    const additionalLinks = res.items.filter(
      (item) => item.sharedTo.primary !== true
    );

    setPrimaryFileLink(primaryLink);
    setAdditionalFileLinks(additionalLinks);
    setIsLoading(false);
  };

  const addGeneralLink = async () => {
    addLoaderLink(true);
    const link = await getPrimaryFileLink(selection.id);
    setPrimaryFileLink([link]);
    copy(link.sharedTo.shareLink);
    toastr.success(t("SharingPanel:GeneralAccessLinkCopied"));
  };

  const addAdditionalLinks = async () => {
    addLoaderLink(false);
    const newLink = await addFileLink(
      selection.id,
      ShareAccessRights.ReadOnly,
      false,
      false
    );
    setAdditionalFileLinks([...additionalFileLinks, ...[newLink]]);
  };

  const addLoaderLink = (primary) => {
    const link = { isLoaded: true };
    if (primary) {
      setPrimaryFileLink([link]);
    } else {
      setAdditionalFileLinks([...additionalFileLinks, ...[link]]);
    }
  };

  const changeShareOption = async (item, link) => {
    try {
      setLoadingLinks([...loadingLinks, link.sharedTo.id]);

      const res = await editFileLink(
        selection.id,
        link.sharedTo.id,
        link.access,
        link.sharedTo.primary,
        item.internal,
        link.sharedTo.expirationDate
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
        selection.id,
        link.sharedTo.id,
        item.access,
        link.sharedTo.primary,
        link.sharedTo.internal,
        link.sharedTo.expirationDate
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
        selection.id,
        link.sharedTo.id,
        link.access,
        link.sharedTo.primary,
        link.sharedTo.internal,
        expirationDate
      );
      updateLink(link, res);

      copy(link.sharedTo.shareLink);
      toastr.success(t("Files:LinkSuccessfullyCopied"));
    } catch (e) {
      toastr.error(e);
    }
  };

  const updateLink = (link, newItem) => {
    if (link.sharedTo.primary) {
      setPrimaryFileLink([newItem]);
    } else {
      const newArr = additionalFileLinks.map((item) => {
        if (item.sharedTo.id === newItem.sharedTo.id) {
          return newItem || null;
        }
        return item;
      });
      setAdditionalFileLinks(newArr);
    }
    const newLoadingLinks = loadingLinks.filter(
      (item) => item !== link.sharedTo.id
    );
    setLoadingLinks(newLoadingLinks);
  };

  const deleteLink = (link, id) => {
    if (link.sharedTo.primary) {
      setPrimaryFileLink(null);
    } else {
      const newArr = additionalFileLinks.filter(
        (item) => item.sharedTo.id !== id
      );
      setAdditionalFileLinks(newArr);
    }
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
            <Text fontSize="14px" fontWeight={600} className="title-link">
              {t("GeneralAccessLink")}
            </Text>
            <LinkRow
              onAddClick={addGeneralLink}
              links={primaryFileLink}
              changeShareOption={changeShareOption}
              changeAccessOption={changeAccessOption}
              changeExpirationOption={changeExpirationOption}
              availableExternalRights={selection.availableExternalRights}
              loadingLinks={loadingLinks}
            />
          </StyledLinks>

          {(primaryFileLink?.length > 0 || additionalFileLinks?.length > 0) && (
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
                availableExternalRights={selection.availableExternalRights}
                loadingLinks={loadingLinks}
              />
            </StyledLinks>
          )}
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
