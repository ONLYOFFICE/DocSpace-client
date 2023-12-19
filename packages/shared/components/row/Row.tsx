import React, { useRef } from "react";

import { isMobile } from "react-device-detect"; // TODO: isDesktop=true for IOS(Firefox & Safari)
import { isMobile as isMobileUtils } from "../../utils/device";

import { Checkbox } from "../checkbox";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../context-menu-button";
import { ContextMenu } from "../context-menu";
import { Loader, LoaderTypes } from "../loader";
import {
  StyledOptionButton,
  StyledContentElement,
  StyledElement,
  StyledCheckbox,
  StyledContent,
  StyledRow,
} from "./Row.styled";
import { RowProps } from "./Row.types";

const Row = (props: RowProps) => {
  const {
    checked,
    children,
    contentElement,
    contextButtonSpacerWidth = "26px",
    data,
    element,
    indeterminate,
    onSelect,
    onRowClick,
    onContextClick,

    getContextModel,
    isRoom,
    withoutBorder = false,
    contextTitle,
    badgesComponent,
    isArchive,
    mode = "default",
    inProgress,
    rowContextClose,
  } = props;

  const cm = useRef<null | {
    show: (e: React.MouseEvent | MouseEvent) => void;
    hide: (
      e:
        | React.MouseEvent
        | MouseEvent
        | Event
        | React.ChangeEvent<HTMLInputElement>,
    ) => void;
  }>(null);
  const row = useRef<null | HTMLDivElement>(null);

  const renderCheckbox = Object.prototype.hasOwnProperty.call(props, "checked");

  const renderElement = Object.prototype.hasOwnProperty.call(props, "element");

  const renderContentElement = Object.prototype.hasOwnProperty.call(
    props,
    "contentElement",
  );

  const contextData = data?.contextOptions ? data : props;

  const renderContext =
    Object.prototype.hasOwnProperty.call(contextData, "contextOptions") &&
    contextData &&
    contextData.contextOptions &&
    contextData.contextOptions.length > 0;

  const changeCheckbox = () => {
    onSelect?.(checked, data);
  };

  const getOptions = () => {
    onContextClick?.();
    return contextData.contextOptions || [];
  };

  const onContextMenu = (e: React.MouseEvent) => {
    onContextClick?.(e.button === 2);
    // if (!cm.current.menuRef.current) {
    //   if (row.current) row.current.click(); //TODO: need fix context menu to global
    // }
    if (cm.current) cm.current.show(e);
  };

  let contextMenuHeader = {
    title: "",
    icon: "",
    avatar: "",
    color: "",
  };
  if (React.isValidElement(children) && children.props.item) {
    contextMenuHeader = {
      icon: children.props.item.icon,
      avatar: children.props.item.avatar,
      title: children.props.item.title
        ? children.props.item.title
        : children.props.item.displayName || "",
      color: children.props.item.logo?.color,
    };
  }

  const onElementClick = () => {
    if (!isMobile) return;

    onSelect?.(true, data);
  };

  return (
    <StyledRow
      ref={row}
      //   {...rest}
      mode={mode}
      onContextMenu={onContextMenu}
      withoutBorder={withoutBorder}
      data-testid="row"
    >
      {inProgress ? (
        <Loader
          className="row-progress-loader"
          type={LoaderTypes.oval}
          size="16px"
        />
      ) : (
        <>
          {mode === "default" && renderCheckbox && (
            <StyledCheckbox mode={mode} className="not-selectable">
              <Checkbox
                className="checkbox"
                isChecked={checked}
                isIndeterminate={indeterminate}
                onChange={changeCheckbox}
              />
            </StyledCheckbox>
          )}
          {mode === "modern" && renderCheckbox && renderElement && (
            <StyledCheckbox
              className="not-selectable styled-checkbox-container"
              mode={mode}
            >
              <StyledElement
                onClick={onElementClick}
                className="styled-element"
              >
                {element}
              </StyledElement>
              <Checkbox
                className="checkbox"
                isChecked={checked}
                isIndeterminate={indeterminate}
                onChange={changeCheckbox}
              />
            </StyledCheckbox>
          )}

          {mode === "default" && renderElement && (
            <StyledElement onClick={onRowClick} className="styled-element">
              {element}
            </StyledElement>
          )}
        </>
      )}

      <StyledContent onClick={onRowClick} className="row_content">
        {children}
      </StyledContent>
      <StyledOptionButton
        className="row_context-menu-wrapper"
        spacerWidth={contextButtonSpacerWidth}
      >
        {badgesComponent && badgesComponent}
        {renderContentElement && (
          <StyledContentElement>{contentElement}</StyledContentElement>
        )}
        {renderContext ? (
          <ContextMenuButton
            isFill
            className="expandButton"
            getData={getOptions}
            directionX="right"
            displayType={ContextMenuButtonDisplayType.toggle}
            onClick={onContextMenu}
            title={contextTitle}
          />
        ) : (
          <div className="expandButton"> </div>
        )}
        <ContextMenu
          getContextModel={getContextModel}
          model={contextData.contextOptions || []}
          ref={cm}
          header={contextMenuHeader}
          withBackdrop={isMobileUtils()}
          onHide={rowContextClose}
          isRoom={isRoom}
          isArchive={isArchive}
        />
      </StyledOptionButton>
    </StyledRow>
  );
};

export { Row };
