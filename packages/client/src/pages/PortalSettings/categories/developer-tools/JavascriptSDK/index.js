import React from "react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { DOCSPACE } from "@docspace/shared/constants";
import { inject, observer } from "mobx-react";

import { mobile, tablet } from "@docspace/shared/utils/device";
import { isMobile } from "react-device-detect";

import { Box } from "@docspace/shared/components/box";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

import CSP from "./sub-components/csp";
import PresetTile from "./sub-components/PresetTile";

import DocspaceImg from "PUBLIC_DIR/images/sdk-presets_docspace.react.svg?url";
import PublicRoomImg from "PUBLIC_DIR/images/sdk-presets_public-room.react.svg?url";
import RoomSelectorImg from "PUBLIC_DIR/images/sdk-presets_room-selector.react.svg?url";
import FileSelectorImg from "PUBLIC_DIR/images/sdk-presets_file-selector.react.svg?url";
import EditorImg from "PUBLIC_DIR/images/sdk-presets_editor.react.svg?url";
import ViewerImg from "PUBLIC_DIR/images/sdk-presets_viewer.react.svg?url";
import CustomImg from "PUBLIC_DIR/images/sdk-presets_custom.react.svg?url";

import DocspaceImgDark from "PUBLIC_DIR/images/sdk-presets_docspace_dark.react.svg?url";
import PublicRoomImgDark from "PUBLIC_DIR/images/sdk-presets_public-room_dark.react.svg?url";
import RoomSelectorImgDark from "PUBLIC_DIR/images/sdk-presets_room-selector_dark.react.svg?url";
import FileSelectorImgDark from "PUBLIC_DIR/images/sdk-presets_file-selector_dark.react.svg?url";
import EditorImgDark from "PUBLIC_DIR/images/sdk-presets_editor_dark.react.svg?url";
import ViewerImgDark from "PUBLIC_DIR/images/sdk-presets_viewer_dark.react.svg?url";
import CustomImgDark from "PUBLIC_DIR/images/sdk-presets_custom_dark.react.svg?url";

const SDKContainer = styled(Box)`
  @media ${tablet} {
    width: 100%;
  }

  ${isMobile &&
  css`
    width: 100%;
  `}
`;

const CategoryHeader = styled.div`
  margin-top: 40px;
  margin-bottom: 16px;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  font-style: normal;
  font-weight: 700;
  line-height: 22px;

  @media ${tablet} {
    margin-top: 24px;
  }

  ${isMobile &&
  css`
    margin-top: 24px;
  `}
`;

const CategoryDescription = styled(Box)`
  margin-top: 2px;
  max-width: 700px;
  .sdk-description {
    display: inline;
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }
`;

const PresetsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(min(200px, 100%), 1fr));
  gap: 16px;

  max-width: fit-content;

  margin-top: 16px;

  @media ${mobile} {
    display: flex;
    flex-direction: column;
  }
`;

const PortalIntegration = (props) => {
  const { t, setDocumentTitle, currentColorScheme, sdkLink, theme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const navigate = useNavigate();

  const navigateToDocspace = () => navigate("docspace");
  const navigateToPublicRoom = () => navigate("public-room");
  const navigateToCustom = () => navigate("custom");
  const navigateToRoomSelector = () => navigate("room-selector");
  const navigateToFileSelector = () => navigate("file-selector");
  const navigateToEditor = () => navigate("editor");
  const navigateToViewer = () => navigate("viewer");

  const presetsData = [
    {
      title: DOCSPACE,
      description: t("DocspaceDescription"),
      image: theme.isBase ? DocspaceImg : DocspaceImgDark,
      handleOnClick: navigateToDocspace,
    },
    {
      title: t("Files:PublicRoom"),
      description: t("PublicRoomDescription"),
      image: theme.isBase ? PublicRoomImg : PublicRoomImgDark,
      handleOnClick: navigateToPublicRoom,
    },
    {
      title: t("Editor"),
      description: t("EditorDescription"),
      image: theme.isBase ? EditorImg : EditorImgDark,
      handleOnClick: navigateToEditor,
    },
    {
      title: t("Viewer"),
      description: t("ViewerDescription"),
      image: theme.isBase ? ViewerImg : ViewerImgDark,
      handleOnClick: navigateToViewer,
    },
    {
      title: t("RoomSelector"),
      description: t("RoomSelectorDescription"),
      image: theme.isBase ? RoomSelectorImg : RoomSelectorImgDark,
      handleOnClick: navigateToRoomSelector,
    },
    {
      title: t("FileSelector"),
      description: t("FileSelectorDescription"),
      image: theme.isBase ? FileSelectorImg : FileSelectorImgDark,
      handleOnClick: navigateToFileSelector,
    },
    {
      title: t("Common:Custom"),
      description: t("CustomDescription"),
      image: theme.isBase ? CustomImg : CustomImgDark,
      handleOnClick: navigateToCustom,
    },
  ];

  return (
    <SDKContainer>
      <CategoryDescription>
        <Text className="sdk-description">{t("SDKDescription")}</Text>
        <Link
          color={currentColorScheme?.main?.accent}
          fontSize="13px"
          fontWeight="400"
          onClick={() => window.open(sdkLink, "_blank")}
        >
          {" "}
          {t("APILink")}.
        </Link>
        <CSP t={t} />
      </CategoryDescription>
      <CategoryHeader>{t("SelectModeEmbedding")}</CategoryHeader>
      <Text lineHeight="20px" color={theme.sdkPresets.secondaryColor}>
        {t("InitializeSDK")}
      </Text>
      <PresetsContainer>
        {presetsData.map((data) => (
          <PresetTile
            t={t}
            key={data.title}
            title={data.title}
            description={data.description}
            image={data.image}
            handleOnClick={data.handleOnClick}
          />
        ))}
      </PresetsContainer>
    </SDKContainer>
  );
};

export default inject(({ settingsStore, authStore, publicRoomStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme, currentColorScheme, sdkLink } = settingsStore;

  return {
    theme,
    setDocumentTitle,
    currentColorScheme,
    sdkLink,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "CreateEditRoomDialog",
    "SharingPanel",
    "Common",
  ])(observer(PortalIntegration)),
);
