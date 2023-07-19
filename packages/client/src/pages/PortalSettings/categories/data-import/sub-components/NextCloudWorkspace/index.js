import React, { useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import ImportSection from "./ImportSection";
import Text from "@docspace/components/text";

import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";

const NextcloudWorkspace = (props) => {
  const { t } = props;
  const [isChecked, setIsChecked] = useState(false);

  const onChange = () => {
    setIsChecked((prevIsChecked) => !prevIsChecked);
  };
  return (
    <div>
      <Text className="data-import-description">{t("Settings:AboutDataImport")}</Text>
      <ImportSection
        isChecked={isChecked}
        onChange={onChange}
        sectionName="Users"
        description="Section “Users” includes the users you selected in the previous step. By default, it is always enabled and can’t be unselected. "
        exportSection={{ sectionName: "users", workspace: "Google Workspace" }}
        importSection={{ sectionName: "Accounts", workspace: "DocSpace", SectionIcon: PeopleIcon }}
      />
    </div>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Common, Settings"])(observer(NextcloudWorkspace)));
