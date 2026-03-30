// (c) Copyright Ascensio System SIA 2009-2026
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

import { useState, useEffect, useCallback, useMemo } from "react";
import { useEventLog } from "../sub-components/useEventLog";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import debounce from "lodash.debounce";
import { Label } from "@docspace/ui-kit/components/label";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";
import { loadScript, getSdkScriptUrl } from "@docspace/shared/utils/common";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";

import SDK from "@onlyoffice/docspace-sdk-js";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { SizeLimitSetter } from "../sub-components/SizeLimitSetter";
import { FileTypesFilter } from "../sub-components/FileTypesFilter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";
import { VersionSelector } from "../sub-components/VersionSelector";
import Integration from "../sub-components/Integration";
import { EventLogBlock } from "../sub-components/EventLogBlock";

import {
  dimensionsModel,
  defaultSize,
  defaultDimension,
  sdkSource,
  sdkVersion,
  FILE_TYPE_EXTENSIONS,
  UNIT_MULTIPLIERS,
  UNIT_ORDER,
} from "../constants";

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

const UPLOADER_EVENT_TYPES = [
  "onAppReady",
  "onAppError",
  "onAuthSuccess",
  "onSignOut",
  "onNoAccess",
  "onNotFound",
  "onContentReady",
  "onUploadSuccess",
  "onUploadError",
  "onUploadProgress",
];

const Uploader = (props) => {
  const { t, theme, myFolderId, fetchTreeFolders } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const [version, onSetVersion] = useState(sdkVersion[220]);
  const [source, onSetSource] = useState(sdkSource.Package);
  const [uploadMode, setUploadMode] = useState("files");
  const [uploadQuantity, setUploadQuantity] = useState("single");
  const [perFileSize, setPerFileSize] = useState({ value: "25", unit: "mb" });
  const [totalSize, setTotalSize] = useState({ value: "100", unit: "mb" });
  const fileSizeUnits = [
    { key: "kb", label: t("Common:Kilobyte") },
    { key: "mb", label: t("Common:Megabyte") },
    { key: "gb", label: t("Common:Gigabyte") },
  ];

  const defaultSizeUnit = fileSizeUnits[1];

  const toBytes = (value, unit) => {
    const num = Number.parseInt(value, 10);
    if (!num || num <= 0) return 0;
    return num * (UNIT_MULTIPLIERS[unit] || 0);
  };

  const totalAvailableUnits = useMemo(() => {
    const minIndex = UNIT_ORDER.indexOf(perFileSize.unit);
    return fileSizeUnits.filter((u) => UNIT_ORDER.indexOf(u.key) >= minIndex);
  }, [perFileSize.unit, t]);

  const sizeError = useMemo(() => {
    const perBytes = toBytes(perFileSize.value, perFileSize.unit);
    const totalBytes = toBytes(totalSize.value, totalSize.unit);

    if (!perBytes || !totalBytes) return false;
    return totalBytes < perBytes;
  }, [perFileSize, totalSize]);

  const uploadModeOptions = [
    {
      value: "files",
      label: (
        <LabelGroup>
          {t("Common:Files")}
          <HelpButton
            offsetRight={0}
            size={12}
            place="right"
            tooltipContent={
              <Text fontSize="12px">{t("UploadFilesDescription")}</Text>
            }
            dataTestId="upload_files_help_button"
          />
        </LabelGroup>
      ),
    },
    {
      value: "folders",
      label: (
        <LabelGroup>
          {t("Common:Folders")}
          <HelpButton
            offsetRight={0}
            size={12}
            place="right"
            tooltipContent={
              <Text fontSize="12px">{t("UploadFoldersDescription")}</Text>
            }
            dataTestId="upload_folders_help_button"
          />
        </LabelGroup>
      ),
    },
  ];

  const isFolderMode = uploadMode === "folders";

  const uploadQuantityOptions = [
    {
      value: "single",
      label: (
        <LabelGroup>
          {isFolderMode ? t("SingleFolder") : t("SingleFile")}
          <HelpButton
            offsetRight={0}
            size={12}
            place="right"
            tooltipContent={
              <Text fontSize="12px">
                {isFolderMode
                  ? t("SingleFolderDescription")
                  : t("SingleFileDescription")}
              </Text>
            }
            dataTestId="single_help_button"
          />
        </LabelGroup>
      ),
    },
    {
      value: "multiple",
      label: (
        <LabelGroup>
          {isFolderMode ? t("MultipleFolders") : t("MultipleFiles")}
          <HelpButton
            offsetRight={0}
            size={12}
            place="right"
            tooltipContent={
              <Text fontSize="12px">
                {isFolderMode
                  ? t("MultipleFoldersDescription")
                  : t("MultipleFilesDescription")}
              </Text>
            }
            dataTestId="multiple_help_button"
          />
        </LabelGroup>
      ),
    },
  ];

  const getDefaultSecondaryText = (isFolderUpload, isMultipleUpload) => {
    if (isFolderUpload && isMultipleUpload) {
      return t("Common:DropzoneFoldersSecondary");
    }
    if (isFolderUpload && !isMultipleUpload) {
      return t("Common:DropzoneFolderSecondary");
    }
    if (!isFolderUpload && isMultipleUpload) {
      return t("Common:DropzoneFilesSecondary");
    }
    return t("Common:DropzoneTitleSecondary");
  };

  const [config, setConfig] = useState({
    src: window.location.origin,
    mode: "uploader",
    width: `${defaultSize.width}${defaultDimension.label}`,
    height: `${defaultSize.height}${defaultDimension.label}`,
    frameId: "ds-frame",
    init: true,
    acceptExtensions: FILE_TYPE_EXTENSIONS.document.join(","),
    linkMainText: t("Common:Upload"),
    secondaryText: getDefaultSecondaryText(false, false),
    id: myFolderId,
    isFolderUpload: false,
    isMultipleUpload: false,
    maxPerUploadSize: "25mb",
    maxTotalUploadSize: "100mb",
    events: {
      onAppReady: () => {},
      onAppError: () => {},
      onAuthSuccess: () => {},
      onSignOut: () => {},
      onNoAccess: () => {},
      onNotFound: () => {},
      onContentReady: () => {},
      onUploadSuccess: () => {},
      onUploadError: () => {},
      onUploadProgress: () => {},
    },
  });

  const fromPackage = source === sdkSource.Package;

  const sdkScriptUrl = getSdkScriptUrl(version);

  const sdk = useMemo(
    () => (fromPackage ? new SDK() : window.DocSpace.SDK),
    [fromPackage],
  );

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
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (!myFolderId) {
      fetchTreeFolders();
    } else {
      setConfig((oldConfig) => ({ ...oldConfig, id: myFolderId }));
    }
  }, [myFolderId, fetchTreeFolders]);

  useEffect(() => {
    initFrame();

    return () => {
      destroyFrame();
    };
  }, [config]);

  const [eventLog, onClearEventLog] = useEventLog(config.frameId);

  const onChangeFolderId = (folderId) => {
    const newConfig = {
      id: folderId,
      init: true,
    };

    setConfig((oldConfig) => {
      return { ...oldConfig, ...newConfig };
    });
  };

  const onClickUploadMode = (e) => {
    const value = e.target.value;
    const isFolderUpload = value === "folders";
    setUploadMode(value);
    setConfig((oldConfig) => ({
      ...oldConfig,
      isFolderUpload,
      secondaryText: getDefaultSecondaryText(
        isFolderUpload,
        oldConfig.isMultipleUpload,
      ),
      init: true,
    }));
  };

  const onClickUploadQuantity = (e) => {
    const value = e.target.value;
    const isMultipleUpload = value === "multiple";
    setUploadQuantity(value);
    setConfig((oldConfig) => ({
      ...oldConfig,
      isMultipleUpload,
      secondaryText: getDefaultSecondaryText(
        oldConfig.isFolderUpload,
        isMultipleUpload,
      ),
      init: true,
    }));
  };

  const debouncedSetLinkFilesText = useCallback(
    debounce((newText) => {
      setConfig((oldConfig) => ({
        ...oldConfig,
        linkMainText: newText,
        init: true,
      }));
    }, 500),
    [setConfig],
  );

  const onChangeLinkFileText = (e) => {
    const newText = e.target.value;
    setConfig((oldConfig) => ({
      ...oldConfig,
      linkMainText: newText,
    }));
    debouncedSetLinkFilesText(newText);
  };

  const debouncedSetSecondaryText = useCallback(
    debounce((newText) => {
      setConfig((oldConfig) => ({
        ...oldConfig,
        secondaryText: newText,
        init: true,
      }));
    }, 500),
    [setConfig],
  );

  const onChangeSecondaryText = (e) => {
    const newText = e.target.value;
    setConfig((oldConfig) => ({
      ...oldConfig,
      secondaryText: newText,
    }));
    debouncedSetSecondaryText(newText);
  };

  const preview = (
    <>
      <Frame
        width={config.width.includes("px") ? config.width : undefined}
        height={config.height.includes("px") ? config.height : undefined}
        targetId={config.frameId}
      >
        <div id={config.frameId} />
      </Frame>
      <EventLogBlock
        t={t}
        events={eventLog}
        onClear={onClearEventLog}
        eventTypes={UPLOADER_EVENT_TYPES}
      />
    </>
  );

  return (
    <PresetWrapper
      description={t("UploaderPresetInfo")}
      header={t("CreateSampleUploader")}
    >
      <Container>
        <PreviewBlock
          loadCurrentFrame={initFrame}
          preview={preview}
          theme={theme}
          frameId={config.frameId}
          scriptUrl={sdkScriptUrl}
          config={config}
          isDisabled={config?.id === undefined}
          showScriptParamsWithEvents={false}
        />
        <Controls>
          <VersionSelector
            t={t}
            onSetSource={onSetSource}
            onSetVersion={onSetVersion}
          />
          <ControlsSection>
            <CategorySubHeader>{t("DestinationFolderId")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:SelectFolder")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  place="right-end"
                  tooltipContent={
                    <Text fontSize="12px">{t("SelectDestinationFolder")}</Text>
                  }
                  dataTestId="room_or_folder_help_button"
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                {config.id && (
                  <FilesSelectorInput
                    key={config.id}
                    id={config.id}
                    onSelectFolder={onChangeFolderId}
                    isSelect
                  />
                )}
              </FilesSelectorInputWrapper>
            </ControlsGroup>
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("UploadMode")}</CategorySubHeader>
            <RadioButtonGroup
              orientation="vertical"
              options={uploadModeOptions}
              name="uploadMode"
              selected={uploadMode}
              onClick={onClickUploadMode}
              spacing="8px"
              dataTestId="upload_mode_radiobutton_group"
            />
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("Common:Quantity")}</CategorySubHeader>
            <RadioButtonGroup
              orientation="vertical"
              options={uploadQuantityOptions}
              name="uploadQuantity"
              selected={uploadQuantity}
              onClick={onClickUploadQuantity}
              spacing="8px"
              dataTestId="upload_quantity_radiobutton_group"
            />
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("UploadLimits")}</CategorySubHeader>
            <SizeLimitSetter
              labelText={
                config.isMultipleUpload
                  ? config.isFolderUpload
                    ? t("MaximumFolderSizePerFolder")
                    : t("MaximumFileSizePerFile")
                  : config.isFolderUpload
                    ? t("MaximumFolderSize")
                    : t("MaximumFileSize")
              }
              tooltipText={
                config.isMultipleUpload
                  ? config.isFolderUpload
                    ? t("MaximumFoldersSizeDescription")
                    : t("MaximumFilesSizeDescription")
                  : config.isFolderUpload
                    ? t("MaximumFolderSizeDescription")
                    : t("MaximumFileSizeDescription")
              }
              configKey="maxPerUploadSize"
              defaultValue="25"
              sizeUnits={fileSizeUnits}
              defaultUnit={defaultSizeUnit}
              setConfig={setConfig}
              tabIndex={7}
              dataTestId="max_file_size"
              onSizeChange={setPerFileSize}
            />

            {config.isMultipleUpload && (
              <SizeLimitSetter
                labelText={t("MaximumTotalUploadSize")}
                tooltipText={t("MaximumTotalUploadSizeDescription")}
                configKey="maxTotalUploadSize"
                defaultValue="100"
                sizeUnits={fileSizeUnits}
                defaultUnit={defaultSizeUnit}
                setConfig={setConfig}
                tabIndex={8}
                dataTestId="max_total_upload_size"
                onSizeChange={setTotalSize}
                availableUnits={totalAvailableUnits}
                hasError={sizeError}
                errorMessage={t("TotalSizeMustBeGreater")}
              />
            )}
          </ControlsSection>

          {!config.isFolderUpload && (
            <FileTypesFilter t={t} config={config} setConfig={setConfig} />
          )}

          <ControlsSection>
            <ControlsGroup>
              <Label className="label" text={t("ButtonText")} />
              <TextInput
                scale
                value={config.linkMainText}
                onChange={onChangeLinkFileText}
                tabIndex={5}
                testId="button_text_input"
              />
            </ControlsGroup>

            <ControlsGroup>
              <Label className="label" text={t("HelperText")} />
              <TextInput
                scale
                value={config.secondaryText}
                onChange={onChangeSecondaryText}
                tabIndex={6}
                testId="helper_text_input"
              />
            </ControlsGroup>

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

          <Integration className="integration-examples" />
        </Controls>
      </Container>

      <Integration className="integration-examples integration-examples-bottom" />
    </PresetWrapper>
  );
};

export const Component = inject(({ settingsStore, treeFoldersStore }) => {
  const { theme } = settingsStore;
  const { myFolderId, fetchTreeFolders } = treeFoldersStore;

  return {
    theme,
    myFolderId,
    fetchTreeFolders,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "CreateEditRoomDialog",
  ])(observer(Uploader)),
);
