﻿import DarkGeneralPngUrl from "PUBLIC_DIR/images/dark_general.png";
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { Button } from "@docspace/shared/components/button";
import { Loader } from "@docspace/shared/components/loader";
import Section from "@docspace/shared/components/section";
import SectionWrapper from "SRC_DIR/components/Section";
import { mobile, tablet } from "@docspace/shared/utils";
import { I18nextProvider, Trans, withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { isMobile } from "react-device-detect";
//import { setDocumentTitle } from "@docspace/client/src/helpers/filesUtils";
import i18n from "./i18n";
import { toastr } from "@docspace/shared/components/toast";
import { checkProtocol } from "../../helpers/files-helpers";
import Base from "@docspace/shared/themes/base";

const StyledPrivacyPage = styled.div`
  margin-top: ${isMobile ? "80px" : "36px"};

  .privacy-rooms-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 770px;
    margin: auto;
    margin-top: 80px;
  }

  .privacy-rooms-text-header {
    margin-bottom: 46px;
  }

  .privacy-rooms-text-dialog {
    margin-top: 32px;
    margin-bottom: 42px;
  }

  .privacy-rooms-text-separator {
    width: 70%;
    margin: 28px 0 42px 0;
    border-bottom: ${(props) => props.theme.filesPrivateRoom.borderBottom};
  }

  .privacy-rooms-install-text {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `text-align: right;`
        : `text-align: left;`}

    @media ${mobile} {
      text-align: center;
    }
  }

  .privacy-rooms-install {
    display: flex;
    flex-direction: row;

    @media ${mobile} {
      flex-direction: column;
    }
  }

  .privacy-rooms-link {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 4px;`
        : `margin-left: 4px;`}
    color: ${(props) => props.theme.filesPrivateRoom.linkColor};
  }

  .privacy-rooms-text-description {
    margin-top: 28px;
    color: ${(props) => props.theme.filesPrivateRoom.textColor};
    p {
      margin: 0;
    }
  }

  .privacy-rooms-avatar {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? css`
            text-align: right;
            padding-right: 66px;
          `
        : css`
            text-align: left;
            padding-left: 66px;
          `}

    @media ${tablet} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `padding-right: 74px;`
          : `padding-left: 74px;`}
    }

    @media ${mobile} {
      padding: 0px;
      text-align: center;
    }

    margin: 0px;
  }

  .privacy-rooms-logo {
    text-align: center;
    max-width: 216px;
    max-height: 35px;
  }
`;

StyledPrivacyPage.defaultProps = { theme: Base };

const PrivacyPageComponent = ({ t, tReady }) => {
  //   useEffect(() => {
  //     setDocumentTitle(t("Common:About"));
  //   }, [t]);

  const [isDisabled, setIsDisabled] = useState(false);

  const location = useLocation();

  const onOpenEditorsPopup = async () => {
    setIsDisabled(true);
    checkProtocol(location.search.split("=")[1])
      .then(() => setIsDisabled(false))
      .catch(() => {
        setIsDisabled(false);
        toastr.info(t("PrivacyEditors"));
      });
  };

  return !tReady ? (
    <Loader className="pageLoader" type="rombs" size="40px" />
  ) : (
    <StyledPrivacyPage>
      <div className="privacy-rooms-avatar">
        <Link href="/">
          <img
            className="privacy-rooms-logo"
            src={DarkGeneralPngUrl}
            width="320"
            height="181"
            alt="Logo"
          />
        </Link>
      </div>

      <div className="privacy-rooms-body">
        <Text
          textAlign="center"
          className="privacy-rooms-text-header"
          fontSize="38px"
        >
          {t("PrivacyHeader")}
        </Text>

        <Text as="div" textAlign="center" fontSize="20px" fontWeight={300}>
          <Trans t={t} i18nKey="PrivacyClick" ns="PrivacyPage">
            Click Open <strong>ONLYOFFICE Desktop</strong> in the browser dialog
            to work with the encrypted documents
          </Trans>
          .
        </Text>

        <Text
          textAlign="center"
          className="privacy-rooms-text-dialog"
          fontSize="20px"
          fontWeight={300}
        >
          {t("PrivacyDialog")}.
        </Text>
        <Button
          onClick={onOpenEditorsPopup}
          size="medium"
          primary
          isDisabled={isDisabled}
          label={t("PrivacyButton")}
        />

        <label className="privacy-rooms-text-separator" />

        <div className="privacy-rooms-install">
          <Text
            className="privacy-rooms-install-text"
            fontSize="16px"
            fontWeight={300}
          >
            {t("PrivacyEditors")}?
          </Text>
          <Link
            className="privacy-rooms-link privacy-rooms-install-text"
            fontSize="16px"
            isHovered
            href="https://www.onlyoffice.com/desktop.aspx"
          >
            {t("PrivacyInstall")}
          </Link>
        </div>

        <Text
          as="div"
          fontSize="12px"
          textAlign="center"
          className="privacy-rooms-text-description"
        >
          <p>{t("PrivacyDescriptionEditors")}.</p>
          <p>{t("PrivacyDescriptionConnect")}.</p>
        </Text>
      </div>
    </StyledPrivacyPage>
  );
};

const PrivacyPageWrapper = withTranslation(["PrivacyPage"])(
  PrivacyPageComponent
);

const PrivacyPage = (props) => {
  return (
    <I18nextProvider i18n={i18n}>
      <SectionWrapper>
        <Section.SectionBody>
          <PrivacyPageWrapper {...props} />
        </Section.SectionBody>
      </SectionWrapper>
    </I18nextProvider>
  );
};

export default PrivacyPage;
