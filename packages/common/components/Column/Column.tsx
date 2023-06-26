import { PropsWithChildren, useCallback, useRef } from "react";

import Badge from "@docspace/components/badge";
import ContextMenu from "@docspace/components/context-menu";
import ContextMenuButton from "@docspace/components/context-menu-button";

import { RoleTypeEnum } from "../../types";

import {
  ColumnCircle,
  ColumnIconWrapper,
  ColumnContainer,
  ColumnHeader,
  ColumnTitle,
  ColumnActions,
  ColumnUsers,
  ColumnBody,
} from "./Column.styled";
import { ColumnDefaultProps, ColumnProps } from "./Column.props";

import FolderLocationIcon from "PUBLIC_DIR/images/folder-location.react.svg";
import CheckmarkIcon from "PUBLIC_DIR/images/checkmark.rounded.svg";
import CrossIcon from "PUBLIC_DIR/images/cross.sidebar.react.svg";

function isDefaultColumn(column: ColumnProps): column is ColumnDefaultProps {
  return column.type == RoleTypeEnum.Default;
}

function Column(props: PropsWithChildren<ColumnProps>) {
  const contextMenuRef = useRef<ContextMenu>(null);

  const onClickHandler = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.show(event);
  }, []);

  const onHideContextMenu = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.hide(event);
  }, []);

  console.log({
    props,
    isDefault: isDefaultColumn(props),
  });

  if (!isDefaultColumn(props)) {
    const isDone = props.type === RoleTypeEnum.Done;

    return (
      <ColumnContainer>
        <ColumnHeader>
          <ColumnIconWrapper color={isDone ? "#657077" : "#F2675A"}>
            {isDone ? (
              <CheckmarkIcon />
            ) : (
              <CrossIcon className="column__cross-icon" />
            )}
          </ColumnIconWrapper>
          <ColumnTitle>{props.title}</ColumnTitle>
          <ColumnActions>
            <Badge
              label={props.badge}
              fontWeight={800}
              fontSize="11px"
              lineHeight="16px"
              borderRadius="100%"
              maxWidth="16px"
              backgroundColor="#4781d1"
              onClick={props.onClickBadge}
            />
            <ContextMenu
              ref={contextMenuRef}
              getContextModel={props.getOptions}
            />
            <ContextMenuButton
              className="card__context-menu"
              displayType="toggle"
              getData={props.getOptions}
              onClick={onClickHandler}
              onClose={onHideContextMenu}
            />
          </ColumnActions>
        </ColumnHeader>
        <ColumnBody>{props.children}</ColumnBody>
      </ColumnContainer>
    );
  }

  return (
    <ColumnContainer>
      <ColumnHeader>
        <ColumnCircle color={props.color} />
        <ColumnTitle>{props.title}</ColumnTitle>
        <ColumnUsers>{props.assigned?.displayName}</ColumnUsers>
        <ColumnActions>
          <Badge
            label={props.badge}
            fontWeight={800}
            fontSize="11px"
            lineHeight="16px"
            borderRadius="100%"
            maxWidth="16px"
            backgroundColor="#4781d1"
            onClick={props.onClickBadge}
          />
          <FolderLocationIcon
            className="column__location-btn"
            onClick={props.onClickLocation}
          />
        </ColumnActions>
      </ColumnHeader>
      <ColumnBody>{props.children}</ColumnBody>
    </ColumnContainer>
  );
}

export default Column;
