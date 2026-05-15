/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import PropTypes from "prop-types";
import { FloatingButton } from "@docspace/ui-kit/components/floating-button";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import config from "PACKAGE_FILE";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
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
        dataTestId="version_history_panel"
      >
        <ModalDialog.Header>
          {versions ? versions[0].title : ""}
        </ModalDialog.Header>
        <ModalDialog.Body data-testid="version_history_panel_body">
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
