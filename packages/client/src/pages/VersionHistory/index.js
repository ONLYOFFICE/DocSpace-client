import React from "react";

import Section from "@docspace/shared/components/section";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import { withTranslation } from "react-i18next";

import { SectionHeaderContent, SectionBodyContent } from "./Section";
//import { setDocumentTitle } from "@docspace/client/src/helpers/filesUtils";
import { inject, observer } from "mobx-react";
import SectionWrapper from "SRC_DIR/components/Section";
class PureVersionHistory extends React.Component {
  render() {
    const { isLoading, versions, showProgressBar } = this.props;

    return (
      <SectionWrapper
        withBodyAutoFocus={true}
        headerBorderBottom={true}
        showSecondaryProgressBar={showProgressBar}
        secondaryProgressBarIcon="file"
        showSecondaryButtonAlert={false}
        withBodyScroll={false}
      >
        <Section.SectionHeader>
          {versions && !isLoading ? (
            <SectionHeaderContent
              title={versions[0].title}
              onClickBack={this.redirectToHomepage}
            />
          ) : (
            <SectionHeaderSkeleton />
          )}
        </Section.SectionHeader>

        <Section.SectionBody>
          <SectionBodyContent />
        </Section.SectionBody>
      </SectionWrapper>
    );
  }
}

const VersionHistory = withTranslation("VersionHistory")(PureVersionHistory);

VersionHistory.propTypes = {};

export default inject(
  ({ settingsStore, filesStore, clientLoadingStore, versionHistoryStore }) => {
    const { filter } = filesStore;
    const { isLoading } = clientLoadingStore;
    const { setIsVerHistoryPanel, versions, showProgressBar } =
      versionHistoryStore;

    return {
      isTabletView: settingsStore.isTabletView,
      isLoading,
      filter,
      versions,
      showProgressBar,

      setIsVerHistoryPanel,
    };
  },
)(observer(VersionHistory));
