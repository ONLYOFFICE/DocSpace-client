// (c) Copyright Ascensio System SIA 2009-2025
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
import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import styled, { css, withTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import { Flow } from "@docspace/shared/api/flows/flows.types";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Loader } from "@docspace/shared/components/loader";
import { Base } from "@docspace/shared/themes";
import { getRoomTitle } from "@docspace/shared/components/room-icon/RoomIcon.utils";
import TemplateRoomIcon from "PUBLIC_DIR/images/template-room-icon.react.svg?url";
import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
// import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";

const StyledFlowsContainer = withTheme(styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`);

const checkedStyle = css`
  background: ${({ theme }) =>
    theme.filesSection.tilesView.tile.roomsCheckedColor};
`;

const StyledFlowTile = styled.div`
  display: contents;

  .flow-tile-template_top-content {
    width: 100%;
    height: 66px;

    box-sizing: border-box;

    display: grid;
    grid-template-columns: 60px 1fr 40px;
    gap: 0px;

    justify-content: flex-start;
    align-items: center;
    align-content: center;

    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundColor};

    border-radius: ${({ theme }) =>
      theme.filesSection.tilesView.tile.upperBorderRadius};
  }

  .flow-tile-template_bottom-content {
    width: 100%;
    height: 60px;
    align-content: center;

    box-sizing: border-box;
    overflow: hidden;

    padding: 0px 16px 8px;
    background: ${(props) =>
      props.theme.filesSection.tilesView.tile.backgroundColor};
    border-radius: ${({ theme }) =>
      theme.filesSection.tilesView.tile.roomsBottomBorderRadius};

    .flow-tile_bottom-content-wrapper {
      display: grid;
      grid-template-columns: 1fr;
      /* gap: 14px; */

      .flow-tile_bottom-content_field {
        display: grid;
        grid-template-columns: 1fr 40px;
        overflow: hidden;
        gap: 8px;

        .flow-tile_bottom-content_chat {
          position: static;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
      }

      .flow-tile_bottom-content_field_no-chat {
        display: grid;
        grid-template-columns: 1fr;
        overflow: hidden;
        gap: 8px;
      }
    }
  }

  ${(props) =>
    props.isActive &&
    css`
      .flow-tile-template_top-content,
      .flow-tile-template_bottom-content {
        ${checkedStyle}
      }
    `}

  :hover {
    .flow-tile-template_top-content,
    .flow-tile-template_bottom-content {
      ${checkedStyle}
    }
  }
`;

const StyledContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 18px 18px;
  gap: 0px;
  width: 150px;

  overflow: hidden;
`;

const StyledElement = styled.div`
  flex: 0 0 auto;
  display: flex;
  margin-inline-start: 4px;
  user-select: none;
  margin-top: 3px;

  height: 32px;
  width: 32px;
`;

const StyledOptionButton = styled.div`
  display: block;

  .expandButton > div:first-child {
    padding: 8px 15px;
  }
`;

StyledOptionButton.defaultProps = { theme: Base };

const StyledTile = styled.div`
  height: 128px;

  cursor: pointer;

  ${(props) =>
    props.isBlockingOperation &&
    css`
      pointer-events: none;
      /* cursor: wait; */
    `}
  box-sizing: border-box;
  width: 100%;
  border: ${(props) => props.theme.filesSection.tilesView.tile.border};

  border-radius: ${({ isRooms, theme }) =>
    isRooms
      ? theme.filesSection.tilesView.tile.roomsBorderRadius
      : theme.filesSection.tilesView.tile.borderRadius};

  &:before,
  &:after {
    ${(props) => props.isActive && checkedStyle};
  }

  .flow-icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--room-icon-size);
    height: var(--room-icon-size);

    .flow-icon-svg {
      position: relative;
      width: var(--room-icon-size);
      height: var(--room-icon-size);

      svg {
        width: var(--room-icon-size);
        height: var(--room-icon-size);

        path {
          fill: var(--room-icon-color, var(--room-icon-button-color));
        }
      }
    }
  }

  .flow-title {
    font-size: 14px;
    font-weight: 700;
    line-height: 16px;

    color: var(--room-icon-color);
    position: absolute;

    transition: all 0.2s ease;
    opacity: 1;
    transform: translateY(0);
  }

  .flow-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .flow-icon {
    display: flex;
    flex: 0 0 auto;
    user-select: none;
  }

  .flow-icon_container {
    width: 32px;
    height: 32px;
    margin-inline-start: 16px;
    margin-inline-end: 8px;
  }

  .flow-flow-loader {
    padding-top: 12px;
    width: 32px;
    height: 32px;
    margin-inline: 21px 13px;
  }

  .tile-room {
    margin-inline: 21px 19px;
  }
`;

const FlowTileTemplate = (props) => {
  const {
    flow,
    getFolderById,
    isChatAvailable,
    isLoading,
    isRunning,
    contextButtonSpacerWidth,
    hideContextMenu,
    theme,
    onContextMenu,
    renderContext,
    contextMenuHeader,

    contextMenuTitle,
  } = props;
  const { t } = useTranslation(["Files", "Common"]);

  const cm = React.useRef();
  const tile = React.useRef();

  const { name, description, id, folder_id } = flow;

  const iconTitle = getRoomTitle(name);

  const onOpenContextMenu = (e) => {
    onContextMenu && onContextMenu(e);
    if (!cm.current.menuRef.current) tile?.current?.click(e); // TODO: need fix context menu to global
    cm?.current?.show(e);
  };

  const handleOpenFlow = (data: any) => {
    console.log("open", { data, flow });
    window.open(`/onlyflow/flow/${flow.id}`, "_blank");
  };

  //   const handleInfoClick = (data: any) => {
  //     console.log("info", { data, flow });
  //     const { setInfoPanelSelection, setIsVisible } = this.infoPanelStore;

  //     setInfoPanelSelection([selection]);
  //     setIsVisible(true);
  //   };

  //   const handleRunFlow = (data: any) => {
  //     console.log("run", { data, flow });
  //   };

  const getOptions = () => {
    // tileContextClick && tileContextClick();
    const contextOptions = [
      {
        id: "open",
        key: "open",
        icon: ExternalLinkIcon,
        label: t("Files:Open"),
        onClick: handleOpenFlow,
      },
      //   {
      //     id: "option_details",
      //     key: "info",
      //     icon: InfoOutlineReactSvgUrl,
      //     label: t("Common:Info"),
      //     onClick: handleInfoClick,
      //   },
      //   {
      //     id: "run",
      //     key: "Run flow",
      //     label: t("Run flow"),
      //     icon: RetryIcon,
      //     onClick: handleRunFlow,
      //   },
    ];

    return contextOptions;
  };

  const displayChat = isChatAvailable(flow);

  return (
    <StyledTile {...props} ref={tile}>
      <StyledFlowTile>
        <div className="flow-tile-template_top-content">
          {!isRunning ? (
            <div className="flow-icon_container">
              <StyledElement className="flow-icon">
                <div className="flow-icon-container">
                  <ReactSVG className="flow-icon-svg" src={TemplateRoomIcon} />
                  <Text
                    className="flow-title"
                    noSelect
                    data-testid="flow-title"
                  >
                    {iconTitle}
                  </Text>
                </div>
              </StyledElement>
            </div>
          ) : (
            <Loader
              className="flow-flow-loader"
              type="oval"
              size="16px"
              color="#333"
            />
          )}
          <StyledContent>
            <Link
              href={`/onlyflow/flow/${id}`}
              title={name}
              target={LinkTarget.blank}
              isBold
              type={LinkType.page}
              truncate
            >
              {name}
            </Link>
            <Text>
              {folder_id == "00000000-0000-0000-0000-000000000000"
                ? t("{SYSTEM}")
                : getFolderById(folder_id)?.name || t("{no folder}")}
            </Text>
          </StyledContent>
          <StyledOptionButton spacerWidth={contextButtonSpacerWidth}>
            {renderContext ? (
              <ContextMenuButton
                isFill
                className="expandButton"
                directionX="right"
                getData={getOptions}
                displayType="toggle"
                onClick={onOpenContextMenu}
                title={contextMenuTitle}
              />
            ) : (
              <div className="expandButton" />
            )}
            <ContextMenu
              onHide={hideContextMenu}
              getContextModel={getOptions}
              ref={cm}
              header={contextMenuHeader}
              withBackdrop
            />
          </StyledOptionButton>
        </div>
        <div className="flow-tile-template_bottom-content">
          <div className="flow-tile_bottom-content-wrapper">
            <div
              className={
                displayChat
                  ? "flow-tile_bottom-content_field"
                  : "flow-tile_bottom-content_field_no-chat"
              }
            >
              <div>
                <Text
                  fontSize="13px"
                  fontWeight={400}
                  color={theme.filesSection.tilesView.subTextColor}
                  className="flow-description"
                  title={description}
                >
                  {description}
                </Text>
              </div>
              {displayChat && (
                <div className="flow-tile_bottom-content_chat">
                  <langflow-chat
                    window_title={`Chat with flow '${name}'`}
                    flow_id={id}
                    host_url={`${window.location.origin}/onlyflow/`}
                    style={{ position: "absolute" }}
                  ></langflow-chat>
                </div>
              )}
            </div>
          </div>
        </div>
      </StyledFlowTile>
    </StyledTile>
  );
};

const FlowTile = withTheme(FlowTileTemplate);

const SectionBodyContent = ({
  autoLogin,
  flows,
  isLoading,
  fetchFlows,
  getFolderById,
  isChatAvailable,
}: {
  autoLogin: () => void;
  flows: Flow[];
  isLoading: boolean;
  fetchFlows: () => void;
  getFolderById: (id: string) => void;
  isChatAvailable: boolean;
}) => {
  useEffect(() => {
    autoLogin().then(() => fetchFlows());
  }, [autoLogin, fetchFlows]);

  const renderContext = true;
  // hasOwnProperty(item, "contextOptions") && contextOptions.length > 0;

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "20px" }}
      >
        <Loader size="18px" />
      </div>
    );
  }

  return (
    <StyledFlowsContainer>
      {flows.map((flow: Flow) => (
        <FlowTile
          key={flow.id}
          flow={flow}
          getFolderById={getFolderById}
          isRunning={false}
          renderContext={renderContext}
          isChatAvailable={isChatAvailable}
        />
      ))}
    </StyledFlowsContainer>
  );
};

export default inject(({ flowStore, infoPanelStore }) => ({
  autoLogin: flowStore.autoLogin,
  flows: flowStore.flows,
  isLoading: flowStore.isLoading,
  fetchFlows: flowStore.fetchFlows,
  getFolderById: flowStore.getFolderById,
  isChatAvailable: flowStore.isChatAvailable,
  openInfoPanel: (flow: Flow) => {
    infoPanelStore.setFlow(flow);
    infoPanelStore.setVisible(true);
  },
}))(observer(SectionBodyContent));
