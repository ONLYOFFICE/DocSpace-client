// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useRef, useState } from "react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";

import { inject, observer } from "mobx-react";

import { mobile, tablet } from "@docspace/shared/utils/device";
import { isMobile } from "react-device-detect";

import { Box } from "@docspace/shared/components/box";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

import CSP from "./sub-components/csp";
import PresetTile from "./sub-components/PresetTile";

import PortalImg from "PUBLIC_DIR/images/sdk-presets_portal.react.svg?url";
import PublicRoomImg from "PUBLIC_DIR/images/sdk-presets_public-room.react.svg?url";
import RoomSelectorImg from "PUBLIC_DIR/images/sdk-presets_room-selector.react.svg?url";
import FileSelectorImg from "PUBLIC_DIR/images/sdk-presets_file-selector.react.svg?url";
import EditorImg from "PUBLIC_DIR/images/sdk-presets_editor.react.svg?url";
import ViewerImg from "PUBLIC_DIR/images/sdk-presets_viewer.react.svg?url";
import CustomImg from "PUBLIC_DIR/images/sdk-presets_custom.react.svg?url";

import PortalImgDark from "PUBLIC_DIR/images/sdk-presets_portal_dark.react.svg?url";
import PublicRoomImgDark from "PUBLIC_DIR/images/sdk-presets_public-room_dark.react.svg?url";
import RoomSelectorImgDark from "PUBLIC_DIR/images/sdk-presets_room-selector_dark.react.svg?url";
import FileSelectorImgDark from "PUBLIC_DIR/images/sdk-presets_file-selector_dark.react.svg?url";
import EditorImgDark from "PUBLIC_DIR/images/sdk-presets_editor_dark.react.svg?url";
import ViewerImgDark from "PUBLIC_DIR/images/sdk-presets_viewer_dark.react.svg?url";
import CustomImgDark from "PUBLIC_DIR/images/sdk-presets_custom_dark.react.svg?url";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const SDKContainer = styled(Box)`
  @media ${tablet} {
    width: 100%;
  }

  ${isMobile &&
  css`
    width: 100%;
  `}

  .presets-flex {
    display: flex;
    flex-direction: column;
  }
`;

const CategoryHeader = styled.div`
  margin-top: 40px;
  margin-bottom: 16px;
  font-size: 16px;
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
  const { t, currentColorScheme, sdkLink, theme, tReady } = props;

  const isSmall = useRef(
    (() => {
      const content = document.querySelector(".section-wrapper-content");
      const rect = content.getBoundingClientRect();
      return rect.width <= 600;
    })(),
  );

  const [isFlex, setIsFlex] = useState(isSmall.current);

  const navigate = useNavigate();

  const navigateToPortal = () => navigate("docspace");
  const navigateToPublicRoom = () => navigate("public-room");
  const navigateToCustom = () => navigate("custom");
  const navigateToRoomSelector = () => navigate("room-selector");
  const navigateToFileSelector = () => navigate("file-selector");
  const navigateToEditor = () => navigate("editor");
  const navigateToViewer = () => navigate("viewer");

  const presetsData = [
    {
      title: t("Common:ProductName"),
      description: t("PortalDescription", {
        productName: t("Common:ProductName"),
      }),
      image: theme.isBase ? PortalImg : PortalImgDark,
      handleOnClick: navigateToPortal,
    },
    {
      title: t("Common:PublicRoom"),
      description: t("PublicRoomDescription"),
      image: theme.isBase ? PublicRoomImg : PublicRoomImgDark,
      handleOnClick: navigateToPublicRoom,
    },
    {
      title: t("Common:Editor"),
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
      description: t("CustomDescription", {
        productName: t("Common:ProductName"),
      }),
      image: theme.isBase ? CustomImg : CustomImgDark,
      handleOnClick: navigateToCustom,
    },
  ];

  useEffect(() => {
    if (tReady) setDocumentTitle(t("JavascriptSdk"));
  }, [tReady]);

  const onResize = (entries) => {
    const belowThreshold = entries[0].contentRect.width <= 600;
    if (belowThreshold !== isSmall.current) {
      isSmall.current = belowThreshold;
      setIsFlex(belowThreshold);
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(onResize);
    const content = document.querySelector(".section-wrapper-content");
    observer.observe(content);
    return () => {
      observer.unobserve(content);
    };
  }, []);

  return (
    <SDKContainer>
      <CategoryDescription>
        <Text className="sdk-description">
          {t("SDKDescription", { productName: t("Common:ProductName") })}
        </Text>
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
      <CategoryHeader>
        {t("SelectModeEmbedding", { productName: t("Common:ProductName") })}
      </CategoryHeader>
      <Text lineHeight="20px" color={theme.sdkPresets.secondaryColor}>
        {t("InitializeSDK")}
      </Text>
      <PresetsContainer className={`${isFlex ? "presets-flex" : ""}`}>
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

export default inject(({ settingsStore }) => {
  const { theme, currentColorScheme, sdkLink } = settingsStore;

  return {
    theme,
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
