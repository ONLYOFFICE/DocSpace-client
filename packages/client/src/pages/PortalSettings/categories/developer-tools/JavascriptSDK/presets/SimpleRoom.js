import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { Textarea } from "@docspace/shared/components/textarea";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import RoomsSelectorInput from "SRC_DIR/components/RoomsSelectorInput";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";

import { isTablet, isMobile } from "@docspace/shared/utils/device";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Checkbox } from "@docspace/shared/components/checkbox";

import GetCodeDialog from "../sub-components/GetCodeDialog";
import { Button } from "@docspace/shared/components/button";

import EmptyIframeContainer from "../sub-components/EmptyIframeContainer";
import CodeBlock from "../sub-components/CodeBlock";

import { TooltipContent } from "../sub-components/TooltipContent";
import { useNavigate } from "react-router-dom";
import { Link } from "@docspace/shared/components/link";
import FilesFilter from "@docspace/shared/api/files/filter";

import { RoomsType } from "@docspace/shared/enums";

import TitleUrl from "PUBLIC_DIR/images/sdk-presets_title.react.svg?url";
import SearchUrl from "PUBLIC_DIR/images/sdk-presets_search.react.svg?url";

import TitleDarkUrl from "PUBLIC_DIR/images/sdk-presets_title_dark.react.svg?url";
import SearchDarkUrl from "PUBLIC_DIR/images/sdk-presets_search_dark.react.svg?url";

const showPreviewThreshold = 720;

import {
  SDKContainer,
  Controls,
  CategoryHeader,
  CategorySubHeader,
  CategoryDescription,
  ControlsGroup,
  LabelGroup,
  Frame,
  Container,
  RowContainer,
  Preview,
  GetCodeButtonWrapper,
  FilesSelectorInputWrapper,
  ControlsSection,
  CodeWrapper,
  CheckboxGroup,
} from "./StyledPresets";

const SimpleRoom = (props) => {
  const { t, setDocumentTitle, fetchExternalLinks, currentColorScheme } = props;
  const navigate = useNavigate();

  setDocumentTitle(t("JavascriptSdk"));

  const scriptUrl = `${window.location.origin}/static/scripts/api.js`;

  const dataDimensions = [
    { key: "percent", label: "%", default: true },
    { key: "pixel", label: "px" },
  ];

  const settingsTranslations = {
    password: t("Common:Password").toLowerCase(),
    denyDownload: t("FileContentCopy").toLowerCase(),
    expirationDate: t("LimitByTime").toLowerCase(),
  };

  const [widthDimension, setWidthDimension] = useState(dataDimensions[0]);
  const [heightDimension, setHeightDimension] = useState(dataDimensions[0]);
  const [width, setWidth] = useState("100");
  const [height, setHeight] = useState("100");
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const [sharedLinks, setSharedLinks] = useState(null);

  const [selectedLink, setSelectedLink] = useState(null);

  const [config, setConfig] = useState({
    mode: "manager",
    width: `${width}${widthDimension.label}`,
    height: `${height}${heightDimension.label}`,
    frameId: "ds-frame",
    showHeader: false,
    showTitle: true,
    showMenu: false,
    showFilter: true,
    disableActionButton: false,
    infoPanelVisible: false,
    init: false,
    filter: {
      count: 100,
      page: 1,
      sortorder: "descending",
      sortby: "DateAndTime",
      search: "",
      withSubfolders: false,
    },
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
    const scroll = document.getElementsByClassName("section-scroll")[0];
    if (scroll) {
      scroll.scrollTop = 0;
    }
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

  const onChangeFolderId = async (rooms) => {
    const publicRoom = rooms[0];

    let newConfig = {
      id: publicRoom.id,
      requestToken: null,
      rootPath: "/rooms/shared/",
    };

    const links = await fetchExternalLinks(publicRoom.id);

    if (links.length > 1) {
      const linksOptions = links.map((link) => {
        const { id, title, requestToken } = link.sharedTo;
        const linkSettings = [];

        if ("password" in link.sharedTo) {
          linkSettings.push("password");
        }
        if ("expirationDate" in link.sharedTo) {
          linkSettings.push("expirationDate");
        }
        if (link.sharedTo.denyDownload) {
          linkSettings.push("denyDownload");
        }

        return {
          key: id,
          label: title,
          requestToken: requestToken,
          settings: linkSettings,
        };
      });

      setSelectedLink(linksOptions[0]);
      setSharedLinks(linksOptions);
    }

    newConfig.requestToken = links[0].sharedTo?.requestToken;
    newConfig.rootPath = "/rooms/share";

    setConfig((config) => {
      return { ...config, ...newConfig, init: true };
    });
  };

  const onChangeSharedLink = (link) => {
    setSelectedLink(link);
    setConfig((config) => {
      return { ...config, requestToken: link.requestToken };
    });
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

  const onChangeShowTitle = () => {
    setConfig((config) => {
      return { ...config, showTitle: !config.showTitle };
    });
  };

  const onChangeShowFilter = (e) => {
    setConfig((config) => {
      return { ...config, showFilter: !config.showFilter };
    });
  };

  const openGetCodeModal = () => setIsGetCodeDialogOpened(true);

  const closeGetCodeModal = () => setIsGetCodeDialogOpened(false);

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview)
      setShowPreview(isEnoughWidthForPreview);
  };

  const navigateRoom = (id) => {
    const filter = FilesFilter.getDefault();
    filter.folder = id;
    navigate(`/rooms/shared/${id}/filter?${filter.toUrlParams()}`);
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
        config.id !== undefined && widthDimension.label === "px"
          ? width + widthDimension.label
          : undefined
      }
      height={
        config.id !== undefined && heightDimension.label === "px"
          ? height + heightDimension.label
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
          text={t("RoomPreview")}
          width="100%"
          height="100%"
        />
      )}
    </Frame>
  );

  const code = (
    <CodeWrapper>
      <CategorySubHeader className="copy-window-code">
        {t("CopyWindowCode")}
      </CategorySubHeader>
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
      key: "js",
      title: "JavaScript",
      content: <CodeBlock config={config} />,
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
        <Text className="sdk-description">{t("PublicRoomDescription")}</Text>
      </CategoryDescription>
      <CategoryHeader>{t("CreateSamplePublicRoom")}</CategoryHeader>
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
            <CategorySubHeader>{t("DataDisplay")}</CategorySubHeader>
            <ControlsGroup>
              <LabelGroup>
                <Label className="label" text={t("Common:Room")} />
                <HelpButton
                  offsetRight={0}
                  size={12}
                  tooltipContent={
                    <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                  }
                />
              </LabelGroup>
              <FilesSelectorInputWrapper>
                <RoomsSelectorInput
                  roomType={RoomsType.PublicRoom}
                  withSearch
                  withCancelButton
                  onSubmit={onChangeFolderId}
                  withHeader
                  headerProps={{ headerLabel: t("Common:SelectAction") }}
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
                      <Text fontSize="12px">
                        {t("CreateEditRoomDialog:PublicRoomDescription")}
                      </Text>
                    }
                  />
                </LabelGroup>
                <ComboBox
                  scaled={true}
                  onSelect={onChangeSharedLink}
                  options={sharedLinks}
                  selectedOption={selectedLink}
                  displaySelectedOption
                  directionY="bottom"
                />
                {selectedLink && selectedLink.settings.length === 1 ? (
                  <div>
                    <Text
                      className="linkHelp"
                      fontSize="12px"
                      lineHeight="16px"
                    >
                      {t("LinkSettings", {
                        parameter:
                          settingsTranslations[selectedLink.settings[0]],
                      })}
                    </Text>
                    <Link
                      color={currentColorScheme?.main?.accent}
                      fontSize="12px"
                      lineHeight="16px"
                      onClick={() => navigateRoom(config.id)}
                    >
                      {" "}
                      {t("GoToRoom")}.
                    </Link>
                  </div>
                ) : selectedLink.settings.length === 2 ? (
                  <div>
                    <Text
                      className="linkHelp"
                      fontSize="12px"
                      lineHeight="16px"
                    >
                      {t("LinkSettings2", {
                        parameter1:
                          settingsTranslations[selectedLink.settings[0]],
                        parameter2:
                          settingsTranslations[selectedLink.settings[1]],
                      })}
                    </Text>
                    <Link
                      color={currentColorScheme?.main?.accent}
                      fontSize="12px"
                      lineHeight="16px"
                      onClick={() => navigateRoom(config.id)}
                    >
                      {" "}
                      {t("GoToRoom")}.
                    </Link>
                  </div>
                ) : selectedLink.settings.length === 3 ? (
                  <div>
                    <Text
                      className="linkHelp"
                      fontSize="12px"
                      lineHeight="16px"
                    >
                      {t("LinkSettings3", {
                        parameter1:
                          settingsTranslations[selectedLink.settings[0]],
                        parameter2:
                          settingsTranslations[selectedLink.settings[1]],
                        parameter3:
                          settingsTranslations[selectedLink.settings[2]],
                      })}
                    </Text>
                    <Link
                      color={currentColorScheme?.main?.accent}
                      fontSize="12px"
                      lineHeight="16px"
                      onClick={() => navigateRoom(config.id)}
                    >
                      {" "}
                      {t("GoToRoom")}.
                    </Link>
                  </div>
                ) : (
                  <></>
                )}
              </ControlsGroup>
            )}
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

          <ControlsSection>
            <CategorySubHeader>{t("InterfaceElements")}</CategorySubHeader>

            <CheckboxGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("Common:Title")}
                  onChange={onChangeShowTitle}
                  isChecked={config.showTitle}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("Common:Title")}
                      description={t("ManagerTitleDescription")}
                      img={theme.isBase ? TitleUrl : TitleDarkUrl}
                    />
                  }
                />
              </LabelGroup>
              <LabelGroup>
                <Checkbox
                  className="checkbox"
                  label={t("SearchFilterAndSort")}
                  onChange={onChangeShowFilter}
                  isChecked={config.showFilter}
                />
                <HelpButton
                  place="right"
                  offsetRight={4}
                  size={12}
                  tooltipContent={
                    <TooltipContent
                      title={t("SearchBlock")}
                      description={t("ManagerSearchBlockDescription")}
                      img={theme.isBase ? SearchUrl : SearchDarkUrl}
                    />
                  }
                />
              </LabelGroup>
            </CheckboxGroup>
          </ControlsSection>
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
  const { theme, currentColorScheme } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
    setDocumentTitle,
    fetchExternalLinks,
    currentColorScheme,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "Files",
    "Translations",
    "SharingPanel",
  ])(observer(SimpleRoom)),
);
