import { useState } from "react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";
import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserIcon from "PUBLIC_DIR/images/catalog.user.react.svg";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FourthStep = ({ t, onNextStepClick, onPrevStepClick, showReminder }) => {
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
    <Wrapper>
      <ImportSection
        isChecked={isChecked.users}
        onChange={() => onChange("users")}
        sectionName="Users"
        description="Section “Users” includes the users you selected in the previous step. By default, it is always enabled and can't be unselected."
        exportSection={{ sectionName: "Users", workspace: "Google Workspace" }}
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
        description={`Files and documents of Google Workspace users will be imported into the users' "My Documents" section.`}
        exportSection={{
          sectionName: "Google Drive's Files",
          workspace: "Google Workspace",
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
        description="Files shared with other users will be copied to their personal documents regardless of the permission level in Google Workspace."
        exportSection={{
          sectionName: "Shared Files",
          workspace: "Google Workspace",
        }}
        importSection={{
          sectionName: "My documents",
          workspace: "DocSpace",
          SectionIcon: UserIcon,
        }}
      />

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStepClick}
        onCancelClick={onPrevStepClick}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
        showReminder={showReminder}
      />
    </Wrapper>
  );
};
export default FourthStep;
