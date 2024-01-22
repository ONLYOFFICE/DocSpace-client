import React from "react";
import PropTypes from "prop-types";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Heading } from "@docspace/shared/components/heading";
import { Aside } from "@docspace/shared/components/aside";

import { FloatingButton } from "@docspace/shared/components/floating-button";
import { Portal } from "@docspace/shared/components/portal";
import { DeviceType } from "@docspace/shared/enums";
import { withTranslation } from "react-i18next";
import {
  StyledVersionHistoryPanel,
  StyledContent,
  StyledHeaderContent,
  StyledBody,
} from "../StyledPanels";
import { SectionBodyContent } from "../../../pages/VersionHistory/Section/";
import { inject, observer } from "mobx-react";
import config from "PACKAGE_FILE";
import { ArticleHeaderLoader } from "@docspace/shared/skeletons/article";

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
        >
          <StyledContent>
            <StyledHeaderContent className="version-history-panel-header">
              {versions && !isLoading ? (
                <Heading
                  className="version-history-panel-heading"
                  size="medium"
                  truncate
                >
                  {versions[0].title}
                </Heading>
              ) : (
                <ArticleHeaderLoader
                  className="loader-version-history"
                  height="28"
                  width="688"
                />
              )}
            </StyledHeaderContent>

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
  PureVersionHistoryPanel
);

VersionHistoryPanel.propTypes = {
  fileId: PropTypes.string,
};

export default inject(
  ({ auth, clientLoadingStore, versionHistoryStore, infoPanelStore }) => {
    const { isTabletView, currentDeviceType } = auth.settingsStore;
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
  }
)(observer(VersionHistoryPanel));
