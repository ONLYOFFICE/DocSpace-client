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
import { Loader } from "@docspace/shared/components/loader";
import Section from "@docspace/shared/components/section";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import tryRedirectTo from "@docspace/shared/utils/tryRedirectTo";
import { inject, observer } from "mobx-react";
import { EmployeeActivationStatus } from "@docspace/shared/enums";
import SectionWrapper from "SRC_DIR/components/Section";
class ActivateEmail extends React.PureComponent {
  componentDidMount() {
    const { logout, updateEmailActivationStatus, linkData } = this.props;
    const [email, uid, key] = [
      linkData.email,
      linkData.uid,
      linkData.confirmHeader,
    ];
    logout().then(() =>
      updateEmailActivationStatus(EmployeeActivationStatus.Activated, uid, key)
        .then((res) => {
          tryRedirectTo(
            combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              `/login?confirmedEmail=${email}`,
            ),
          );
        })
        .catch((error) => {
          // console.log('activate email error', e);
          let errorMessage = "";
          if (typeof error === "object") {
            errorMessage =
              error?.response?.data?.error?.message ||
              error?.statusText ||
              error?.message ||
              "";
          } else {
            errorMessage = error;
          }

          tryRedirectTo(
            combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              `/login/error?message=${errorMessage}`,
            ),
          );
        }),
    );
  }

  render() {
    // console.log('Activate email render');
    return <Loader className="pageLoader" type="rombs" size="40px" />;
  }
}

ActivateEmail.propTypes = {
  location: PropTypes.object.isRequired,
};
const ActivateEmailForm = (props) => (
  <SectionWrapper>
    <Section.SectionBody>
      <ActivateEmail {...props} />
    </Section.SectionBody>
  </SectionWrapper>
);

export default inject(({ authStore, userStore }) => {
  const { logout } = authStore;
  return {
    logout,
    updateEmailActivationStatus: userStore.updateEmailActivationStatus,
  };
})(observer(ActivateEmailForm));
