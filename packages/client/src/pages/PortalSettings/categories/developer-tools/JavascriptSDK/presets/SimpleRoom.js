// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import RoomsSelectorInput from "SRC_DIR/components/RoomsSelectorInput";
import { inject, observer } from "mobx-react";
import SDK from "@onlyoffice/docspace-sdk-js";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Checkbox } from "@docspace/shared/components/checkbox";

import { useNavigate } from "react-router";
import { getPrimaryLink } from "@docspace/shared/api/rooms";
import FilesFilter from "@docspace/shared/api/files/filter";
import { RoomsType } from "@docspace/shared/enums";
import TitleUrl from "PUBLIC_DIR/images/sdk-presets_title.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";
import TitleDarkUrl from "PUBLIC_DIR/images/sdk-presets_title_dark.png?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.png?url";

import { loadScript, getSdkScriptUrl } from "@docspace/shared/utils/common";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";

import { TooltipContent } from "../sub-components/TooltipContent";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { SharedLinkHint } from "../sub-components/SharedLinkHint";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import Integration from "../sub-components/Integration";
import { VersionSelector } from "../sub-components/VersionSelector";

import {
  dimensionsModel,
  defaultSize,
  defaultDimension,
  sdkVersion,
  sdkSource,
} from "../constants";

import {
  Controls,
  CategorySubHeader,
  ControlsGroup,
  LabelGroup,
  Frame,
  Container,
  FilesSelectorInputWrapper,
  ControlsSection,
  CheckboxGroup,
} from "./StyledPresets";

const SimpleRoom = (props) => {
  const { t, fetchExternalLinks, currentColorScheme, theme } = props;
  const navigate = useNavigate();

  setDocumentTitle(t("JavascriptSdk"));

  const [version, onSetVersion] = useState(sdkVersion[200]);

  const [source, onSetSource] = useState(sdkSource.Package);

  const [sharedLinks, setSharedLinks] = useState(null);

  const [selectedLink, setSelectedLink] = useState(null);

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "public-room",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    showHeader: true,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    disableActionButton: false,
    infoPanelVisible: false,
    init: false,
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending",
      sortby: "DateAndTime",
      search: "",
      withSubfolders: false,
    },
  });

  const fromPackage = source === sdkSource.Package;

  const sdkScriptUrl = getSdkScriptUrl(version);

  const sdk = fromPackage ? new SDK() : window.DocSpace.SDK;

  const destroyFrame = () => {
    sdk?.frames[config.frameId]?.destroyFrame();
  };

  const initFrame = () => {
    setTimeout(() => sdk?.init(config), 0);
  };

  useEffect(() => {
    const script = document.getElementById("sdk-script");

    if (script) {
      script.remove();
      destroyFrame();
    }

    if (!fromPackage) {
      loadScript(sdkScriptUrl, "sdk-script");
    }

    return () => {
      destroyFrame();
      setTimeout(() => script?.remove(), 10);
    };
  }, [source, version]);

  useEffect(() => {
    initFrame();

    return () => {
      destroyFrame();
    };
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeFolderId = async (rooms) => {
    const publicRoom = rooms[0];

    const newConfig = {
      id: publicRoom.id,
      requestToken: null,
      rootPath: "/rooms/shared/",
    };

    let links = await fetchExternalLinks(publicRoom.id);

    if (links.length === 0) {
      const primaryLink = await getPrimaryLink(publicRoom.id);
      links = [primaryLink];
    }

    if (links.length > 1) {
      const linksOptions = links.map((link) => {
        const { id, title, requestToken } = link.sharedTo;
        const linkSettings = [];

        if ("password" in link.sharedTo) {
          linkSettings.push("password");
        }
        if ("expirationDate" in link.sharedTo) {
          linkSettings.push("expirationDate");
        }
        if (link.sharedTo.denyDownload) {
          linkSettings.push("denyDownload");
        }

        return {
          key: id,
          label: title,
          requestToken,
          settings: linkSettings,
        };
      });

      setSelectedLink(linksOptions[0]);
      setSharedLinks(linksOptions);
    }

    newConfig.requestToken = links[0]?.sharedTo?.requestToken;
    newConfig.rootPath = "/rooms/share";
    newConfig.mode = version === sdkVersion[200] ? "public-room" : "manager";

    setConfig((oldConfig) => {
      return { ...oldConfig, ...newConfig, init: true };
    });
  };

  const onChangeSharedLink = (link) => {
    setSelectedLink(link);
    setConfig((oldConfig) => {
      return { ...oldConfig, requestToken: link.requestToken };
    });
  };

  const onChangeShowTitle = () => {
    setConfig((oldConfig) => {
      return { ...oldConfig, showTitle: !config.showTitle };
    });
  };

  const onChangeShowFilter = () => {
    setConfig((oldConfig) => {
      return { ...oldConfig, showFilter: !config.showFilter };
    });
  };

  const navigateRoom = (id) => {
    const filter = FilesFilter.getDefault();
    filter.folder = id;
    navigate(`/rooms/shared/${id}/filter?${filter.toUrlParams()}`);
  };

  const redirectToSelectedRoom = () => navigateRoom(config.id);

  const preview = (
    <Frame
      width={
        config.id !== undefined && config.width.includes("px")
          ? config.width
          : undefined
      }
      height={
        config.id !== undefined && config.height.includes("px")
          ? config.height
          : undefined
      }
      targetId={config.frameId}
    >
      {config.id !== undefined ? (
        <div id={config.frameId} />
      ) : (
        <EmptyIframeContainer
          text={t("RoomPreview")}
          width="100%"
          height="100%"
        />
      )}
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("JavascriptSdk:PublicRoomPresetInfo")}
      header={t("CreateSamplePublicRoom")}
    >
      <Container>
        <PreviewBlock
          t={t}
          loadCurrentFrame={initFrame}
          preview={preview}
          theme={theme}
          frameId={config.frameId}
          scriptUrl={sdkScriptUrl}
          config={config}
          isDisabled={config?.id === undefined}
        />
        <Controls>
          <VersionSelector
            t={t}
            onSetSource={onSetSource}
            onSetVersion={onSetVersion}
          />
          <ControlsSection>
            <CategorySubHeader>{t("DataDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:Room")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                  }
                  dataTestId="room_selector_help_button"
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <RoomsSelectorInput
                  roomType={RoomsType.PublicRoom}
                  withSearch
                  withCancelButton
                  onSubmit={onChangeFolderId}
                  withHeader
                  headerProps={{ headerLabel: t("Common:SelectAction") }}
                  dataTestId="room_selector_input"
                />
              </FilesSelectorInputWrapper>
            </ControlsGroup>
            {sharedLinks ? (
              <ControlsGroup>
                <LabelGroup>
                  <Label
                    className="label"
                    text={t("SharingPanel:ExternalLink")}
                  />
                  <HelpButton
                    offsetRight={0}
                    size={12}
                    tooltipContent={
                      <Text fontSize="12px">{t("Common:PublicRoomInfo")}</Text>
                    }
                  />
                </LabelGroup>
                <ComboBox
                  scaled
                  onSelect={onChangeSharedLink}
                  options={sharedLinks}
                  selectedOption={selectedLink}
                  displaySelectedOption
                  directionY="bottom"
                />
                {selectedLink ? (
                  <SharedLinkHint
                    t={t}
                    linkSettings={selectedLink.settings}
                    redirectToSelectedRoom={redirectToSelectedRoom}
                    currentColorScheme={currentColorScheme}
                  />
                ) : null}
              </ControlsGroup>
            ) : null}
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("CustomizingDisplay")}</CategorySubHeader>
            <WidthSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dimensionsModel}
              defaultDimension={defaultDimension}
              defaultWidth={defaultSize.width}
            />
            <HeightSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dimensionsModel}
              defaultDimension={defaultDimension}
              defaultHeight={defaultSize.height}
            />
            <FrameIdSetter
              t={t}
              defaultFrameId={config.frameId}
              setConfig={setConfig}
            />
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("InterfaceElements")}</CategorySubHeader>

            <CheckboxGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("Common:Title")}
                  onChange={onChangeShowTitle}
                  isChecked={config.showTitle}
                  testId="title_checkbox"
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  dataTestId="title_help_button"
                  tooltipContent={
                    <TooltipContent
                      title={t("Common:Title")}
                      description={t("ManagerTitleDescription")}
                      img={theme.isBase ? TitleUrl : TitleDarkUrl}
                    />
                  }
                />
              </LabelGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("SearchFilterAndSort")}
                  onChange={onChangeShowFilter}
                  isChecked={config.showFilter}
                  testId="filter_checkbox"
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  dataTestId="filter_help_button"
                  tooltipContent={
                    <TooltipContent
                      title={t("SearchBlock")}
                      description={t("ManagerSearchBlockDescription")}
                      img={theme.isBase ? SearchUrl : SearchDarkUrl}
                    />
                  }
                />
              </LabelGroup>
            </CheckboxGroup>
          </ControlsSection>

          <Integration className="integration-examples" />
        </Controls>
      </Container>

      <Integration className="integration-examples integration-examples-bottom" />
    </PresetWrapper>
  );
};

export const Component = inject(({ settingsStore, publicRoomStore }) => {
  const { theme, currentColorScheme } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,

    fetchExternalLinks,
    currentColorScheme,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "Files",
    "Translations",
    "SharingPanel",
  ])(observer(SimpleRoom)),
);
