import { inject, observer } from "mobx-react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import AccountsIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import UserIcon from "PUBLIC_DIR/images/catalog.user.react.svg";
import UserSolidIcon from "PUBLIC_DIR/images/catalog.user.solid.react.svg";
import SharedIcon from "PUBLIC_DIR/images/catalog.share.small.react.svg";
import RoomsIcon from "PUBLIC_DIR/images/catalog.rooms.react.svg";
import PortfolioIcon from "PUBLIC_DIR/images/catalog.portfolio.react.svg";
import ProjectsIcon from "PUBLIC_DIR/images/catalog.projects.react.svg";

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
        isChecked={importOptions.importPersonalFiles}
        onChange={(e) => onChange(e, "importPersonalFiles")}
        sectionName={t("Settings:PersonalFiles")}
        description={t("Settings:PersonalFilesDescription", { serviceName })}
        exportSection={{
          sectionName: t("Settings:MyDocuments"),
          workspace: serviceName,
          SectionIcon: UserSolidIcon,
        }}
        importSection={{
          sectionName: t("Settings:MyDocuments"),
          workspace: "DocSpace",
          SectionIcon: UserIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importSharedFiles}
        onChange={(e) => onChange(e, "importSharedFiles")}
        sectionName={t("Settings:SharedFiles")}
        description={t("Settings:SharedFilesDescription", { serviceName })}
        exportSection={{
          sectionName: t("Common:SharedWithMe"),
          workspace: serviceName,
          SectionIcon: SharedIcon,
        }}
        importSection={{
          sectionName: t("Settings:MyDocuments"),
          workspace: "DocSpace",
          SectionIcon: UserIcon,
        }}
      />
      <ImportSection
        isChecked={importOptions.importCommonFiles}
        onChange={(e) => onChange(e, "importCommonFiles")}
        sectionName="Common Files"
        description={t("Settings:SharedFilesDescription", { serviceName })}
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
        isChecked={importOptions.importProjects}
        onChange={(e) => onChange(e, "importProjects")}
        sectionName="Projects"
        description={t("Settings:SharedFilesDescription", { serviceName })}
        exportSection={{
          sectionName: "Projects",
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
