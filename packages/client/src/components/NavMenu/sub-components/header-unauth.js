import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Box } from "@docspace/shared/components/box";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";
import { getCookie, mobile } from "@docspace/shared/utils";
import { ComboBox } from "@docspace/shared/components/combobox";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";
import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "@docspace/shared/constants";
import { convertLanguage } from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";

const Header = styled.header`
  align-items: left;
  background-color: ${(props) => props.theme.header.backgroundColor};
  display: flex;
  width: 100vw;
  height: 48px;
  justify-content: center;

  .header-items-wrapper {
    width: 960px;

    @media ${mobile} {
      width: 475px;
      display: flex;
      align-items: center;
      justify-content: center;
      //padding: 0 16px;
    }
  }

  .header-logo-wrapper {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .header-logo-min_icon {
    display: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .header-logo-icon {
    width: 100%;
    height: 100%;
    padding: 12px 0;
    cursor: pointer;
  }

  .language-combo-box {
    //margin: auto;
    // margin-right: 8px;
    position: absolute;
    right: 8px;
    top: 6px;
  }
`;

Header.defaultProps = { theme: Base };

const HeaderUnAuth = ({
  enableAdmMess,
  wizardToken,
  isAuthenticated,
  isLoaded,
  logoUrl,
  theme,
  cultureNames,
}) => {
  const { t } = useTranslation("NavMenu");

  const logo = !theme.isBase ? logoUrl?.path?.dark : logoUrl?.path?.light;

  const cultureName = getCookie(LANGUAGE);
  const language = convertLanguage(cultureName);
  const selectedLanguage = cultureNames.find((item) => item.key === language);

  console.log("cultureNames", cultureNames, language);
  const onLanguageSelect = (e) => {
    setCookie(LANGUAGE, e.key, {
      "max-age": COOKIE_EXPIRATION_YEAR,
    });

    location.reload();
  };
  return (
    <Header isLoaded={isLoaded} className="navMenuHeaderUnAuth">
      <Box
        displayProp="flex"
        justifyContent="space-between"
        alignItems="center"
        className="header-items-wrapper"
      >
        {!isAuthenticated && isLoaded ? (
          <div>
            <a className="header-logo-wrapper" href="/">
              <img className="header-logo-icon" src={logo} />
            </a>
          </div>
        ) : (
          <></>
        )}
      </Box>

      <ComboBox
        className="language-combo-box"
        directionY={"both"}
        options={cultureNames}
        selectedOption={selectedLanguage}
        onSelect={onLanguageSelect}
        isDisabled={false}
        scaled={false}
        scaledOptions={false}
        size="content"
        showDisabledItems={true}
        dropDownMaxHeight={200}
        manualWidth="70px"
        fillIcon={false}
        modernView
        displaySelectedOption
      />
    </Header>
  );
};

HeaderUnAuth.displayName = "Header";

HeaderUnAuth.propTypes = {
  enableAdmMess: PropTypes.bool,
  wizardToken: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isLoaded: PropTypes.bool,
};

export default inject(({ authStore, settingsStore }) => {
  const { isAuthenticated, isLoaded } = authStore;
  const { enableAdmMess, wizardToken, logoUrl, theme } = settingsStore;

  return {
    enableAdmMess,
    wizardToken,
    isAuthenticated,
    isLoaded,
    logoUrl,
    theme,
  };
})(withCultureNames(observer(HeaderUnAuth)));
