import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import IconButton from "@docspace/components/icon-button";

import PublicRoomBar from "../Members/sub-components/PublicRoomBar";
import LinkRow from "./LinkRow";

import { StyledLinks } from "./StyledShare";

const Share = (props) => {
  const { isRooms, setView } = props;
  const { t } = useTranslation("SharingPanel");

  const [generalLink, setGeneralLink] = useState([]);
  const [additionalLinks, setAdditionalLinks] = useState([]);

  useEffect(() => {
    if (isRooms) {
      setView("info_details");
    }
  }, []);

  const addGeneralLink = () => {
    const link = {
      type: "anyone",
    };
    setGeneralLink([link]);
  };

  const addAdditionalLinks = () => {
    const link = {
      type: "users",
    };
    setAdditionalLinks([...additionalLinks, link]);
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
        <LinkRow onAddClick={addGeneralLink} links={generalLink} />
      </StyledLinks>

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
        <LinkRow onAddClick={addAdditionalLinks} links={additionalLinks} />
      </StyledLinks>
    </div>
  );
};

export default inject(({ auth }) => {
  const { setView } = auth.infoPanelStore;

  return {
    setView,
  };
})(observer(Share));
