import { inject, observer } from "mobx-react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import AccountsIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserSolidIcon from "PUBLIC_DIR/images/catalog.user.solid.react.svg";
import SharedIcon from "PUBLIC_DIR/images/catalog.old.share.react.svg";
import RoomsIcon from "PUBLIC_DIR/images/catalog.rooms.react.svg";
import PortfolioIcon from "PUBLIC_DIR/images/catalog.portfolio.react.svg";
import ProjectsIcon from "PUBLIC_DIR/images/catalog.projects.react.svg";
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

  const serviceName = "Onlyoffice Workspace";
  const users =
    t("Settings:Employees")[0].toUpperCase() + t("Settings:Employees").slice(1);

  return (
    <Wrapper>
      <ImportSection
        isChecked
        sectionName={users}
        description={t("Settings:UsersSectionDescription")}
        exportSection={{
          sectionName: t("Common:People"),
          workspace: serviceName,
          SectionIcon: UserSolidIcon,
        }}
        importSection={{
          sectionName: t("Common:Accounts"),
          workspace: "DocSpace",
          SectionIcon: AccountsIcon,
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
          sectionName: t("Common:MyDocuments"),
          workspace: serviceName,
          SectionIcon: UserSolidIcon,
        }}
        importSection={{
          sectionName: t("Common:Documents"),
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
          sectionName: t("Common:SharedWithMe"),
          workspace: serviceName,
          SectionIcon: SharedIcon,
        }}
        importSection={{
          sectionName: t("Common:Documents"),
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
          sectionName: t("Common:SharedWithMe"),
          workspace: serviceName,
          SectionIcon: SharedIcon,
        }}
        importSection={{
          sectionName: t("Common:Rooms"),
          workspace: "DocSpace",
          SectionIcon: RoomsIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importCommonFiles}
        onChange={(e) => onChange(e, "importCommonFiles")}
        sectionName={t("Common:CommonFiles")}
        description={t("Settings:CommonFilesDescription")}
        exportSection={{
          sectionName: t("Common:Common"),
          workspace: serviceName,
          SectionIcon: PortfolioIcon,
        }}
        importSection={{
          sectionName: t("Common:Rooms"),
          workspace: "DocSpace",
          SectionIcon: RoomsIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importProjectFiles}
        onChange={(e) => onChange(e, "importProjectFiles")}
        sectionName={t("Common:Projects")}
        description={t("Settings:ProjectsDescription")}
        exportSection={{
          sectionName: t("Common:Projects"),
          workspace: serviceName,
          SectionIcon: ProjectsIcon,
        }}
        importSection={{
          sectionName: t("Common:Rooms"),
          workspace: "DocSpace",
          SectionIcon: RoomsIcon,
        }}
      />

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStep}
        onCancelClick={onPrevStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
        showReminder
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
