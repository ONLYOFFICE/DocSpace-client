import { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import styled, { css } from "styled-components";
import { Box } from "@docspace/shared/components/box";
import { TextInput } from "@docspace/shared/components/text-input";
import { Textarea } from "@docspace/shared/components/textarea";
import { Label } from "@docspace/shared/components/label";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { mobile, tablet } from "@docspace/shared/utils";
import { objectToGetParams, loadScript } from "@docspace/shared/utils/common";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

import { HelpButton } from "@docspace/shared/components/help-button";
import { Link } from "@docspace/shared/components/link";

import GetCodeDialog from "./sub-components/GetCodeDialog";
import CSP from "./sub-components/csp";
import { Button } from "@docspace/shared/components/button";

const showPreviewThreshold = 720;

const SDKContainer = styled(Box)`
  @media ${tablet} {
    width: 100%;
  }

  ${isMobile &&
  css`
    width: 100%;
  `}
`;

const Controls = styled(Box)`
  max-width: 350px;
  min-width: 350px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media ${tablet} {
    min-width: 0;
  }

  ${isMobile &&
  css`
    min-width: 0;
  `}

  .label {
    min-width: fit-content;
  }

  .checkbox {
    max-width: fit-content;
  }
`;

const CategoryHeader = styled.div`
  margin-top: 40px;
  margin-bottom: 24px;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  font-style: normal;
  font-weight: 700;
  line-height: 22px;

  @media ${tablet} {
    margin-top: 24px;
  }

  ${isMobile &&
  css`
    margin-top: 24px;
  `}
`;

const CategorySubHeader = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: ${(props) => props.theme.getCorrectFontSize("15px")};
  font-style: normal;
  font-weight: 600;
  line-height: 16px;

  @media ${tablet} {
    &:not(&.copy-window-code) {
      margin-bottom: 0;
    }
  }

  ${isMobile &&
  css`
    &:not(&.copy-window-code) {
      margin-bottom: 0;
    }
  `}

  @media ${mobile} {
    &:first-of-type {
      margin-top: 0;
    }
  }
`;

const CategoryDescription = styled(Box)`
  margin-top: 5px;
  max-width: 700px;
  .sdk-description {
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }
`;

const ControlsGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media ${tablet} {
    gap: 4px;
  }

  ${isMobile &&
  css`
    gap: 4px;
  `}
`;

const LabelGroup = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const InterfaceElements = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const Frame = styled(Box)`
  margin-top: 16px;
  position: relative;

  border-radius: 6px;
  border: 1px solid #d0d5da;

  width: ${(props) => (props.width ? props.width : "100%")};
  height: ${(props) => (props.height ? props.height : "400px")};

  @media ${tablet} {
    margin-top: 4px;
  }

  ${(props) =>
    props.targetId &&
    `
    #${props.targetId} {
      border-radius: 6px;
    }
  `}

  ${isMobile &&
  css`
    margin-top: 4px;
  `}
`;

const Container = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 16px;

  @media ${tablet} {
    flex-direction: column;
  }

  ${isMobile &&
  css`
    flex-direction: column;
  `}
`;

const RowContainer = styled(Box)`
  flex-direction: row;
  display: flex;
  gap: 8px;

  ${(props) =>
    props.combo &&
    `
      height: 32px;
      align-items: center;
    `}
`;

const ColumnContainer = styled(Box)`
  flex-direction: column;
  display: flex;
  gap: 8px;
`;

const Preview = styled(Box)`
  width: 100%;
  margin-top: 24px;
  min-width: 660px;
  flex-direction: row;

  @media ${tablet} {
    margin-top: 0;
    min-width: 0;
  }
  ${isMobile &&
  css`
    margin-top: 0;
    min-width: 0;
  `}
`;

const GetCodeButtonWrapper = styled.div`
  padding-block: 30px;
  position: sticky;
  bottom: 0;
  margin-top: 32px;
  background-color: ${({ theme }) => theme.backgroundColor};

  @media ${mobile} {
    position: fixed;
    padding-inline: 16px;
    inset-inline: 0;
  }
`;

const FilesSelectorInputWrapper = styled.div`
  & > div {
    margin: 0;
  }
`;

const PortalIntegration = (props) => {
  const {
    t,
    setDocumentTitle,
    currentColorScheme,
    sdkLink,
    fetchExternalLinks,
  } = props;

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
  const [withSubfolders, setWithSubfolders] = useState(false);
  const [isGetCodeDialogOpened, setIsGetCodeDialogOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold
  );
  const [sharedLinks, setSharedLinks] = useState(null);

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

    loadScript(`${scriptUrl}${params}`, "integration", () =>
      window.DocSpace.SDK.initFrame(config)
    );
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
      width={width + widthDimension.label}
      height={height + heightDimension.label}
      targetId={frameId}
    >
      <Box id={frameId}></Box>
    </Frame>
  );

  const code = (
    <>
      <CategorySubHeader className="copy-window-code">
        {t("CopyWindowCode")}
      </CategorySubHeader>
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
          onClick={() => window.open(sdkLink, "_blank")}
        >
          {t("APILink")}.
        </Link>
        <CSP t={t} />
      </CategoryDescription>
      <CategoryHeader>{t("CreateSampleHeader")}</CategoryHeader>
      <Container>
        {showPreview && (
          <Preview>
            <TabsContainer onSelect={onChangeTab} elements={dataTabs} />
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
                tooltipContent={
                  <Text fontSize="12px">{t("RoomOrFolderDescription")}</Text>
                }
              />
            </LabelGroup>
            <FilesSelectorInputWrapper>
              <FilesSelectorInput onSelectFolder={onChangeFolderId} isSelect />
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
                selectedOption={sharedLinks[0]}
                displaySelectedOption
                directionY="bottom"
              />
            </ControlsGroup>
          )}
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
                tooltipContent={
                  <Text fontSize="12px">{t("ItemsCountDescription")}</Text>
                }
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

export default inject(({ settingsStore, authStore, publicRoomStore }) => {
  const { setDocumentTitle } = authStore;
  const { theme, currentColorScheme, sdkLink } = settingsStore;
  const { fetchExternalLinks } = publicRoomStore;

  return {
    theme,
    setDocumentTitle,
    currentColorScheme,
    sdkLink,
    fetchExternalLinks,
  };
})(
  withTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "CreateEditRoomDialog",
    "SharingPanel",
    "Common",
  ])(observer(PortalIntegration))
);
