import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";

import Text from "@docspace/components/text";
import IconButton from "@docspace/components/icon-button";
import toastr from "@docspace/components/toast/toastr";

import PublicRoomBar from "../Members/sub-components/PublicRoomBar";
import LinkRow from "./LinkRow";

import { StyledLinks } from "./StyledShare";

const Share = (props) => {
  const {
    isRooms,
    setView,
    selection,
    getPrimaryFileLink,
    getAdditionalFileLinks,
  } = props;
  const { t } = useTranslation(["SharingPanel", "Files"]);
  const [primaryFileLink, setPrimaryFileLink] = useState(null);
  const [additionalFileLinks, setAdditionalFileLinks] = useState(null);

  useEffect(() => {
    if (isRooms || !selection?.canShare) {
      setView("info_details");
    }

    if (selection?.shared) {
      fetchLinks();
    }
  }, []);

  const fetchLinks = async () => {
    const link = await getPrimaryFileLink(selection.id);
    setPrimaryFileLink([link]);
    //const links = await getAdditionalFileLinks(selection.id);
    //setAdditionalFileLinks(links.items);
  };

  const addGeneralLink = async () => {
    const link = await getPrimaryFileLink(selection.id);
    setPrimaryFileLink([link]);
    copy(link.sharedTo.shareLink);
    toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
  };

  const addAdditionalLinks = async () => {
    const links = await getAdditionalFileLinks(selection.id);
    setAdditionalFileLinks(links.items);
  };

  return (
    <div>
      <PublicRoomBar
        headerText={t("ShareDocument")}
        bodyText={t("ShareDocumentDescription")}
        iconName={InfoIcon}
      />
      <StyledLinks>
        <Text fontSize="14px" fontWeight={600} className="title-link">
          {t("GeneralAccessLink")}
        </Text>
        <LinkRow
          onAddClick={addGeneralLink}
          links={primaryFileLink}
          fileId={selection.id}
        />
      </StyledLinks>

      {primaryFileLink?.length > 0 && (
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
            fileId={selection.id}
          />
        </StyledLinks>
      )}
    </div>
  );
};

export default inject(({ auth }) => {
  const { setView, getPrimaryFileLink, getAdditionalFileLinks } =
    auth.infoPanelStore;

  return {
    setView,
    getPrimaryFileLink,
    getAdditionalFileLinks,
  };
})(observer(Share));
