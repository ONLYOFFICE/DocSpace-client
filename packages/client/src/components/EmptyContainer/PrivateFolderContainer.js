import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";

import Link from "@docspace/components/link";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";

import PlusIcon from "PUBLIC_DIR/images/plus.react.svg";
import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";
import EmptyScreenPrivacySvgUrl from "PUBLIC_DIR/images/empty_screen_privacy.svg?url";
import EmptyScreenPrivacyDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_privacy_dark.svg?url";

import EmptyContainer from "./EmptyContainer";

const StyledPlusIcon = styled(PlusIcon)`
  path {
    fill: #657077;
  }
`;

const PrivateFolderContainer = (props) => {
  const {
    t,
    theme,

    onCreate,
    linkStyles,

    isDesktop,
    isEncryptionSupport,
    organizationName,
    privacyInstructions,

    isEmptyPage,
    setIsEmptyPage,

    sectionWidth,
  } = props;

  const privateRoomHeader = t("PrivateRoomHeader");
  const privacyIcon = (
    <Box
      displayProp={"flex"}
      alignItems={"center"}
      heightProp={"16px"}
      marginProp={"0 8px 0 0"}
    >
      <img alt="" src={SecuritySvgUrl} />
    </Box>
  );

  const privateRoomDescription = (
    <>
      <div
        className="empty-folder_container-links list-container"
        style={{ gap: "8px" }}
      >
        {privacyIcon}
        <Box displayProp={"flex"} alignItems={"center"}>
          <Text fontSize={"12px"}>{t("PrivateRoomDescriptionSafest")}</Text>
        </Box>

        {privacyIcon}
        <Box displayProp={"flex"} alignItems={"center"}>
          <Text fontSize={"12px"}>{t("PrivateRoomDescriptionSecure")}</Text>
        </Box>

        {privacyIcon}
        <Box displayProp={"flex"} alignItems={"center"}>
          <Text fontSize={"12px"}>{t("PrivateRoomDescriptionEncrypted")}</Text>
        </Box>

        {privacyIcon}
        <Box displayProp={"flex"} alignItems={"center"}>
          <Text fontSize={"12px"}>
            {t("PrivateRoomDescriptionUnbreakable")}
          </Text>
        </Box>
      </div>

      <Text fontSize="13px" lineHeight={"20px"}>
        <Trans t={t} i18nKey="PrivateRoomSupport" ns="Files">
          Work in Private Room is available via {{ organizationName }} desktop
          app.
          <Link
            isBold
            isHovered
            color={theme.filesEmptyContainer.privateRoom.linkColor}
            href={privacyInstructions}
          >
            Instructions
          </Link>
        </Trans>
      </Text>
    </>
  );

  const commonButtons = (
    <span>
      <div className="empty-folder_container-links">
        <StyledPlusIcon
          className="empty-folder_container-image"
          data-format="docx"
          onClick={onCreate}
          alt="plus_icon"
        />

        <Box className="flex-wrapper_container">
          <Link data-format="docx" onClick={onCreate} {...linkStyles}>
            {t("Document")},
          </Link>
          <Link data-format="xlsx" onClick={onCreate} {...linkStyles}>
            {t("Spreadsheet")},
          </Link>
          <Link data-format="pptx" onClick={onCreate} {...linkStyles}>
            {t("Presentation")},
          </Link>
          <Link data-format="docxf" onClick={onCreate} {...linkStyles}>
            {t("Translations:NewForm")}
          </Link>
        </Box>
      </div>

      {/* <div className="empty-folder_container-links">
        <StyledPlusIcon
          className="empty-folder_container-image"
          onClick={onCreate}
          alt="plus_icon"
        />
        <Link {...linkStyles} onClick={onCreate}>
          {t("Folder")}
        </Link>
      </div> */}
    </span>
  );

  return (
    <EmptyContainer
      headerText={privateRoomHeader}
      descriptionText={privateRoomDescription}
      imageSrc={
        theme.isBase ? EmptyScreenPrivacySvgUrl : EmptyScreenPrivacyDarkSvgUrl
      }
      buttons={isDesktop && isEncryptionSupport && commonButtons}
      isEmptyPage={isEmptyPage}
      sectionWidth={sectionWidth}
    />
  );
};

export default inject(({ auth, filesStore }) => {
  const { isDesktopClient, isEncryptionSupport, organizationName, theme } =
    auth.settingsStore;

  const {
    privacyInstructions,

    viewAs,

    isEmptyPage,
    setIsEmptyPage,
  } = filesStore;

  return {
    theme,

    isDesktop: isDesktopClient,
    isVisitor: auth.userStore.user.isVisitor,
    isEncryptionSupport,
    organizationName,
    privacyInstructions,

    viewAs,

    isEmptyPage,
    setIsEmptyPage,
  };
})(withTranslation(["Files"])(observer(PrivateFolderContainer)));
