// (c) Copyright Ascensio System SIA 2010-2024
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
import { useLocation, Navigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Loader } from "@docspace/shared/components/loader";
import Section from "@docspace/shared/components/section";
import { checkConfirmLink } from "@docspace/shared/api/user"; //TODO: Move AuthStore
import { getObjectByLocation } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import SectionWrapper from "SRC_DIR/components/Section";
import { AuthenticatedAction, ValidationResult } from "SRC_DIR/helpers/enums";

const ConfirmRoute = ({
  doAuthenticated,
  isAuthenticated,
  storeIsLoaded,
  logout,
  defaultPage,
  children,
  culture,
}) => {
  const { i18n } = useTranslation(["Confirm", "Common", "Wizard"]);

  const [state, setState] = React.useState({
    linkData: {},
    isLoaded: false,
    roomData: {},
  });

  React.useEffect(() => {
    storeIsLoaded && i18n.changeLanguage(culture);
  }, [storeIsLoaded]);

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
              "/error",
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
              "/error",
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
              "/error?messageKey=20",
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
              "/error",
            );
            break;
        }
      })
      .catch((error) => {
        if (error?.response?.status === 403) {
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
          "/error",
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
  const { defaultPage, culture } = settingsStore;
  return {
    isAuthenticated,
    logout,
    storeIsLoaded: isLoaded,
    defaultPage,
    culture,
  };
})(observer(ConfirmRoute));
