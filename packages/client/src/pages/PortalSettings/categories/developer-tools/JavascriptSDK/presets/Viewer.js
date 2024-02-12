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

import { isTablet, isMobile } from "@docspace/shared/utils/device";

import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import { Button } from "@docspace/shared/components/button";

const showPreviewThreshold = 720;

import {
  SDKContainer,
  Controls,
  CategoryHeader,
  CategorySubHeader,
  CategoryDescription,
  ControlsGroup,
  LabelGroup,
  ControlsSection,
  Frame,
  Container,
  RowContainer,
  ColumnContainer,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
  CodeWrapper,
} from "./StyledPresets";

const Viewer = (props) => {
  const { t, setDocumentTitle } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const [widthDimension, setWidthDimension] = useState(dataDimensions[0]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[0]);
  const [width, setWidth] = useState("100");
  const [height, setHeight] = useState("100");
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(window.innerWidth > showPreviewThreshold);

  const [config, setConfig] = useState({
    mode: "viewer",
    width: `${width}${widthDimension.label}`,
    height: `${height}${heightDimension.label}`,
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

    loadScript(`${scriptUrl}${params}`, "integration", () => window.DocSpace.SDK.initFrame(config));
  }, 500);

  useEffect(() => {
    loadFrame();
    return () => destroyFrame();
  });

  const onChangeTab = () => {
    loadFrame();
  };

  const onChangeWidth = (e) => {
    setConfig((config) => {
      return { ...config, width: `${e.target.value}${widthDimension.label}` };
    });

    setWidth(e.target.value);
  };

  const onChangeHeight = (e) => {
    setConfig((config) => {
      return { ...config, height: `${e.target.value}${heightDimension.label}` };
    });

    setHeight(e.target.value);
  };

  const onChangeFileId = (file) => {
    setConfig((config) => {
      return { ...config, id: file.id };
    });
  };

  const onChangeFrameId = (e) => {
    setConfig((config) => {
      return { ...config, frameId: e.target.value, init: true };
    });
  };

  const onChangeWidthDimension = (item) => {
    setConfig((config) => {
      return { ...config, width: `${width}${item.label}` };
    });

    setWidthDimension(item);
  };

  const onChangeHeightDimension = (item) => {
    setConfig((config) => {
      return { ...config, height: `${height}${item.label}` };
    });

    setHeightDimension(item);
  };

  const openGetCodeModal = () => setIsGetCodeDialogOpened(true);

  const closeGetCodeModal = () => setIsGetCodeDialogOpened(false);

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview) setShowPreview(isEnoughWidthForPreview);
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
      width={width + widthDimension.label}
      height={height + heightDimension.label}
      targetId={frameId}
    >
      {config.id !== undefined ? (
        <>
          <Box id={frameId}></Box>
        </>
      ) : (
        <EmptyIframeContainer
          text={t("SelectFile")}
          width={width + widthDimension.label}
          height={height + heightDimension.label}
        />
      )}
    </Frame>
  );

  const code = (
    <CodeWrapper>
      <CategorySubHeader className="copy-window-code">{t("CopyWindowCode")}</CategorySubHeader>
      <Textarea value={codeBlock} heightTextArea={153} />
    </CodeWrapper>
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
    <SDKContainer>
      <CategoryDescription>
        <Text className="sdk-description">{t("ViewerPresetDescription")}</Text>
      </CategoryDescription>
      <CategoryHeader>{t("CreateSampleHeader")}</CategoryHeader>
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
                />
              </FilesSelectorInputWrapper>
            </ControlsGroup>
          </ControlsSection>

          <ControlsSection>
            <CategorySubHeader>{t("CustomizingDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <Label className="label" text={t("EmbeddingPanel:Width")} />
              <RowContainer combo>
                <TextInput
                  onChange={onChangeWidth}
                  placeholder={t("EnterWidth")}
                  value={width}
                  tabIndex={2}
                />
                <ComboBox
                  size="content"
                  scaled={false}
                  scaledOptions={true}
                  onSelect={onChangeWidthDimension}
                  options={dataDimensions}
                  selectedOption={widthDimension}
                  displaySelectedOption
                  directionY="bottom"
                />
              </RowContainer>
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("EmbeddingPanel:Height")} />
              <RowContainer combo>
                <TextInput
                  onChange={onChangeHeight}
                  placeholder={t("EnterHeight")}
                  value={height}
                  tabIndex={3}
                />
                <ComboBox
                  size="content"
                  scaled={false}
                  scaledOptions={true}
                  onSelect={onChangeHeightDimension}
                  options={dataDimensions}
                  selectedOption={heightDimension}
                  displaySelectedOption
                  directionY="bottom"
                />
              </RowContainer>
            </ControlsGroup>
            <ControlsGroup>
              <Label className="label" text={t("FrameId")} />
              <TextInput
                scale={true}
                onChange={onChangeFrameId}
                placeholder={t("EnterId")}
                value={config.frameId}
                tabIndex={4}
              />
            </ControlsGroup>
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
    </SDKContainer>
  );
};

export default inject(({ authStore, settingsStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme } = settingsStore;

  return {
    theme,
    setDocumentTitle,
  };
})(
  withTranslation(["JavascriptSdk", "Files", "EmbeddingPanel", "Common", "CreateEditRoomDialog"])(
    observer(Viewer),
  ),
);
