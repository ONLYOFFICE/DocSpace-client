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
              `/login?confirmedEmail=${email}`
            )
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
              `/login/error?message=${errorMessage}`
            )
          );
        })
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

export default inject(({ auth, userStore }) => {
  const { logout } = auth;
  return {
    logout,
    updateEmailActivationStatus: userStore.updateEmailActivationStatus,
  };
})(observer(ActivateEmailForm));
