import React, { useState } from "react";

import ImportSection from "../../../sub-components/ImportSection";

import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserIcon from "PUBLIC_DIR/images/catalog.user.react.svg";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

const FifthStep = ({ t, incrementStep, decrementStep }) => {
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

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
        showReminder
      />
    </div>
  );
};
export default FifthStep;
