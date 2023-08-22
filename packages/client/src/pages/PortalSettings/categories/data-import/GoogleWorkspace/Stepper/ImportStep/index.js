import { useState } from "react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserIcon from "PUBLIC_DIR/images/catalog.user.react.svg";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .save-cancel-buttons {
    margin-top: 4px;
  }
`;

const ImportStep = ({ t, onNextStep, onPrevStep, showReminder }) => {
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

  const serviceName = "Google Workspace";

  return (
    <Wrapper>
      <ImportSection
        isChecked={isChecked.users}
        onChange={() => onChange("users")}
        sectionName="Users"
        description={t("Settings:UsersSectionDescription")}
        exportSection={{ sectionName: "Users", workspace: serviceName }}
        importSection={{
          sectionName: t("Common:Accounts"),
          workspace: "DocSpace",
          SectionIcon: PeopleIcon,
        }}
        isDisabled
      />
      <ImportSection
        isChecked={isChecked.pFiles}
        onChange={() => onChange("pFiles")}
        sectionName={t("Settings:PersonalFiles")}
        description={t("Settings:PersonalFilesDescription", { serviceName })}
        exportSection={{
          sectionName: "Google Drive's Files",
          workspace: serviceName,
        }}
        importSection={{
          sectionName: "My documents",
          workspace: "DocSpace",
          SectionIcon: UserIcon,
        }}
      />
      <ImportSection
        isChecked={isChecked.sFiles}
        onChange={() => onChange("sFiles")}
        sectionName={t("Settings:SharedFiles")}
        description={t("Settings:SharedFilesDescription", { serviceName })}
        exportSection={{
          sectionName: "Shared Files",
          workspace: serviceName,
        }}
        importSection={{
          sectionName: "My documents",
          workspace: "DocSpace",
          SectionIcon: UserIcon,
        }}
      />

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStep}
        onCancelClick={onPrevStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
        showReminder={showReminder}
      />
    </Wrapper>
  );
};
export default ImportStep;
