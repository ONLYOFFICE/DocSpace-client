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
import { objectToGetParams, loadScript } from "@docspace/common/utils";
import { inject, observer } from "mobx-react";

import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import HelpButton from "@docspace/components/help-button";
import Link from "@docspace/components/link";

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
  ColumnContainer,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
} from "./StyledPresets";

const RoomSelector = (props) => {
  const { t, setDocumentTitle, currentColorScheme, sdkLink } = props;

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;

  const dataSortBy = [
    { key: "DateAndTime", label: t("Common:LastModifiedDate"), default: true },
    { key: "AZ", label: t("Common:Title") },
    { key: "Type", label: t("Common:Type") },
    { key: "Size", label: t("Common:Size") },
    { key: "DateAndTimeCreation", label: t("Files:ByCreation") },
    { key: "Author", label: t("Files:ByAuthor") },
  ];

  const dataSortOrder = [
    { key: "descending", label: t("Descending"), default: true },
    { key: "ascending", label: t("Ascending") },
  ];

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const [sortBy, setSortBy] = useState(dataSortBy[0]);
  const [sortOrder, setSortOrder] = useState(dataSortOrder[0]);
  const [widthDimension, setWidthDimension] = useState(dataDimensions[0]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[1]);
  const [width, setWidth] = useState("100");
  const [height, setHeight] = useState("600");
  const [withSubfolders, setWithSubfolders] = useState(true);
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(window.innerWidth > showPreviewThreshold);

  const [config, setConfig] = useState({
    width: `${width}${widthDimension.label}`,
    height: `${height}${heightDimension.label}`,
    frameId: "ds-frame",
    showHeader: true,
    showTitle: true,
    showMenu: true,
    showFilter: true,
    init: true,
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

  const onChangeWithSubfolders = (e) => {
    setConfig((config) => {
      return { ...config, withSubfolders: !withSubfolders };
    });

    setWithSubfolders(!withSubfolders);
  };

  const onChangeSortBy = (item) => {
    setConfig((config) => {
      return { ...config, sortby: item.key };
    });

    setSortBy(item);
  };

  const onChangeSortOrder = (item) => {
    setConfig((config) => {
      return { ...config, sortorder: item.key };
    });

    setSortOrder(item);
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

  const onChangeShowHeader = (e) => {
    setConfig((config) => {
      return { ...config, showHeader: !config.showHeader };
    });
  };

  const onChangeShowTitle = () => {
    setConfig((config) => {
      return { ...config, showTitle: !config.showTitle };
    });
  };

  const onChangeShowMenu = (e) => {
    setConfig((config) => {
      return { ...config, showMenu: !config.showMenu };
    });
  };

  const onChangeShowFilter = (e) => {
    setConfig((config) => {
      return { ...config, showFilter: !config.showFilter };
    });
  };

  const onChangeCount = (e) => {
    setConfig((config) => {
      return { ...config, count: e.target.value };
    });
  };

  const onChangePage = (e) => {
    setConfig((config) => {
      return { ...config, page: e.target.value };
    });
  };

  const onChangeSearch = (e) => {
    setConfig((config) => {
      return { ...config, search: e.target.value };
    });
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
        <Text className="sdk-description">{t("SDKDescription")}</Text>
        <Link
          color={currentColorScheme?.main?.accent}
          fontSize="12px"
          fontWeight="400"
          onClick={() => window.open(sdkLink, "_blank")}>
          {t("APILink")}.
        </Link>
      </CategoryDescription>
      <CategoryHeader>{t("CreateSampleHeader")}</CategoryHeader>
      <Container>
        {showPreview && (
          <Preview>
            <TabContainer onSelect={onChangeTab} elements={dataTabs} />
          </Preview>
        )}
        <Controls>
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
              label={t("Menu")}
              onChange={onChangeShowMenu}
              isChecked={config.showMenu}
            />
            <Checkbox
              className="checkbox"
              label={t("Header")}
              onChange={onChangeShowHeader}
              isChecked={config.showHeader}
            />
            <Checkbox
              className="checkbox"
              label={t("Filter")}
              onChange={onChangeShowFilter}
              isChecked={config.showFilter}
            />
            <RowContainer>
              <Checkbox
                label={t("Title")}
                onChange={onChangeShowTitle}
                isChecked={config.showTitle}
              />
              <Text color="gray">{`(${t("MobileOnly")})`}</Text>
            </RowContainer>
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
            <Label className="label" text={t("SearchTerm")} />
            <ColumnContainer>
              <TextInput
                scale={true}
                onChange={onChangeSearch}
                placeholder={t("Common:Search")}
                value={config.search}
                tabIndex={5}
              />
              <Checkbox
                className="checkbox"
                label={t("Files:WithSubfolders")}
                onChange={onChangeWithSubfolders}
                isChecked={withSubfolders}
              />
            </ColumnContainer>
          </ControlsGroup>
          <ControlsGroup>
            <Label className="label" text={t("Common:SortBy")} />
            <ComboBox
              onSelect={onChangeSortBy}
              options={dataSortBy}
              scaled={true}
              selectedOption={sortBy}
              displaySelectedOption
              directionY="top"
            />
          </ControlsGroup>
          <ControlsGroup>
            <Label className="label" text={t("SortOrder")} />
            <ComboBox
              onSelect={onChangeSortOrder}
              options={dataSortOrder}
              scaled={true}
              selectedOption={sortOrder}
              displaySelectedOption
              directionY="top"
            />
          </ControlsGroup>
          <ControlsGroup>
            <LabelGroup>
              <Label className="label" text={t("ItemsCount")} />
              <HelpButton
                offsetRight={0}
                size={12}
                tooltipContent={<Text fontSize="12px">{t("ItemsCountDescription")}</Text>}
              />
            </LabelGroup>
            <TextInput
              scale={true}
              onChange={onChangeCount}
              placeholder={t("EnterCount")}
              value={config.count}
              tabIndex={6}
            />
          </ControlsGroup>
          <ControlsGroup>
            <Label className="label" text={t("Page")} />
            <TextInput
              scale={true}
              onChange={onChangePage}
              placeholder={t("EnterPage")}
              value={config.page}
              isDisabled={!config.count}
              tabIndex={7}
            />
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
  const { theme, currentColorScheme, sdkLink } = settingsStore;

  return {
    theme,
    setDocumentTitle,
    currentColorScheme,
    sdkLink,
  };
})(withTranslation(["JavascriptSdk", "Files", "EmbeddingPanel", "Common"])(observer(RoomSelector)));
