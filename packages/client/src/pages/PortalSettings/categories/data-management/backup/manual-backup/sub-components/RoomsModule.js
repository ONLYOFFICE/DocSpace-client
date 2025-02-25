// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";
import { withTranslation } from "react-i18next";
import { Button } from "@docspace/shared/components/button";
import { BackupStorageType } from "@docspace/shared/enums";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { getFromLocalStorage } from "../../../../../utils";

let folder = "";
const Documents = "Documents";

class RoomsModule extends React.Component {
  constructor(props) {
    super(props);

    folder = getFromLocalStorage("LocalCopyFolder");
    const moduleType = getFromLocalStorage("LocalCopyStorageType");

    const selectedFolder = moduleType === Documents ? folder : "";

    this.state = {
      isStartCopy: false,
      selectedFolder,
    };

    this.isMount = false;
  }

  componentDidMount() {
    this.isMount = true;
  }

  componentWillUnmount() {
    this.isMount = false;
  }

  onSelectFolder = (folderId) => {
    this.isMount &&
      this.setState({
        selectedFolder: folderId,
      });
  };

  onMakeCopy = async () => {
    const { onMakeCopy } = this.props;
    const { selectedFolder } = this.state;
    const { DocumentModuleType } = BackupStorageType;

    this.setState({
      isStartCopy: true,
    });

    await onMakeCopy(selectedFolder, Documents, `${DocumentModuleType}`);

    this.setState({
      isStartCopy: false,
    });
  };

  render() {
    const { isMaxProgress, t, buttonSize } = this.props;
    const { isStartCopy, selectedFolder } = this.state;

    const isModuleDisabled = !isMaxProgress || isStartCopy;
    return (
      <>
        <div className="manual-backup_folder-input">
          <FilesSelectorInput
            onSelectFolder={this.onSelectFolder}
            {...(selectedFolder ? { id: selectedFolder } : { openRoot: true })}
            withoutInitPath={!selectedFolder}
            isDisabled={isModuleDisabled}
            isRoomBackup
            isSelectFolder
            withCreate
          />
        </div>
        <div className="manual-backup_buttons">
          <Button
            id="create-copy"
            label={t("Common:CreateCopy")}
            onClick={this.onMakeCopy}
            primary
            isDisabled={isModuleDisabled || !selectedFolder}
            size={buttonSize}
          />
        </div>
      </>
    );
  }
}
export default withTranslation(["Settings", "Common"])(RoomsModule);
