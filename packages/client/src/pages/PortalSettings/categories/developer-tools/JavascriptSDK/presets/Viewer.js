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
import debounce from "lodash.debounce";
import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { Textarea } from "@docspace/shared/components/textarea";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";
import { ImageEditor } from "@docspace/shared/components/image-editor";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";

import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import CodeBlock from "../sub-components/CodeBlock";
import { Button } from "@docspace/shared/components/button";

const showPreviewThreshold = 720;

import { WidthSetter } from "../sub-components/WidthSetter";
import { HeightSetter } from "../sub-components/HeightSetter";
import { FrameIdSetter } from "../sub-components/FrameIdSetter";
import { PresetWrapper } from "../sub-components/PresetWrapper";
import { CodeToInsert } from "../sub-components/CodeToInsert";

import {
  Controls,
  CategorySubHeader,
  ControlsGroup,
  LabelGroup,
  ControlsSection,
  Frame,
  Container,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
  CodeWrapper,
} from "./StyledPresets";

const Viewer = (props) => {
  const { t, setDocumentTitle, getFilePrimaryLink, theme } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/sdk/1.0.0/api.js`;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const defaultWidthDimension = dataDimensions[0],
    defaultHeightDimension = dataDimensions[0],
    defaultWidth = "100",
    defaultHeight = "100";

  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );

  const [config, setConfig] = useState({
    mode: "viewer",
    editorType: "embedded",
    width: `${defaultWidth}${defaultWidthDimension.label}`,
    height: `${defaultHeight}${defaultHeightDimension.label}`,
    frameId: "ds-frame",
    init: false,
  });

  const params = objectToGetParams(config);

  const frameId = config.frameId || "ds-frame";

  const destroyFrame = () => {
    window.DocSpace?.SDK?.frames[frameId]?.destroyFrame();
  };

  const loadFrame = debounce(() => {
    const script = document.getElementById("integration");

    if (script) {
      script.remove();
    }

    const params = objectToGetParams(config);

    loadScript(`${scriptUrl}${params}`, "integration", () =>
      window.DocSpace.SDK.initFrame(config),
    );
  }, 500);

  useEffect(() => {
    loadFrame();
    return () => destroyFrame();
  });
  
  useEffect(() => {
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
  }, []);

  const onChangeTab = () => {
    loadFrame();
  };

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

  const openGetCodeModal = () => setIsGetCodeDialogOpened(true);

  const closeGetCodeModal = () => setIsGetCodeDialogOpened(false);

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview)
      setShowPreview(isEnoughWidthForPreview);
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [showPreview]);

  const codeBlock = `<div id="${frameId}">Fallback text</div>\n<script src="${scriptUrl}${params}"></script>`;

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
        <>
          <Box id={frameId}></Box>
        </>
      ) : (
        <EmptyIframeContainer
          text={t("FilePreview")}
          width="100%"
          height="100%"
        />
      )}
    </Frame>
  );

  const code = (
    <CodeToInsert t={t} theme={theme} codeBlock={codeBlock} config={config} />
  );

  const dataTabs = [
    {
      key: "preview",
      title: t("Common:Preview"),
      content: preview,
    },
    {
      key: "code",
      title: t("Code"),
      content: code,
    },
  ];

  return (
    <PresetWrapper
      description={t("ViewerDescription")}
      header={t("CreateSampleViewer")}
    >
      <Container>
        {showPreview && (
          <Preview>
            <TabsContainer
              isDisabled={config?.id === undefined}
              onSelect={onChangeTab}
              elements={dataTabs}
            />
          </Preview>
        )}
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

          {/* <InterfaceElements>
            <Label className="label">{t("InterfaceElements")}</Label>
            <Checkbox
              className="checkbox"
              label={t("TabPlugins")}
              onChange={() => {}}
              isChecked={true}
            />
            <RowContainer>
              <Checkbox label={t("Chat")} onChange={() => {}} isChecked={true} />
              <Text color="gray">({t("InLeftPanel")})</Text>
            </RowContainer>
            <RowContainer>
              <Checkbox label={t("FeedbackAndSupport")} onChange={() => {}} isChecked={true} />
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
            scaled={true}
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
            scaled={true}
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

      {!showPreview && (
        <>
          <GetCodeButtonWrapper>
            <Button
              id="get-sdk-code-button"
              primary
              size="normal"
              scale
              label={t("GetCode")}
              onClick={openGetCodeModal}
            />
          </GetCodeButtonWrapper>

          <GetCodeDialog
            t={t}
            visible={isGetCodeDialogOpened}
            codeBlock={codeBlock}
            onClose={closeGetCodeModal}
          />
        </>
      )}
    </PresetWrapper>
  );
};

export default inject(({ authStore, settingsStore, filesStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme } = settingsStore;
  const { getFilePrimaryLink } = filesStore;

  return {
    theme,
    setDocumentTitle,
    getFilePrimaryLink,
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
