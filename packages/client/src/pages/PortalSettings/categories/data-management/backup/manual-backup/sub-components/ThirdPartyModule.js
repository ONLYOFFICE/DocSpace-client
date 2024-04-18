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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Button } from "@docspace/shared/components/button";
import { getFromLocalStorage } from "../../../../../utils";
import { BackupStorageType } from "@docspace/shared/enums";
import DirectThirdPartyConnection from "../../common-container/DirectThirdPartyConnection";

let folder = "";
const ThirdPartyResource = "ThirdPartyResource";

class ThirdPartyModule extends React.Component {
  constructor(props) {
    super(props);

    folder = getFromLocalStorage("LocalCopyFolder");
    const moduleType = getFromLocalStorage("LocalCopyStorageType");

    const selectedFolder = moduleType === ThirdPartyResource ? folder : "";

    this.state = {
      isStartCopy: false,
      selectedFolder: selectedFolder,
      isError: false,
      isLoading: false,
    };

    this._isMount = false;
  }

  componentDidMount() {
    this._isMount = true;
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  onSelectFolder = (folderId) => {
    this._isMount &&
      this.setState({
        selectedFolder: folderId,
      });
  };

  isInvalidForm = () => {
    const { selectedFolder } = this.state;

    if (selectedFolder) return false;

    this.setState({
      isError: true,
    });

    return true;
  };

  onMakeCopy = async () => {
    const { onMakeCopy } = this.props;
    const { selectedFolder, isError } = this.state;
    const { ResourcesModuleType } = BackupStorageType;
    if (this.isInvalidForm()) return;

    isError &&
      this.setState({
        isError: false,
      });

    this.setState({
      isStartCopy: true,
    });

    await onMakeCopy(
      selectedFolder,
      ThirdPartyResource,
      `${ResourcesModuleType}`,
    );

    this.setState({
      isStartCopy: false,
    });
  };

  render() {
    const {
      isMaxProgress,
      t,
      buttonSize,
      connectedThirdPartyAccount,
      isTheSameThirdPartyAccount,
    } = this.props;
    const { isError, isStartCopy, selectedFolder } = this.state;

    const isModuleDisabled = !isMaxProgress || isStartCopy;

    return (
      <div className="manual-backup_third-party-module">
        <DirectThirdPartyConnection
          t={t}
          onSelectFolder={this.onSelectFolder}
          isDisabled={isModuleDisabled}
          {...(selectedFolder && { id: selectedFolder })}
          withoutInitPath={!selectedFolder}
          isError={isError}
          buttonSize={buttonSize}
          isSelectFolder
        />

        {connectedThirdPartyAccount?.id && isTheSameThirdPartyAccount && (
          <Button
            label={t("Common:CreateCopy")}
            onClick={this.onMakeCopy}
            primary
            isDisabled={isModuleDisabled || selectedFolder === ""}
            size={buttonSize}
          />
        )}
      </div>
    );
  }
}
export default inject(({ backup }) => {
  const { connectedThirdPartyAccount, isTheSameThirdPartyAccount } = backup;

  return {
    connectedThirdPartyAccount,
    isTheSameThirdPartyAccount,
  };
})(withTranslation(["Settings", "Common"])(observer(ThirdPartyModule)));
