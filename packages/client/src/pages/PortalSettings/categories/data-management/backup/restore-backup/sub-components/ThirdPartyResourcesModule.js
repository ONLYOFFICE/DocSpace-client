import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import DirectThirdPartyConnection from "../../common-container/DirectThirdPartyConnection";
import { FilesSelectorFilterTypes } from "@docspace/common/constants";

const ThirdPartyResources = (props) => {
  const { setRestoreResource, buttonSize } = props;

  const { t } = useTranslation("Settings");

  const onSelectFile = (file) => {
    setRestoreResource(file.id);
  };

  return (
    <div className="restore-backup_third-party-module">
      <DirectThirdPartyConnection
        className="restore-backup_input"
        onSelectFile={onSelectFile}
        filterParam={FilesSelectorFilterTypes.GZ}
        descriptionText={t("SelectFileInGZFormat")}
        withoutInitPath
        buttonSize={buttonSize}
        isMobileScale
      />
    </div>
  );
};

export default inject(({ backup }) => {
  const { setRestoreResource } = backup;

  return {
    setRestoreResource,
  };
})(observer(ThirdPartyResources));
