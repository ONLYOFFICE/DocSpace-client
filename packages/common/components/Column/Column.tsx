import { PropsWithChildren, useCallback, useRef } from "react";

import Badge from "@docspace/components/badge";
import ContextMenu from "@docspace/components/context-menu";
import ContextMenuButton from "@docspace/components/context-menu-button";

import { RoleTypeEnum } from "../../enums";

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
import { ColumnProps, ColumnDefaultProps } from "./Column.props";

import CrossIcon from "PUBLIC_DIR/images/cross.sidebar.react.svg";
import FolderLocationIcon from "PUBLIC_DIR/images/folder-location.react.svg";
import CheckmarkIcon from "PUBLIC_DIR/images/checkmark.rounded.svg";
import { useTranslation } from "react-i18next";

function isDefaultColumn(column: ColumnProps): column is ColumnDefaultProps {
  return column.role.type == RoleTypeEnum.Default;
}

function Column(props: PropsWithChildren<ColumnProps>) {
  const contextMenuRef = useRef<ContextMenu>(null);
  const { t } = useTranslation();

  const onClickHandler = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.show(event);
  }, []);

  const onHideContextMenu = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.hide(event);
  }, []);

  const getModel = useCallback(
    () => props.getModel(props.role, t),
    [props.role, t]
  );

  if (!isDefaultColumn(props)) {
    const isDone = props.role.type === RoleTypeEnum.Done;

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
          <ColumnTitle>{props.role.title}</ColumnTitle>
          <ColumnActions>
            <Badge
              label={props.role.badge}
              fontWeight={800}
              fontSize="11px"
              lineHeight="16px"
              borderRadius="100%"
              maxWidth="16px"
              backgroundColor="#4781d1"
              onClick={props.role.onClickBadge}
            />
            <ContextMenu ref={contextMenuRef} getContextModel={getModel} />
            <ContextMenuButton
              className="card__context-menu"
              displayType="toggle"
              getData={getModel}
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
        <ColumnCircle color={props.role.color} />
        <ColumnTitle>{props.role.title}</ColumnTitle>
        <ColumnUsers>
          {props.role.assigned?.displayName ?? `@${t("Files:Everyone")}`}
        </ColumnUsers>
        <ColumnActions>
          <Badge
            label={props.role.badge}
            fontWeight={800}
            fontSize="11px"
            lineHeight="16px"
            borderRadius="100%"
            maxWidth="16px"
            backgroundColor="#4781d1"
            onClick={props.role.onClickBadge}
          />
          <FolderLocationIcon
            className="column__location-btn"
            onClick={props.role.onClickLocation}
          />
        </ColumnActions>
      </ColumnHeader>
      <ColumnBody>{props.children}</ColumnBody>
    </ColumnContainer>
  );
}

export default Column;
