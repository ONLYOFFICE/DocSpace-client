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
import { inject, observer } from "mobx-react";
import { ImageEditor } from "@docspace/shared/components/image-editor";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";

import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { PreviewBlock } from "../sub-components/PreviewBlock";

import { loadFrame } from "../utils";

import {
  dataDimensions,
  defaultWidthDimension,
  defaultHeightDimension,
  defaultWidth,
  defaultHeight,
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
import { SDK_SCRIPT_URL } from "@docspace/shared/constants";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { Integration } from "../sub-components/Integration";

const Viewer = (props) => {
  const { t, getFilePrimaryLink, theme, currentColorScheme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const [config, setConfig] = useState({
    mode: "viewer",
    editorType: "embedded",
    width: `${defaultWidth}${defaultWidthDimension.label}`,
    height: `${defaultHeight}${defaultHeightDimension.label}`,
    frameId: "ds-frame",
    init: false,
  });

  const frameId = config.frameId || "ds-frame";

  const destroyFrame = () => {
    window.DocSpace?.SDK?.frames[frameId]?.destroyFrame();
  };

  const loadCurrentFrame = () => loadFrame(config, SDK_SCRIPT_URL);

  useEffect(() => {
    loadCurrentFrame();
    return () => destroyFrame();
  });

  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeFileId = async (file) => {
    const newConfig = {
      id: file.id,
      init: true,
      requestToken: null,
    };

    if (file.inPublic) {
      const link = await getFilePrimaryLink(file.id);
      const { requestToken } = link.sharedTo;

      newConfig.requestToken = requestToken;
    }

    setConfig((config) => {
      return { ...config, ...newConfig };
    });
  };

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
      targetId={frameId}
    >
      {config.id !== undefined ? (
        <Box id={frameId}></Box>
      ) : (
        <EmptyIframeContainer
          text={t("FilePreview")}
          width="100%"
          height="100%"
        />
      )}
    </Frame>
  );

  return (
    <PresetWrapper
      description={t("ViewerDescription")}
      header={t("CreateSampleViewer")}
    >
      <Container>
        <PreviewBlock
          t={t}
          loadCurrentFrame={loadCurrentFrame}
          preview={preview}
          theme={theme}
          frameId={frameId}
          scriptUrl={SDK_SCRIPT_URL}
          config={config}
          isDisabled={config?.id === undefined}
        />
        <Controls>
          <ControlsSection>
            <CategorySubHeader>{t("FileId")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:SelectFile")} />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <FilesSelectorInput
                  onSelectFile={onChangeFileId}
                  filterParam={FilesSelectorFilterTypes.ALL}
                  isSelect
                  isDocumentIcon
                />
              </FilesSelectorInputWrapper>
            </ControlsGroup>
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("CustomizingDisplay")}</CategorySubHeader>
            <WidthSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dataDimensions}
              defaultDimension={defaultWidthDimension}
              defaultWidth={defaultWidth}
            />
            <HeightSetter
              t={t}
              setConfig={setConfig}
              dataDimensions={dataDimensions}
              defaultDimension={defaultHeightDimension}
              defaultHeight={defaultHeight}
            />
            <FrameIdSetter
              t={t}
              defaultFrameId={config.frameId}
              setConfig={setConfig}
            />
          </ControlsSection>

          <Integration
            className="integration-examples"
            t={t}
            theme={theme}
            currentColorScheme={currentColorScheme}
          />

          {/* <InterfaceElements>
            <Label className="label">{t("InterfaceElements")}</Label>
            <Checkbox
              className="checkbox"
              label={t("TabPlugins")}
              onChange={() => {}}
              isChecked
            />
            <RowContainer>
              <Checkbox label={t("Chat")} onChange={() => {}} isChecked />
              <Text color="gray">({t("InLeftPanel")})</Text>
            </RowContainer>
            <RowContainer>
              <Checkbox label={t("FeedbackAndSupport")} onChange={() => {}} isChecked />
              <Text color="gray">({t("InLeftPanel")})</Text>
            </RowContainer>
          </InterfaceElements>
          <CategorySubHeader>{t("AddWatermarks")}</CategorySubHeader>
          <ControlsGroup>
            <LabelGroup>
              <Label className="label" text={t("SelectImage")} />
            </LabelGroup>
            <FilesSelectorInputWrapper>
              <FilesSelectorInput onSelectFolder={onChangeFileId} isSelect />
            </FilesSelectorInputWrapper>
          </ControlsGroup>
          <Label className="label" text={t("Scale")} />
          <ComboBox
            onSelect={() => {}}
            options={[
              { key: "1", label: "100%", default: true },
              { key: "2", label: "50%" },
              { key: "3", label: "25%" },
            ]}
            scaled
            selectedOption={{ key: "1", label: "100%", default: true }}
            displaySelectedOption
            directionY="top"
          />
          <Label className="label" text={t("Rotate")} />
          <ComboBox
            onSelect={() => {}}
            options={[
              { key: "1", label: "45%", default: true },
              { key: "2", label: "75%" },
              { key: "3", label: "90%" },
              { key: "4", label: "180%" },
            ]}
            scaled
            selectedOption={{ key: "1", label: "45%", default: true }}
            displaySelectedOption
            directionY="top"
          />
          <Label className="label" text={t("CreateEditRoomDialog:Icon")} />
          <ImageEditor
            t={t}
            className="wrapper-image-editor"
            classNameWrapperImageCropper="avatar-editor"
            image={{}}
            setPreview={() => {}}
            onChangeImage={() => {}}
          /> */}
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

export const Component = inject(({ settingsStore, filesStore }) => {
  const { theme, currentColorScheme } = settingsStore;
  const { getFilePrimaryLink } = filesStore;

  return {
    theme,
    getFilePrimaryLink,
    currentColorScheme,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "CreateEditRoomDialog",
  ])(observer(Viewer)),
);
