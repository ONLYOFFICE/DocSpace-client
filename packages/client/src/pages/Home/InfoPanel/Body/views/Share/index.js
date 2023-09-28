import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import PublicRoomBar from "../Members/sub-components/PublicRoomBar";

const Share = (props) => {
  const { isRooms, setView } = props;
  const { t } = useTranslation("InfoPanel");

  useEffect(() => {
    if (isRooms) {
      setView("info_details");
    }
  }, []);

  return (
    <div>
      <PublicRoomBar
        headerText={t("ShareDocument")}
        bodyText={t("ShareDocumentDescription")}
        iconName={InfoIcon}
      />
    </div>
  );
};

export default inject(({ auth }) => {
  const { setView } = auth.infoPanelStore;

  return {
    setView,
  };
})(observer(Share));
