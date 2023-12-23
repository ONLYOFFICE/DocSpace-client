import { inject, observer } from "mobx-react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import AccountsIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import DocumentsIcon from "PUBLIC_DIR/images/catalog.documents.react.svg";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .save-cancel-buttons {
    margin-top: 4px;
  }
`;

const ImportStep = ({
  t,
  onNextStep,
  onPrevStep,
  showReminder,
  importOptions,
  setImportOptions,
}) => {
  const onChange = (e, name) => {
    const checked = e.target.checked;
    setImportOptions({ [name]: checked });
  };

  const serviceName = "Google Workspace";
  const users =
    t("Settings:Employees")[0].toUpperCase() + t("Settings:Employees").slice(1);

  return (
    <Wrapper>
      <ImportSection
        isChecked
        sectionName={users}
        description={t("Settings:UsersSectionDescription")}
        exportSection={{ sectionName: users, workspace: serviceName }}
        importSection={{
          sectionName: t("Common:Accounts"),
          workspace: "DocSpace",
          SectionIcon: PeopleIcon,
        }}
        isDisabled
      />
      <ImportSection
        isChecked={importOptions.importGroups}
        onChange={(e) => onChange(e, "importGroups")}
        sectionName={t("Common:Groups")}
        description={t("Settings:GroupsDescription", { serviceName })}
        exportSection={{
          sectionName: t("Common:Groups"),
          workspace: serviceName,
        }}
        importSection={{
          sectionName: t("Common:Accounts"),
          workspace: "DocSpace",
          SectionIcon: AccountsIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importPersonalFiles}
        onChange={(e) => onChange(e, "importPersonalFiles")}
        sectionName={t("Settings:PersonalFiles")}
        description={t("Settings:PersonalFilesDescription")}
        exportSection={{
          sectionName: "Google Drive's Files",
          workspace: serviceName,
        }}
        importSection={{
          sectionName: t("Settings:Documents"),
          workspace: "DocSpace",
          SectionIcon: DocumentsIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importSharedFiles}
        onChange={(e) => onChange(e, "importSharedFiles")}
        sectionName={t("Settings:SharedFiles")}
        description={t("Settings:SharedFilesDescription")}
        exportSection={{
          sectionName: t("Settings:SharedFiles"),
          workspace: serviceName,
        }}
        importSection={{
          sectionName: t("Settings:Documents"),
          workspace: "DocSpace",
          SectionIcon: DocumentsIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importSharedFolders}
        onChange={(e) => onChange(e, "importSharedFolders")}
        sectionName={t("Settings:SharedFolders")}
        description={t("Settings:SharedFoldersDescription")}
        exportSection={{
          sectionName: t("Settings:SharedFolders"),
          workspace: serviceName,
        }}
        importSection={{
          sectionName: t("Common:Rooms"),
          workspace: "DocSpace",
          SectionIcon: DocumentsIcon,
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

export default inject(({ importAccountsStore }) => {
  const { importOptions, setImportOptions } = importAccountsStore;

  return {
    importOptions,
    setImportOptions,
  };
})(observer(ImportStep));
