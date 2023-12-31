import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { ValidationResult } from "./../helpers/constants";
import Loader from "@docspace/components/loader";
import Section from "@docspace/common/components/Section";
import { checkConfirmLink } from "@docspace/common/api/user"; //TODO: Move AuthStore
import { combineUrl, getObjectByLocation } from "@docspace/common/utils";
import { inject, observer } from "mobx-react";

const ConfirmRoute = (props) => {
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
    const { forUnauthorized, isAuthenticated } = props;

    if (forUnauthorized && isAuthenticated) {
      props.logout();
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
        console.error("FAILED checkConfirmLink", { error, confirmLinkData });
        window.location.href = combineUrl(
          window.DocSpaceConfig?.proxy?.url,
          path,
          "/error"
        );
      });
  }, [getData]);

  // console.log(`ConfirmRoute render`, this.props, this.state);

  return !state.isLoaded ? (
    <Section>
      <Section.SectionBody>
        <Loader className="pageLoader" type="rombs" size="40px" />
      </Section.SectionBody>
    </Section>
  ) : (
    React.cloneElement(props.children, {
      linkData: state.linkData,
      roomData: state.roomData,
    })
  );
};

export default inject(({ auth }) => {
  const { isAuthenticated, logout } = auth;
  return {
    isAuthenticated,
    logout,
  };
})(observer(ConfirmRoute));
