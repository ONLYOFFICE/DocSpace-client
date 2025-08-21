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
import PropTypes from "prop-types";
import { FloatingButton } from "@docspace/shared/components/floating-button";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import config from "PACKAGE_FILE";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { SectionBodyContent } from "../../../pages/VersionHistory/Section";

class PureVersionHistoryPanel extends React.Component {
  componentDidMount() {
    document.addEventListener("keyup", this.onKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }

  onClose = () => {
    const { setIsVerHistoryPanel, setInfoPanelIsMobileHidden } = this.props;
    setIsVerHistoryPanel(false);
    setInfoPanelIsMobileHidden(false);
  };

  onKeyPress = (e) => (e.key === "Esc" || e.key === "Escape") && this.onClose();

  render() {
    const { visible, isLoading, versions, showProgressBar } = this.props;

    return (
      <ModalDialog
        isLoading={!versions ? !isLoading : null}
        visible={visible}
        onClose={this.onClose}
        displayType={ModalDialogType.aside}
      >
        <ModalDialog.Header>
          {versions ? versions[0].title : ""}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <SectionBodyContent onClose={this.onClose} />

          {showProgressBar ? (
            <FloatingButton className="layout-progress-bar" alert={false} />
          ) : null}
        </ModalDialog.Body>
      </ModalDialog>
    );
  }
}

const VersionHistoryPanel = withTranslation("VersionHistory")(
  PureVersionHistoryPanel,
);

VersionHistoryPanel.propTypes = {
  fileId: PropTypes.string,
};

export default inject(
  ({
    settingsStore,
    clientLoadingStore,
    versionHistoryStore,
    infoPanelStore,
  }) => {
    const { isTabletView } = settingsStore;
    const { isLoading } = clientLoadingStore;
    const { setIsMobileHidden: setInfoPanelIsMobileHidden } = infoPanelStore;
    const {
      fileId,
      versions,
      setIsVerHistoryPanel,
      isVisible: visible,
      showProgressBar,
    } = versionHistoryStore;

    return {
      isTabletView,
      homepage: config.homepage,
      isLoading,
      fileId,
      versions,
      visible,
      showProgressBar,

      setIsVerHistoryPanel,
      setInfoPanelIsMobileHidden,
    };
  },
)(observer(VersionHistoryPanel));
