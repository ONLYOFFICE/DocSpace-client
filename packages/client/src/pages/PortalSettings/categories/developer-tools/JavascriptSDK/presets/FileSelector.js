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

import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Box } from "@docspace/shared/components/box";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { inject, observer } from "mobx-react";
import SDK from "@onlyoffice/docspace-sdk-js";

import { HelpButton } from "@docspace/shared/components/help-button";
import { FilterType } from "@docspace/shared/enums";

import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { TooltipContent } from "../sub-components/TooltipContent";
import { Integration } from "../sub-components/Integration";

import SubtitleUrl from "PUBLIC_DIR/images/sdk-presets_subtitle.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_files-search.react.svg?url";
import SubtitleUrlDark from "PUBLIC_DIR/images/sdk-presets_subtitle_dark.png?url";
import SearchUrlDark from "PUBLIC_DIR/images/sdk-presets_files-search_dark.png?url";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { SelectTextInput } from "../sub-components/SelectTextInput";
import { CancelTextInput } from "../sub-components/CancelTextInput";
import { MainElementParameter } from "../sub-components/MainElementParameter";
import { PreviewBlock } from "../sub-components/PreviewBlock";

import { dimensionsModel, defaultSize, defaultDimension } from "../constants";

import {
  Controls,
  CategorySubHeader,
  ControlsGroup,
  LabelGroup,
  ControlsSection,
  Frame,
  Container,
  FilesSelectorInputWrapper,
} from "./StyledPresets";
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const FileSelector = (props) => {
  const { t, fetchExternalLinks, theme, currentColorScheme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const fileTypeDisplay = [
    { value: FilesSelectorFilterTypes.ALL, label: t("AllTypes") },
    {
      value: "EditorSupportedTypes",
      label: t("AllTypesSupportedByEditor", {
        organizationName: t("Common:OrganizationName"),
      }),
    },
    { value: "SelectorTypes", label: t("SelectTypes") },
  ];

  const fileOptions = [
    {
      key: FilterType.FoldersOnly,
      label: t(`Translations:Folders`),
    },
    {
      key: FilterType.DocumentsOnly,
      label: t(`Common:Documents`),
    },
    {
      key: FilterType.PresentationsOnly,
      label: t(`Translations:Presentations`),
    },
    {
      key: FilterType.SpreadsheetsOnly,
      label: t(`Translations:Spreadsheets`),
    },
    {
      key: FilterType.Pdf,
      label: t(`Files:Forms`),
    },
    {
      key: FilterType.ArchiveOnly,
      label: t(`Files:Archives`),
    },
    {
      key: FilterType.ImagesOnly,
      label: t(`Files:Images`),
    },
    {
      key: FilterType.MediaOnly,
      label: t(`Files:Media`),
    },
    {
      key: FilterType.FilesOnly,
      label: t(`Translations:Files`),
    },
  ];

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

  const sdk = new SDK();

  const destroyFrame = () => {
    sdk.frames[config.frameId]?.destroyFrame();
  };

  const initFrame = () => {
    setTimeout(() => sdk.init(config), 10);
  };

  useEffect(() => {
    initFrame();
    return () => destroyFrame();
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeFolderId = async (id, publicInPath) => {
    let newConfig = { id, requestToken: null, rootPath: "/rooms/shared/" };

    if (!!publicInPath) {
      const links = await fetchExternalLinks(publicInPath.id);

      if (links.length > 1) {
        const linksOptions = links.map((link) => {
          const { id, title, requestToken } = link.sharedTo;

          return {
            key: id,
            label: title,
            requestToken: requestToken,
          };
        });

        setSharedLinks(linksOptions);
      }

      newConfig.requestToken = links[0].sharedTo?.requestToken;
      newConfig.rootPath = "/rooms/share";
    } else {
      setSharedLinks(null);
    }

    setConfig((config) => {
      return { ...config, ...newConfig };
    });
  };

  const onChangeSharedLink = (link) => {
    setConfig((config) => {
      return { ...config, requestToken: link.requestToken };
    });
  };

  const changeColumnsOption = (e) => {
    setTypeDisplay(e.target.value);
    setConfig((config) => {
      return {
        ...config,
        filterParam:
          e.target.value === "SelectorTypes"
            ? selectedType.key
            : e.target.value,
      };
    });
  };

  const onTypeSelect = (option) => {
    setSelectedType(option);
    setConfig((config) => {
      return { ...config, filterParam: option.key };
    });
  };

  const toggleWithSearch = () => {
    setConfig((config) => ({ ...config, withSearch: !config.withSearch }));
  };

  const toggleWithSubtitle = () => {
    setConfig((config) => ({ ...config, withSubtitle: !config.withSubtitle }));
  };

  const preview = (
    <Frame
      width={config.width.includes("px") ? config.width : undefined}
      height={config.height.includes("px") ? config.height : undefined}
      targetId={config.frameId}
    >
      <Box id={config.frameId}></Box>
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
          scriptUrl={SDK_SCRIPT_URL}
          config={config}
        />
        <Controls>
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
              />
            </LabelGroup>
            <LabelGroup>
              <Checkbox
                className="checkbox"
                label={t("Common:Search")}
                onChange={toggleWithSearch}
                isChecked={config.withSearch}
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
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <FilesSelectorInput
                  onSelectFolder={onChangeFolderId}
                  isSelect
                />
              </FilesSelectorInputWrapper>
            </ControlsGroup>
            {sharedLinks && (
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
                  selectedOption={sharedLinks[0]}
                  displaySelectedOption
                  directionY="bottom"
                />
              </ControlsGroup>
            )}
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
            />
            {typeDisplay === "SelectorTypes" && (
              <>
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
                />
              </>
            )}
          </ControlsSection>

          <Integration
            className="integration-examples"
            t={t}
            theme={theme}
            currentColorScheme={currentColorScheme}
          />
        </Controls>
      </Container>

      <Integration
        className="integration-examples integration-examples-bottom"
        t={t}
        theme={theme}
        currentColorScheme={currentColorScheme}
      />
    </PresetWrapper>
  );
};

export const Component = inject(({ settingsStore, publicRoomStore }) => {
  const { theme, currentColorScheme } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
    currentColorScheme,
    fetchExternalLinks,
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
