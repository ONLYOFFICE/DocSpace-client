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

import Section from "@docspace/shared/components/section";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import { withTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";
import SectionWrapper from "SRC_DIR/components/Section";
import { SectionHeaderContent, SectionBodyContent } from "./Section";

class PureVersionHistory extends React.Component {
  render() {
    const { isLoading, versions } = this.props;

    return (
      <SectionWrapper
        withBodyAutoFocus
        headerBorderBottom
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
    const { setIsVerHistoryPanel, versions } = versionHistoryStore;

    return {
      isTabletView: settingsStore.isTabletView,
      isLoading,
      filter,
      versions,

      setIsVerHistoryPanel,
    };
  },
)(observer(VersionHistory));
