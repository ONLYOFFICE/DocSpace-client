// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { inject, observer } from "mobx-react";
import styled from "styled-components";

import ImportSection from "../../../sub-components/ImportSection";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import PeopleIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import AccountsIcon from "PUBLIC_DIR/images/catalog.accounts.react.svg";
import DocumentsIcon from "PUBLIC_DIR/images/catalog.documents.react.svg";
import RoomsIcon from "PUBLIC_DIR/images/catalog.rooms.react.svg";

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
          workspace: t("Common:ProductName"),
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
          workspace: t("Common:ProductName"),
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
          sectionName: t("Common:Documents"),
          workspace: t("Common:ProductName"),
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
          sectionName: t("Common:Documents"),
          workspace: t("Common:ProductName"),
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
          workspace: t("Common:ProductName"),
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
