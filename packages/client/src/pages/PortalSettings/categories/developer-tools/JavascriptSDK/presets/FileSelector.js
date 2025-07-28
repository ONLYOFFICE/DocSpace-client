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

import { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import SDK from "@onlyoffice/docspace-sdk-js";

import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Label } from "@docspace/shared/components/label";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";
import { FilterType, FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { getSdkScriptUrl, loadScript } from "@docspace/shared/utils/common";

import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { getManyPDFTitle } from "@docspace/shared/utils/getPDFTite";

import SearchUrl from "PUBLIC_DIR/images/sdk-presets_files-search.react.svg?url";
import SearchUrlDark from "PUBLIC_DIR/images/sdk-presets_files-search_dark.png?url";
import SubtitleUrl from "PUBLIC_DIR/images/sdk-presets_subtitle.react.svg?url";
import SubtitleUrlDark from "PUBLIC_DIR/images/sdk-presets_subtitle_dark.png?url";

import {
  defaultDimension,
  defaultSize,
  dimensionsModel,
  sdkSource,
  sdkVersion,
} from "../constants";

import { CancelTextInput } from "../sub-components/CancelTextInput";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import Integration from "../sub-components/Integration";
import { MainElementParameter } from "../sub-components/MainElementParameter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import { SelectTextInput } from "../sub-components/SelectTextInput";
import { TooltipContent } from "../sub-components/TooltipContent";
import { VersionSelector } from "../sub-components/VersionSelector";
import { WidthSetter } from "../sub-components/WidthSetter";

import {
  CategorySubHeader,
  Container,
  Controls,
  ControlsGroup,
  ControlsSection,
  FilesSelectorInputWrapper,
  Frame,
  LabelGroup,
} from "./StyledPresets";

const FileSelector = (props) => {
  const { t, fetchExternalLinks, theme, logoText } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const fileTypeDisplay = [
    {
      value: FilesSelectorFilterTypes.ALL,
      label: t("AllTypes"),
      testId: "all_types_radio_button",
    },
    {
      value: "EditorSupportedTypes",
      label: t("AllTypesSupportedByEditor", {
        organizationName: logoText,
      }),
      testId: "editor_radio_button",
    },
    {
      value: "SelectorTypes",
      label: t("SelectTypes"),
      testId: "selector_radio_button",
    },
  ];

  const fileOptions = [
    {
      key: FilterType.FoldersOnly,
      label: t(`Common:Folders`),
    },
    {
      key: FilterType.DocumentsOnly,
      label: t(`Common:Documents`),
    },
    {
      key: FilterType.PresentationsOnly,
      label: t(`Common:Presentations`),
    },
    {
      key: FilterType.SpreadsheetsOnly,
      label: t(`Common:Spreadsheets`),
    },
    {
      key: FilterType.PDFForm,
      label: getManyPDFTitle(t, true),
    },
    {
      key: FilterType.Pdf,
      label: getManyPDFTitle(t, false),
    },
    {
      key: FilterType.DiagramsOnly,
      label: t(`Common:Diagrams`),
    },
    {
      key: FilterType.ArchiveOnly,
      label: t(`Common:Archives`),
    },
    {
      key: FilterType.ImagesOnly,
      label: t(`Common:Images`),
    },
    {
      key: FilterType.MediaOnly,
      label: t(`Common:Media`),
    },
    {
      key: FilterType.FilesOnly,
      label: t(`Common:Files`),
    },
  ];

  const [version, onSetVersion] = useState(sdkVersion[200]);

  const [source, onSetSource] = useState(sdkSource.Package);

  const [sharedLinks, setSharedLinks] = useState(null);
  const [typeDisplay, setTypeDisplay] = useState(fileTypeDisplay[0].value);
  const [selectedType, setSelectedType] = useState(fileOptions[0]);

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "file-selector",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    init: true,
    showSelectorCancel: true,
    showSelectorHeader: true,
    withSearch: true,
    acceptButtonLabel: t("Common:SelectAction"),
    cancelButtonLabel: t("Common:CancelButton"),
    withSubtitle: true,
    filterParam: FilesSelectorFilterTypes.ALL,
    isButtonMode: false,
    buttonWithLogo: true,
    events: {
      onSelectCallback: (items) => {
        console.log("onSelectCallback", items);
      },
      onCloseCallback: null,
      onAppReady: null,
      onAppError: (e) => console.log("onAppError", e),
      onEditorCloseCallback: null,
      onAuthSuccess: null,
      onSignOut: null,
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

  const onChangeFolderId = async (id, publicInPath) => {
    const newConfig = { id, requestToken: null, rootPath: "/rooms/shared/" };

    if (publicInPath) {
      const links = await fetchExternalLinks(publicInPath.id);

      if (links.length > 1) {
        const linksOptions = links.map((link) => {
          const { title, requestToken } = link.sharedTo;

          return {
            key: link.sharedTo.id,
            label: title,
            requestToken,
          };
        });

        setSharedLinks(linksOptions);
      }

      newConfig.requestToken = links[0].sharedTo?.requestToken;
      newConfig.rootPath = "/rooms/share";
    } else {
      setSharedLinks(null);
    }

    setConfig((oldConfig) => {
      return { ...oldConfig, ...newConfig };
    });
  };

  const onChangeSharedLink = (link) => {
    setConfig((oldConfig) => {
      return { ...oldConfig, requestToken: link.requestToken };
    });
  };

  const changeColumnsOption = (e) => {
    setTypeDisplay(e.target.value);
    setConfig((oldConfig) => {
      return {
        ...oldConfig,
        filterParam:
          e.target.value === "SelectorTypes"
            ? selectedType.key
            : e.target.value,
      };
    });
  };

  const onTypeSelect = (option) => {
    setSelectedType(option);
    setConfig((oldConfig) => {
      return { ...oldConfig, filterParam: option.key };
    });
  };

  const toggleWithSearch = () => {
    setConfig((oldConfig) => ({
      ...oldConfig,
      withSearch: !config.withSearch,
    }));
  };

  const toggleWithSubtitle = () => {
    setConfig((oldConfig) => ({
      ...oldConfig,
      withSubtitle: !config.withSubtitle,
    }));
  };

  const preview = (
    <Frame
      width={config.width.includes("px") ? config.width : undefined}
      height={config.height.includes("px") ? config.height : undefined}
      targetId={config.frameId}
    >
      <div id={config.frameId} />
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("FileSelectorDescription")}
      header={t("CreateSampleFileSelector")}
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
        />
        <Controls>
          <VersionSelector
            t={t}
            onSetSource={onSetSource}
            onSetVersion={onSetVersion}
          />
          <MainElementParameter
            t={t}
            config={config}
            setConfig={setConfig}
            isButtonMode={config.isButtonMode}
          />

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
            <Label className="label">{t("InterfaceElements")}</Label>

            <LabelGroup>
              <Checkbox
                className="checkbox"
                label={t("Subtitle")}
                onChange={toggleWithSubtitle}
                isChecked={config.withSubtitle}
                testId="subtitle_checkbox"
              />
              <HelpButton
                place="right"
                offsetRight={4}
                size={12}
                tooltipContent={
                  <TooltipContent
                    title={t("Subtitle")}
                    description={t("SubtitleDescription")}
                    img={theme.isBase ? SubtitleUrl : SubtitleUrlDark}
                  />
                }
                dataTestId="subtitle_help_button"
              />
            </LabelGroup>
            <LabelGroup>
              <Checkbox
                className="checkbox"
                label={t("Common:Search")}
                onChange={toggleWithSearch}
                isChecked={config.withSearch}
                testId="search_checkbox"
              />
              <HelpButton
                place="right"
                offsetRight={4}
                size={12}
                tooltipContent={
                  <TooltipContent
                    title={t("Common:Search")}
                    description={t("FilesSearchDescription")}
                    img={theme.isBase ? SearchUrl : SearchUrlDark}
                  />
                }
                dataTestId="search_help_button"
              />
            </LabelGroup>
            <SelectTextInput t={t} config={config} setConfig={setConfig} />
            <CancelTextInput t={t} config={config} setConfig={setConfig} />
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("DataDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("RoomOrFolder")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                  }
                  dataTestId="room_or_folder_help_button"
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <FilesSelectorInput
                  onSelectFolder={onChangeFolderId}
                  isSelect
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
                    dataTestId="external_link_help_button"
                  />
                </LabelGroup>
                <ComboBox
                  scaled
                  onSelect={onChangeSharedLink}
                  options={sharedLinks}
                  selectedOption={sharedLinks[0]}
                  displaySelectedOption
                  directionY="bottom"
                  testId="external_link_combobox"
                />
              </ControlsGroup>
            ) : null}
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>
            <Label className="label" text={t("FileTypeDisplay")} />
            <RadioButtonGroup
              orientation="vertical"
              options={fileTypeDisplay}
              name="columnsDisplayOptions"
              selected={typeDisplay}
              onClick={changeColumnsOption}
              spacing="8px"
              testId="file_type_display_radiobutton_group"
            />
            {typeDisplay === "SelectorTypes" ? (
              <ComboBox
                onSelect={onTypeSelect}
                options={
                  fileOptions || {
                    key: "Select",
                    label: t("Common:SelectAction"),
                  }
                }
                scaled
                directionY="top"
                selectedOption={selectedType}
                testId="file_type_combobox"
                dropDownTestId="file_type_dropdown"
              />
            ) : null}
          </ControlsSection>

          <Integration className="integration-examples" />
        </Controls>
      </Container>

      <Integration className="integration-examples integration-examples-bottom" />
    </PresetWrapper>
  );
};

export const Component = inject(({ settingsStore, publicRoomStore }) => {
  const { theme, logoText } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
    fetchExternalLinks,
    logoText,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "Translations",
    "SharingPanel",
  ])(observer(FileSelector)),
);
