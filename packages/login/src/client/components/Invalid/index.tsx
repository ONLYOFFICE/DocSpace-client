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
import { inject, observer } from "mobx-react";
import { useNavigate, Link } from "react-router-dom";
import { Text } from "@docspace/shared/components/text";
import { useTranslation, Trans } from "react-i18next";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Dark, Base } from "@docspace/shared/themes";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect";
import { getMessageFromKey, getMessageKeyTranslate } from "../../helpers/utils";

const homepage = "/login";

interface InvalidErrorProps {
  theme?: Record<string, string>;
  setTheme?: (theme: object) => void;
  match?: {
    params: MatchType;
  };
}

const InvalidError = ({ theme, setTheme, match }: InvalidErrorProps) => {
  console.log(match);
  const [hydrated, setHydrated] = React.useState(false);

  const [proxyHomepageUrl, setProxyHomepageUrl] = React.useState("");
  const { t } = useTranslation(["Login", "Errors", "Common"]);
  const navigate = useNavigate();

  useIsomorphicLayoutEffect(() => {
    const themeCurrent =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? Dark
        : Base;
    setTheme?.(themeCurrent);
  }, []);

  React.useEffect(() => {
    const url = combineUrl(window.DocSpaceConfig?.proxy?.url, homepage);
    setProxyHomepageUrl(url);
    const timeout = setTimeout(() => {
      navigate(url);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const message = getMessageFromKey(match?.messageKey);
  const errorTitle = match?.messageKey
    ? getMessageKeyTranslate(t, message)
    : t("Common:ExpiredLink");

  return (
    <>
      {hydrated && (
        <ErrorContainer headerText={errorTitle} theme={theme}>
          <Text theme={theme} fontSize="13px" fontWeight="600">
            <Trans t={t} i18nKey="ErrorInvalidText">
              In 10 seconds you will be redirected to the
              <Link className="error_description_link" to={proxyHomepageUrl}>
                DocSpace
              </Link>
            </Trans>
          </Text>
        </ErrorContainer>
      )}
    </>
  );
};

export default inject(({ loginStore }: any) => {
  return {
    theme: loginStore.theme,
    setTheme: loginStore.setTheme,
  };
})(observer(InvalidError));
