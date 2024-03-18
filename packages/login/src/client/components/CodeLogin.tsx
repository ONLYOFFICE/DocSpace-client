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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { CodeInput } from "@docspace/shared/components/code-input";
import { Trans } from "react-i18next";
import { ReactSVG } from "react-svg";
import { LoginFormWrapper } from "./StyledLogin";
import BarLogo from "PUBLIC_DIR/images/danger.alert.react.svg";
import { Dark, Base } from "@docspace/shared/themes";
import { getBgPattern, frameCallCommand } from "@docspace/shared/utils/common";
import { getLogoFromPath } from "@docspace/shared/utils";
import { useMounted } from "../helpers/useMounted";
import useIsomorphicLayoutEffect from "../hooks/useIsomorphicLayoutEffect";
import LoginContainer from "@docspace/shared/components/color-theme/sub-components/LoginContainer";
import { useThemeDetector } from "@docspace/shared/hooks/useThemeDetector";

interface ILoginProps extends IInitialState {
  isDesktopEditor?: boolean;
  theme: IUserTheme;
  setTheme: (theme: IUserTheme) => void;
}

interface IBarProp {
  t: TFuncType;
  expired: boolean;
}

const Bar: React.FC<IBarProp> = (props) => {
  const { t, expired } = props;
  const type = expired ? "warning" : "error";
  const text = expired ? t("ExpiredCode") : t("InvalidCode");

  return (
    <div className={`code-input-bar ${type}`}>
      <BarLogo />
      {text}
    </div>
  );
};

const Form: React.FC<ILoginProps> = ({ theme, setTheme, logoUrls }) => {
  const { t } = useTranslation("Login");
  const [invalidCode, setInvalidCode] = useState(false);
  const [expiredCode, setExpiredCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const email = "test@onlyoffice.com"; //TODO: get email from form
  const validCode = "123456"; //TODO: get from api
  const systemTheme = typeof window !== "undefined" && useThemeDetector();

  useIsomorphicLayoutEffect(() => {
    const theme =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? Dark
        : Base;
    setTheme(theme);
    frameCallCommand("setIsLoaded");
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (systemTheme === "Base") setTheme(Base);
    else setTheme(Dark);
  }, [systemTheme]);

  const onSubmit = (code: number | string) => {
    if (code !== validCode) {
      setInvalidCode(true);
    } else {
      console.log(`Code ${code}`); //TODO: send code on backend
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 5000); // fake
    }
  };

  const handleChange = () => {
    setInvalidCode(false);
  };

  const logo = logoUrls && Object.values(logoUrls)[1];
  const logoUrl = !logo
    ? undefined
    : !theme?.isBase
    ? getLogoFromPath(logo.path.dark)
    : getLogoFromPath(logo.path.light);

  return (
    <LoginContainer id="code-page" theme={theme}>
      <img src={logoUrl} className="logo-wrapper" />
      <Text
        id="workspace-title"
        fontSize="23px"
        fontWeight={700}
        textAlign="center"
        className="workspace-title"
      >
        {t("CodeTitle")}
      </Text>

      <Text
        className="code-description"
        fontSize="12px"
        fontWeight={400}
        textAlign="center"
      >
        <Trans t={t} i18nKey="CodeSubtitle" ns="Login" key={email}>
          We sent a 6-digit code to {{ email }}. The code has a limited validity
          period, enter it as soon as possible.{" "}
        </Trans>
      </Text>

      <div className="code-input-container">
        <CodeInput
          theme={theme}
          onSubmit={onSubmit}
          onChange={handleChange}
          isDisabled={isLoading}
        />
        {(expiredCode || invalidCode) && <Bar t={t} expired={expiredCode} />}

        {expiredCode && (
          <Link
            isHovered
            type="action"
            fontSize="13px"
            fontWeight="600"
            color="#3B72A7"
          >
            {t("ResendCode")}
          </Link>
        )}

        <Text
          className="not-found-code code-description"
          fontSize="12px"
          textAlign="center"
        >
          {t("NotFoundCode")}
        </Text>
      </div>
    </LoginContainer>
  );
};

const CodeLogin: React.FC<ICodeProps> = (props) => {
  const bgPattern = getBgPattern(props.currentColorScheme.id);
  const mounted = useMounted();

  if (!mounted) return <></>;
  return (
    <LoginFormWrapper bgPattern={bgPattern}>
      <Form {...props} />
    </LoginFormWrapper>
  );
};

export default inject(({ loginStore }) => {
  return {
    theme: loginStore.theme,
    setTheme: loginStore.setTheme,
  };
})(observer(CodeLogin));
