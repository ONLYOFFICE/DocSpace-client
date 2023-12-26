import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import Box from "@docspace/components/box";
import TextInput from "@docspace/components/text-input";
import Textarea from "@docspace/components/textarea";
import Label from "@docspace/components/label";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import ComboBox from "@docspace/components/combobox";
import TabContainer from "@docspace/components/tabs-container";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import RadioButtonGroup from "@docspace/components/radio-button-group";
import { objectToGetParams, loadScript } from "@docspace/common/utils";
import { inject, observer } from "mobx-react";

import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import HelpButton from "@docspace/components/help-button";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import Button from "@docspace/components/button";

const showPreviewThreshold = 720;

import {
  SDKContainer,
  Controls,
  CategoryHeader,
  CategorySubHeader,
  CategoryDescription,
  ControlsGroup,
  LabelGroup,
  InterfaceElements,
  Frame,
  Container,
  RowContainer,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
} from "./StyledPresets";

const FileSelector = (props) => {
  const { t, setDocumentTitle } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const elementDisplayOptions = [
    { value: "element", label: t("ElementItself") },
    {
      value: "button",
      label: (
        <RowContainer>
          {t("Common:Button")}
          <Text color="gray">{`(${t("ElementCalledAfterClicking")})`}</Text>
        </RowContainer>
      ),
    },
  ];

  const fileTypeDisplay = [
    { value: "all-types", label: "All types" },
    { value: "custom-types", label: "Select types" },
  ];

  const fileOptions = [
    { key: "file-type-all", label: t("Files:AllFiles") },
    { key: "file-type-documents", label: t("Common:Documents") },
    { key: "file-type-folders", label: t("Translations:Folders") },
    { key: "file-type-spreadsheets", label: t("Translations:Spreadsheets") },
    { key: "file-type-archives", label: t("Files:Archives") },
    { key: "file-type-presentations", label: t("Translations:Presentations") },
    { key: "file-type-images", label: t("Filse:Images") },
    { key: "file-type-media", label: t("Files:Media") },
    { key: "file-type-forms-templates", label: t("Files:FormsTemplates") },
    { key: "file-type-forms", label: t("Files:Forms") },
  ];

  const [widthDimension, setWidthDimension] = useState(dataDimensions[0]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[1]);
  const [width, setWidth] = useState("100");
  const [height, setHeight] = useState("600");
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(window.innerWidth > showPreviewThreshold);
  const [selectedElementType, setSelectedElementType] = useState(elementDisplayOptions[0].value);
  const [typeDisplay, setTypeDisplay] = useState(fileTypeDisplay[0].value);
  const [selectedTypeOption, setSelectedTypeOption] = useState({
    key: "select",
    label: t("Common:SelectAction"),
  });

  const [config, setConfig] = useState({
    mode: "file-selector",
    width: `${width}${widthDimension.label}`,
    height: `${height}${heightDimension.label}`,
    frameId: "ds-frame",
    init: true,
    showSelectorCancel: true,
    showSelectorHeader: true,
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

  const onChangeFolderId = (id) => {
    setConfig((config) => {
      return { ...config, id };
    });
  };

  const onChangeFrameId = (e) => {
    setConfig((config) => {
      return { ...config, frameId: e.target.value };
    });
  };

  const changeColumnsOption = (e) => {
    setTypeDisplay(e.target.value);
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

  const onTypeSelect = (option) => {
    setSelectedTypeOption(option);
  };

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
    <Frame width={width} height={width} targetId={frameId}>
      <Box id={frameId}></Box>
      <RectangleSkeleton height={height} borderRadius="6px" />
    </Frame>
  );

  const code = (
    <>
      <CategorySubHeader className="copy-window-code">{t("CopyWindowCode")}</CategorySubHeader>
      <Textarea value={codeBlock} heightTextArea={153} />
    </>
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
        <Text className="sdk-description">{t("FileSelectorDescription")}</Text>
      </CategoryDescription>
      <CategoryHeader>{t("CreateSampleHeader")}</CategoryHeader>
      <Container>
        {showPreview && (
          <Preview>
            <TabContainer onSelect={onChangeTab} elements={dataTabs} />
          </Preview>
        )}
        <Controls>
          <CategorySubHeader>{t("MainElementParameter")}</CategorySubHeader>
          <RadioButtonGroup
            orientation="vertical"
            options={elementDisplayOptions}
            name="elementDisplayInput"
            selected={selectedElementType}
            onClick={() => {}}
          />
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
          <InterfaceElements>
            <Label className="label">{t("InterfaceElements")}</Label>
            <Checkbox
              className="checkbox"
              label={t("Common:Title")}
              onChange={() => {}}
              isChecked={true}
            />
            <Checkbox
              className="checkbox"
              label={t("Subtitle")}
              onChange={() => {}}
              isChecked={true}
            />
            <Checkbox
              className="checkbox"
              label={t("Common:Search")}
              onChange={() => {}}
              isChecked={true}
            />
            <Label className="label" text={t("SelectButtonText")} />
            <TextInput
              scale={true}
              onChange={() => {}}
              placeholder={t("Common:SelectAction")}
              value={t("Common:SelectAction")}
              tabIndex={4}
            />
            <Label className="label" text={t("CancelButtonText")} />
            <TextInput
              scale={true}
              onChange={() => {}}
              placeholder={t("Common:CancelButton")}
              value={t("Common:CancelButton")}
              tabIndex={4}
            />
          </InterfaceElements>
          <CategorySubHeader>{t("DataDisplay")}</CategorySubHeader>
          <ControlsGroup>
            <LabelGroup>
              <Label className="label" text={t("RoomOrFolder")} />
              <HelpButton
                offsetRight={0}
                size={12}
                tooltipContent={<Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>}
              />
            </LabelGroup>
            <FilesSelectorInputWrapper>
              <FilesSelectorInput onSelectFolder={onChangeFolderId} isSelect />
            </FilesSelectorInputWrapper>
          </ControlsGroup>
          <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>
          <ControlsGroup>
            <Label className="label" text={t("FileTypeDisplay")} />
            <RadioButtonGroup
              orientation="vertical"
              options={fileTypeDisplay}
              name="columnsDisplayOptions"
              selected={typeDisplay}
              onClick={changeColumnsOption}
            />
            {typeDisplay === "custom-types" && (
              <ComboBox
                onSelect={onTypeSelect}
                options={fileOptions}
                scaled={true}
                directionY="top"
                selectedOption={selectedTypeOption}
              />
            )}
          </ControlsGroup>
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

export default inject(({ auth }) => {
  const { settingsStore, setDocumentTitle } = auth;
  const { theme } = settingsStore;

  return {
    theme,
    setDocumentTitle,
  };
})(
  withTranslation(["JavascriptSdk", "Files", "EmbeddingPanel", "Common", "Translations"])(
    observer(FileSelector),
  ),
);
