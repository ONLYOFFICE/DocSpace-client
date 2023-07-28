import React, { useRef, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";

import Badge from "@docspace/components/badge";
import ContextMenu from "@docspace/components/context-menu";
import ContextMenuButton from "@docspace/components/context-menu-button";

import {
  ColumnCircle,
  ColumnIconWrapper,
  ColumnTitle,
  ColumnActions,
  ColumnUsers,
} from "./Column.styled";

import CrossIcon from "PUBLIC_DIR/images/cross.sidebar.react.svg";
import FolderLocationIcon from "PUBLIC_DIR/images/folder-location.react.svg";
import CheckmarkIcon from "PUBLIC_DIR/images/checkmark.rounded.svg";

import { RoleTypeEnum } from "../../enums/RoleType.enum";

import type { ColumnHeaderContentProps } from "./Column.props";
import type { IRole } from "../../Models";
import type { RoleDefaultType } from "../../types";

function isDefaultRole(role: IRole): role is RoleDefaultType {
  return role.type == RoleTypeEnum.Default;
}

function ColumnHeaderContent({ role, getModel }: ColumnHeaderContentProps) {
  const { t } = useTranslation();
  const contextMenuRef = useRef<ContextMenu>(null);

  const onClickHandler = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.show(event);
  }, []);

  const onHideContextMenu = useCallback((event: MouseEvent) => {
    contextMenuRef.current?.hide(event);
  }, []);

  const getContextModel = useCallback(() => getModel(role, t), [role, t]);

  if (!isDefaultRole(role)) {
    const isDone = role.type === RoleTypeEnum.Done;

    return (
      <>
        <ColumnIconWrapper color={isDone ? "#657077" : "#F2675A"}>
          {isDone ? (
            <CheckmarkIcon />
          ) : (
            <CrossIcon className="column__cross-icon" />
          )}
        </ColumnIconWrapper>
        <ColumnTitle>{role.title}</ColumnTitle>
        <ColumnActions>
          <Badge
            label={role.badge}
            fontWeight={800}
            fontSize="11px"
            lineHeight="16px"
            borderRadius="100%"
            maxWidth="16px"
            backgroundColor="#4781d1"
            onClick={role.onClickBadge}
          />
          <ContextMenu ref={contextMenuRef} getContextModel={getContextModel} />
          <ContextMenuButton
            className="card__context-menu"
            displayType="toggle"
            getData={getContextModel}
            onClick={onClickHandler}
            onClose={onHideContextMenu}
          />
        </ColumnActions>
      </>
    );
  }

  return (
    <>
      <ColumnCircle color={role.color} />
      <ColumnTitle>{role.title}</ColumnTitle>
      <ColumnUsers>
        {role.assigned?.displayName ?? `@${t("Files:Everyone")}`}
      </ColumnUsers>
      <ColumnActions>
        <Badge
          label={role.badge}
          fontWeight={800}
          fontSize="11px"
          lineHeight="16px"
          borderRadius="100%"
          maxWidth="16px"
          backgroundColor="#4781d1"
          onClick={role.onClickBadge}
        />
        <FolderLocationIcon
          className="column__location-btn"
          onClick={role.onClickLocation}
        />
      </ColumnActions>
    </>
  );
}

export default memo(ColumnHeaderContent);
