import React, { useState } from "react";
import styled from "styled-components";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import ImportSection from "../sub-components/ImportSection";
import Text from "@docspace/components/text";

import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserIcon from "PUBLIC_DIR/images/catalog.user.react.svg";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const NextcloudWrapper = styled.div`
  max-width: 700px;

  .data-import-counter {
    margin-top: 20px;
    margin-bottom: 8px;
  }

  .data-import-section-description {
    margin-bottom: 16px;
  }

  .sections-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .save-cancel-buttons {
    margin-top: 22px;
  }
`;

const NextcloudWorkspace = (props) => {
  const { t } = props;
  const [isChecked, setIsChecked] = useState({
    users: true,
    pFiles: true,
    sFiles: true,
  });

  const onChange = (name) => {
    setIsChecked((prevIsChecked) => ({
      ...prevIsChecked,
      [name]: !prevIsChecked[name],
    }));
  };
  return (
    <NextcloudWrapper>
      <Text
        className="data-import-description"
        lineHeight="20px"
        color="#657077"
      >
        {t("Settings:AboutDataImport")}
      </Text>
      <Text
        className="data-import-counter"
        fontSize="16px"
        fontWeight={700}
        lineHeight="22px"
      >
        5/7. Data import
      </Text>
      <Text className="data-import-section-description" lineHeight="16px">
        Select sections for import. They will appear in the corresponding
        sections of DocSpace.
      </Text>
      <div className="sections-wrapper">
        <ImportSection
          isChecked={isChecked.users}
          onChange={() => onChange("users")}
          sectionName="Users"
          description="Section “Users” includes the users you selected in the previous step. By default, it is always enabled and can’t be unselected. "
          exportSection={{ sectionName: "Users", workspace: "NextCloud" }}
          importSection={{
            sectionName: "Accounts",
            workspace: "DocSpace",
            SectionIcon: PeopleIcon,
          }}
          isDisabled
        />
        <ImportSection
          isChecked={isChecked.pFiles}
          onChange={() => onChange("pFiles")}
          sectionName="Personal files"
          description={`Files and documents of Nextcloud users will be imported into the users' "My Documents" section.`}
          exportSection={{
            sectionName: "User’s Files",
            workspace: "NextCloud",
          }}
          importSection={{
            sectionName: "Accounts",
            workspace: "My documents",
            SectionIcon: UserIcon,
          }}
        />
        <ImportSection
          isChecked={isChecked.sFiles}
          onChange={() => onChange("sFiles")}
          sectionName="Shared files"
          description="Files shared with other users will be copied to their personal documents regardless of the permission level in Nextcloud. "
          exportSection={{
            sectionName: "Shared Files",
            workspace: "NextCloud",
          }}
          importSection={{
            sectionName: "My documents",
            workspace: "DocSpace",
            SectionIcon: PeopleIcon,
          }}
        />
      </div>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={() => console.log("save")}
        onCancelClick={() => console.log("cancel")}
        showReminder={true}
        // reminderTest={t("Settings:YouHaveUnsavedChanges")}
        saveButtonLabel={"Next step"}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
        cancelEnable
      />
    </NextcloudWrapper>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Common, Settings"])(observer(NextcloudWorkspace)));
