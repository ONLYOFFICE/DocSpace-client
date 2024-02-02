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
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { SelectedItem } from "@docspace/shared/components/selected-item";
import { ColorInput } from "@docspace/shared/components/color-input";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";

import { isTablet, isMobile } from "@docspace/shared/utils/device";

import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { HelpButton } from "@docspace/shared/components/help-button";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import { Button } from "@docspace/shared/components/button";

import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { TooltipContent } from "../sub-components/TooltipContent";

import SubtitleUrl from "PUBLIC_DIR/images/sdk-presets_subtitle.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_files-search.react.svg?url";

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
  SelectedItemsContainer,
} from "./StyledPresets";

const FileSelector = (props) => {
  const { t, setDocumentTitle, fetchExternalLinks } = props;

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
    { value: FilesSelectorFilterTypes.ALL, label: t("AllTypes") },
    { value: "custom-types", label: t("SelectTypes") },
  ];

  const [fileOptions, setFileOptions] = useState([
    { key: FilesSelectorFilterTypes.DOCX, label: FilesSelectorFilterTypes.DOCX },
    { key: FilesSelectorFilterTypes.IMG, label: FilesSelectorFilterTypes.IMG },
    { key: FilesSelectorFilterTypes.BackupOnly, label: FilesSelectorFilterTypes.BackupOnly },
    { key: FilesSelectorFilterTypes.DOCXF, label: FilesSelectorFilterTypes.DOCXF },
    { key: FilesSelectorFilterTypes.XLSX, label: FilesSelectorFilterTypes.XLSX },
  ]);

  const [widthDimension, setWidthDimension] = useState(dataDimensions[1]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[1]);
  const [width, setWidth] = useState("600");
  const [height, setHeight] = useState(isTablet() ? "400" : isMobile() ? "206" : "778");
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(window.innerWidth > showPreviewThreshold);
  const [sharedLinks, setSharedLinks] = useState(null);
  const [selectedElementType, setSelectedElementType] = useState(elementDisplayOptions[0].value);
  const [typeDisplay, setTypeDisplay] = useState(fileTypeDisplay[0].value);
  const [selectedType, setSelectedType] = useState(fileOptions[0]);
  const [selectedFileTypes, setSelectedFileTypes] = useState([
    { key: "file-type-documents", label: t("Common:Documents") },
    { key: "file-type-folders", label: t("Translations:Folders") },
    { key: "file-type-spreadsheets", label: t("Translations:Spreadsheets") },
    { key: "file-type-archives", label: t("Files:Archives") },
    { key: "file-type-presentations", label: t("Translations:Presentations") },
    { key: "file-type-images", label: t("Filse:Images") },
    { key: "file-type-media", label: t("Files:Media") },
    { key: "file-type-forms-templates", label: t("Files:FormsTemplates") },
    { key: "file-type-forms", label: t("Files:Forms") },
  ]);

  const [config, setConfig] = useState({
    mode: "file-selector",
    width: `${width}${widthDimension.label}`,
    height: `${height}${heightDimension.label}`,
    frameId: "ds-frame",
    init: true,
    showSelectorCancel: true,
    showSelectorHeader: true,
    withSearch: true,
    acceptButtonLabel: t("Common:SelectAction"),
    cancelButtonLabel: t("Common:CancelButton"),
    // withBreadCrumbs: true,
    withSubtitle: true,
    filterParam: FilesSelectorFilterTypes.ALL,
    isButtonMode: false,
    buttonWithLogo: true,
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

  const toggleButtonMode = (e) => {
    setSelectedElementType(e.target.value);
    setConfig((config) => ({ ...config, isButtonMode: e.target.value === "button" }));
  };

  const onChangeTab = (tab) => {
    if (tab.key === "preview" && selectedElementType === "button") {
      setConfig((config) => ({ ...config, isButtonMode: true }));
    } else if (tab.key === "selector-preview") {
      setConfig((config) => ({ ...config, isButtonMode: false }));
    } else if (tab.key === "code") {
      setConfig((config) => ({ ...config, isButtonMode: selectedElementType === "button" }));
    }
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

  const onChangeFrameId = (e) => {
    setConfig((config) => {
      return { ...config, frameId: e.target.value };
    });
  };

  const changeColumnsOption = (e) => {
    setTypeDisplay(e.target.value);
    setConfig((config) => {
      return {
        ...config,
        filterParam:
          e.target.value === FilesSelectorFilterTypes.ALL
            ? FilesSelectorFilterTypes.ALL
            : selectedType,
      };
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

  const onTypeSelect = (option) => {
    // setFileOptions((prevFileOptions) => prevFileOptions.filter((file) => file.key !== option.key));
    setSelectedType(option);
    setConfig((config) => {
      return { ...config, filterParam: option.key };
    });

    // if (!selectedFileTypes.find((type) => type.key === option.key)) {
    //   setSelectedFileTypes((prevFileTypes) => [...prevFileTypes, option]);
    // }
  };

  const deleteSelectedType = (option) => {
    setFileOptions((prevFileOptions) => [option, ...prevFileOptions]);
    const filteredTypes = selectedFileTypes.filter((type) => type.key !== option.key);
    setSelectedFileTypes(filteredTypes);
  };

  const toggleWithSearch = () => {
    setConfig((config) => ({ ...config, withSearch: !config.withSearch }));
  };

  // const toggleBreadCrumbs = () => {
  //   setConfig((config) => ({ ...config, withBreadCrumbs: !config.withBreadCrumbs }));
  // };

  const toggleWithSubtitle = () => {
    setConfig((config) => ({ ...config, withSubtitle: !config.withSubtitle }));
  };

  const onChangeAcceptLabel = (e) => {
    setConfig((config) => {
      return { ...config, acceptButtonLabel: e.target.value };
    });
  };

  const onChangeCancelLabel = (e) => {
    setConfig((config) => {
      return { ...config, cancelButtonLabel: e.target.value };
    });
  };

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview) setShowPreview(isEnoughWidthForPreview);
  };

  const setButtonColor = (color) => {
    setConfig((config) => ({ ...config, buttonColor: color }));
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
      <Box id={frameId}></Box>
    </Frame>
  );

  const code = (
    <>
      <CategorySubHeader className="copy-window-code">{t("CopyWindowCode")}</CategorySubHeader>
      <Textarea value={codeBlock} heightTextArea={153} />
    </>
  );

  const dataTabs =
    selectedElementType === "element"
      ? [
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
        ]
      : [
          {
            key: "preview",
            title: t("Common:Preview"),
            content: preview,
          },
          {
            key: "selector-preview",
            title: t("SelectorPreview"),
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
            <TabsContainer onSelect={onChangeTab} elements={dataTabs} />
          </Preview>
        )}
        <Controls>
          <CategorySubHeader>{t("MainElementParameter")}</CategorySubHeader>
          <RadioButtonGroup
            orientation="vertical"
            options={elementDisplayOptions}
            name="elementDisplayInput"
            selected={selectedElementType}
            onClick={toggleButtonMode}
            spacing="8px"
          />
          {config.isButtonMode && (
            <>
              <CategorySubHeader>{t("ButtonCustomization")}</CategorySubHeader>
              <ControlsGroup>
                <Label className="label" text={t("ButtonColor")} />
                <ColorInput scale handleChange={setButtonColor} defaultColor={"#5299E0"} />
              </ControlsGroup>
              <ControlsGroup>
                <Label className="label" text={t("ButtonText")} />
                <TextInput
                  scale
                  onChange={(e) => {
                    setConfig((config) => ({ ...config, buttonText: e.target.value }));
                  }}
                  placeholder={t("SelectToDocSpace")}
                  value={config.buttonText}
                  tabIndex={3}
                />
                <Checkbox
                  className="checkbox"
                  label={"Logo"}
                  onChange={() => {
                    setConfig((config) => ({ ...config, buttonWithLogo: !config.buttonWithLogo }));
                  }}
                  isChecked={config.buttonWithLogo}
                />
              </ControlsGroup>
            </>
          )}
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
            {/* <Checkbox
              className="checkbox"
              label={t("Common:Title")}
              onChange={toggleBreadCrumbs}
              isChecked={config.withBreadCrumbs}
            /> */}

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
                    img={SubtitleUrl}
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
                    img={SearchUrl}
                  />
                }
              />
            </LabelGroup>
            <Label className="label" text={t("SelectButtonText")} />
            <TextInput
              scale={true}
              onChange={onChangeAcceptLabel}
              placeholder={t("Common:SelectAction")}
              value={config.acceptButtonLabel}
              tabIndex={4}
            />
            <Label className="label" text={t("CancelButtonText")} />
            <TextInput
              scale={true}
              onChange={onChangeCancelLabel}
              placeholder={t("Common:CancelButton")}
              value={config.cancelButtonLabel}
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
          {sharedLinks && (
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("SharingPanel:ExternalLink")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("CreateEditRoomDialog:PublicRoomDescription")}</Text>
                  }
                />
              </LabelGroup>
              <ComboBox
                scaled={true}
                onSelect={onChangeSharedLink}
                options={sharedLinks}
                selectedOption={sharedLinks[0]}
                displaySelectedOption
                directionY="bottom"
              />
            </ControlsGroup>
          )}
          <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>
          <ControlsGroup>
            <Label className="label" text={t("FileTypeDisplay")} />
            <RadioButtonGroup
              orientation="vertical"
              options={fileTypeDisplay}
              name="columnsDisplayOptions"
              selected={typeDisplay}
              onClick={changeColumnsOption}
              spacing="8px"
            />
            {typeDisplay === "custom-types" && (
              <>
                <ComboBox
                  onSelect={onTypeSelect}
                  options={
                    fileOptions || {
                      key: "Select",
                      label: t("Common:SelectAction"),
                    }
                  }
                  scaled={true}
                  directionY="top"
                  selectedOption={selectedType}
                  // selectedOption={{
                  //   key: "Select",
                  //   label: t("Common:SelectAction"),
                  // }}
                />

                {/* <SelectedItemsContainer>
                  {selectedFileTypes.map((type) => (
                    <SelectedItem
                      key={type.key}
                      onClick={() => deleteSelectedType(type)}
                      label={type.label}
                    />
                  ))}
                </SelectedItemsContainer> */}
              </>
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

export default inject(({ authStore, settingsStore, publicRoomStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
    setDocumentTitle,
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
