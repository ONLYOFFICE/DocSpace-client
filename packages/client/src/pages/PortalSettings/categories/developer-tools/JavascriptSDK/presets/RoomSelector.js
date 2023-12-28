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
import RadioButtonGroup from "@docspace/components/radio-button-group";
import { objectToGetParams, loadScript } from "@docspace/common/utils";
import { inject, observer } from "mobx-react";

import { isTablet, isMobile } from "@docspace/components/utils/device";

import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

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
  InterfaceElements,
  Frame,
  Container,
  RowContainer,
  Preview,
  GetCodeButtonWrapper,
} from "./StyledPresets";

const RoomSelector = (props) => {
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

  const roomTypeOptions = [
    { key: "room-type-all", label: t("AllTypes"), default: true },
    {
      key: "room-type-collaboration",
      label: t("CreateEditRoomDialog:CollaborationRoomTitle"),
    },
    { key: "room-type-public", label: t("Files:PublicRoom") },
    { key: "room-type-custom", label: t("CreateEditRoomDialog:CustomRoomTitle") },
  ];

  const [widthDimension, setWidthDimension] = useState(dataDimensions[1]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[1]);
  const [width, setWidth] = useState("600");
  const [height, setHeight] = useState(isTablet() ? "400" : isMobile() ? "206" : "778");
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(window.innerWidth > showPreviewThreshold);
  const [selectedElementType, setSelectedElementType] = useState(elementDisplayOptions[0].value);
  const [roomType, setRoomType] = useState(roomTypeOptions[0]);

  const [config, setConfig] = useState({
    mode: "room-selector",
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

  const changeRoomType = (option) => {
    setRoomType(option);
  };

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

  const onChangeFrameId = (e) => {
    setConfig((config) => {
      return { ...config, frameId: e.target.value };
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
    <Frame width={width} height={width} targetId={frameId}>
      <Box id={frameId}></Box>
      <RectangleSkeleton width={width} height={height} borderRadius="6px" />
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
        <Text className="sdk-description">{t("RoomSelectorDescription")}</Text>
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
          <CategorySubHeader>{t("AdvancedDisplay")}</CategorySubHeader>

          <Label className="label" text={t("RoomTypeDisplay")} />
          <ComboBox
            onSelect={changeRoomType}
            options={roomTypeOptions}
            scaled={true}
            selectedOption={roomType}
            displaySelectedOption
            directionY="top"
          />
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
  withTranslation(["JavascriptSdk", "Files", "EmbeddingPanel", "Common", "CreateEditRoomDialog"])(
    observer(RoomSelector),
  ),
);
