import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import { StyledWrapper } from "../StyledDataImport";

const GoogleWorkspace = (props) => {
  const { t } = props;
  return (
    <StyledWrapper>
      <Text className="data-import-description">
        {t("Settings:AboutDataImport")}
      </Text>
    </StyledWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Settings"])(observer(GoogleWorkspace)));
