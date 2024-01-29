import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthenticatedAction, ValidationResult } from "../helpers/enums";
import { Loader } from "@docspace/shared/components/loader";
import Section from "@docspace/shared/components/section";
import { checkConfirmLink } from "@docspace/shared/api/user"; //TODO: Move AuthStore
import { getObjectByLocation } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import SectionWrapper from "SRC_DIR/components/Section";
import { inject, observer } from "mobx-react";

const ConfirmRoute = ({
  doAuthenticated,
  isAuthenticated,
  storeIsLoaded,
  logout,
  defaultPage,
  children,
}) => {
  const [state, setState] = React.useState({
    linkData: {},
    isLoaded: false,
    roomData: {},
  });

  const location = useLocation();

  const getData = React.useCallback(() => {
    const queryParams = getObjectByLocation(location);
    const url = location.pathname;
    const posSeparator = url.lastIndexOf("/");

    const type = !!posSeparator ? url?.slice(posSeparator + 1) : "";
    const confirmLinkData = Object.assign({ type }, queryParams);

    return { type, confirmLinkData };
  }, [location.pathname]);

  const { type, confirmLinkData } = getData();

  if (!type && confirmLinkData.type)
    return (
      <Navigate to={`/confirm/${confirmLinkData.type}${location.search}`} />
    );

  React.useEffect(() => {
    if (!storeIsLoaded) return;

    if (isAuthenticated && doAuthenticated != AuthenticatedAction.None) {
      if (doAuthenticated == AuthenticatedAction.Redirect)
        return window.location.replace(defaultPage);

      if (doAuthenticated == AuthenticatedAction.Logout) logout();
    }

    const { search } = location;

    const { confirmLinkData } = getData();

    let path = "";
    if (!isAuthenticated) {
      path = "/login";
    }

    checkConfirmLink(confirmLinkData)
      .then((res) => {
        const validationResult = res.result;

        switch (validationResult) {
          case ValidationResult.Ok:
            const confirmHeader = search.slice(1);
            const linkData = {
              ...confirmLinkData,
              confirmHeader,
            };

            const roomData = {
              roomId: res?.roomId,
              title: res?.title,
            };

            console.log("checkConfirmLink", {
              confirmLinkData,
              validationResult,
              linkData,
            });

            setState((val) => ({ ...val, isLoaded: true, linkData, roomData }));
            break;
          case ValidationResult.Invalid:
            console.error("invlid link", { confirmLinkData, validationResult });
            window.location.href = combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              path,
              "/error"
            );
            break;
          case ValidationResult.Expired:
            console.error("expired link", {
              confirmLinkData,
              validationResult,
            });
            window.location.href = combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              path,
              "/error"
            );
            break;
          case ValidationResult.TariffLimit:
            console.error("tariff limit", {
              confirmLinkData,
              validationResult,
            });
            window.location.href = combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              path,
              "/error?messageKey=20"
            );
            break;
          default:
            console.error("unknown link", {
              confirmLinkData,
              validationResult,
            });
            window.location.href = combineUrl(
              window.DocSpaceConfig?.proxy?.url,
              path,
              "/error"
            );
            break;
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          window.DocSpace.navigate("/access-restricted", {
            state: { isRestrictionError: true },
            replace: true,
          });

          return;
        }

        console.error("FAILED checkConfirmLink", { error, confirmLinkData });
        window.location.href = combineUrl(
          window.DocSpaceConfig?.proxy?.url,
          path,
          "/error"
        );
      });
  }, [getData, doAuthenticated, isAuthenticated, storeIsLoaded, logout]);

  // console.log(`ConfirmRoute render`, this.props, this.state);

  return !state.isLoaded ? (
    <SectionWrapper>
      <Section.SectionBody>
        <Loader className="pageLoader" type="rombs" size="40px" />
      </Section.SectionBody>
    </SectionWrapper>
  ) : (
    React.cloneElement(children, {
      linkData: state.linkData,
      roomData: state.roomData,
    })
  );
};

ConfirmRoute.defaultProps = {
  doAuthenticated: AuthenticatedAction.None,
};

export default inject(({ authStore, settingsStore }) => {
  const { isAuthenticated, logout, isLoaded } = authStore;
  const { defaultPage } = settingsStore;
  return {
    isAuthenticated,
    logout,
    storeIsLoaded: isLoaded,
    defaultPage,
  };
})(observer(ConfirmRoute));
