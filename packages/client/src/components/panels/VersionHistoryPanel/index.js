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
import PropTypes from "prop-types";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";

import { FloatingButton } from "@docspace/shared/components/floating-button";
import { Portal } from "@docspace/shared/components/portal";
import { DeviceType } from "@docspace/shared/enums";
import { withTranslation } from "react-i18next";
import {
  StyledVersionHistoryPanel,
  StyledContent,
  StyledBody,
} from "../StyledPanels";
import { SectionBodyContent } from "../../../pages/VersionHistory/Section/";
import { inject, observer } from "mobx-react";
import config from "PACKAGE_FILE";

class PureVersionHistoryPanel extends React.Component {
  onClose = () => {
    const { setIsVerHistoryPanel, setInfoPanelIsMobileHidden } = this.props;
    setIsVerHistoryPanel(false);
    setInfoPanelIsMobileHidden(false);
  };

  componentDidMount() {
    document.addEventListener("keyup", this.onKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }

  onKeyPress = (e) => (e.key === "Esc" || e.key === "Escape") && this.onClose();

  render() {
    //console.log("render versionHistoryPanel");
    const { visible, isLoading, versions, showProgressBar, currentDeviceType } =
      this.props;
    const zIndex = 310;

    const element = (
      <StyledVersionHistoryPanel
        className="version-history-modal-dialog"
        visible={visible}
        isLoading={true}
      >
        <Backdrop
          onClick={this.onClose}
          visible={visible}
          zIndex={zIndex}
          isAside={true}
        />
        <Aside
          className="version-history-aside-panel"
          visible={visible}
          onClose={this.onClose}
          withoutBodyScroll
          isLoading={!versions && !isLoading}
          header={versions ? versions[0].title : ""}
        >
          <StyledContent>
            <StyledBody className="version-history-panel-body">
              <SectionBodyContent onClose={this.onClose} />
            </StyledBody>
            {showProgressBar && (
              <FloatingButton
                className="layout-progress-bar"
                icon="file"
                alert={false}
              />
            )}
          </StyledContent>
        </Aside>
      </StyledVersionHistoryPanel>
    );

    return currentDeviceType === DeviceType.mobile ? (
      <Portal element={element} />
    ) : (
      element
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
    const { isTabletView, currentDeviceType } = settingsStore;
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
      currentDeviceType,
    };
  },
)(observer(VersionHistoryPanel));
