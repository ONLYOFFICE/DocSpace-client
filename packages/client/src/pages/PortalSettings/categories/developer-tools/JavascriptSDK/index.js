import React from "react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { RoomsType } from "@docspace/common/constants";
import { inject, observer } from "mobx-react";

import { mobile, tablet } from "@docspace/components/utils/device";
import { isMobile } from "react-device-detect";

import Box from "@docspace/components/box";
import Link from "@docspace/components/link";
import Text from "@docspace/components/text";

import CSP from "./sub-components/csp";
import PresetTile from "./sub-components/PresetTile";

import EditorImg from "PUBLIC_DIR/images/sdk-presets_editor.react.svg?url";
import FileSelectorImg from "PUBLIC_DIR/images/sdk-presets_file-selector.react.svg?url";
import ManagerImg from "PUBLIC_DIR/images/sdk-presets_manager.react.svg?url";
import RoomSelectorImg from "PUBLIC_DIR/images/sdk-presets_room-selector.react.svg?url";
import ViewerImg from "PUBLIC_DIR/images/sdk-presets_viewer.react.svg?url";

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
  margin-top: 5px;
  max-width: 700px;
  .sdk-description {
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
    grid-template-columns: 1fr;
  }
`;

const PortalIntegration = (props) => {
  const { t, setDocumentTitle, currentColorScheme, sdkLink } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const navigate = useNavigate();

  const navigateToManager = () => navigate("manager");
  const navigateToRoomSelector = () => navigate("room-selector");
  const navigateToFileSelector = () => navigate("file-selector");
  const navigateToEditor = () => navigate("editor");
  const navigateToViewer = () => navigate("viewer");

  const presetsData = [
    {
      title: t("Manager"),
      description: t("ManagerDescription"),
      image: ManagerImg,
      handleOnClick: navigateToManager,
    },
    {
      title: t("RoomSelector"),
      description: t("RoomSelectorDescription"),
      image: RoomSelectorImg,
      handleOnClick: navigateToRoomSelector,
    },
    {
      title: t("FileSelector"),
      description: t("FileSelectorDescription"),
      image: FileSelectorImg,
      handleOnClick: navigateToFileSelector,
    },
    {
      title: t("Editor"),
      description: t("EditorDescription"),
      image: EditorImg,
      handleOnClick: navigateToEditor,
    },
    {
      title: t("Viewer"),
      description: t("ViewerDescription"),
      image: ViewerImg,
      handleOnClick: navigateToViewer,
    },
  ];

  return (
    <SDKContainer>
      <CategoryDescription>
        <Text className="sdk-description">{t("SDKDescription")}</Text>
        <Link
          color={currentColorScheme?.main?.accent}
          fontSize="12px"
          fontWeight="400"
          onClick={() => window.open(sdkLink, "_blank")}>
          {t("APILink")}.
        </Link>
        <CSP t={t} />
      </CategoryDescription>
      <CategoryHeader>{t("CreateSampleHeader")}</CategoryHeader>
      <Text lineHeight="20px">{t("InitializeSDK")}</Text>
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

export default inject(({ auth }) => {
  const { settingsStore, setDocumentTitle } = auth;
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
