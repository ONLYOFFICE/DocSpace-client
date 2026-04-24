// (c) Copyright Ascensio System SIA 2009-2026
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

import React, { useState } from "react";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { TextInput } from "@docspace/ui-kit/components/text-input";

import CheckIcon from "PUBLIC_DIR/images/check.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/12/cross.react.svg";

import styles from "./EditingWrapperComponent.module.scss";

export const okIcon = (
  <CheckIcon className={`edit-ok-icon ${styles.editIcon}`} />
);
export const cancelIcon = (
  <CrossIcon className={`edit-cancel-icon ${styles.editIcon}`} />
);

const EditingWrapperComponent = (props) => {
  const {
    itemTitle,
    itemId,
    renameTitle,
    onClickUpdateItem,
    cancelUpdateItem,
    viewAs,
    elementIcon,
    isUpdatingRowItem,
    passwordEntryProcess,
    isFolder,
  } = props;

  const isTable = viewAs === "table";

  const [OkIconIsHovered, setIsHoveredOk] = useState(false);
  const [CancelIconIsHovered, setIsHoveredCancel] = useState(false);
  const [isTouchOK, setIsTouchOK] = useState(false);
  const [isTouchCancel, setIsTouchCancel] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const inputRef = React.useRef(null);

  const onKeyUpUpdateItem = (e) => {
    if (isLoading) return;

    const code = e.keyCode || e.which;
    if (code === 13) {
      if (!isLoading) setIsLoading(true);
      return onClickUpdateItem(e);
    }
  };
  const onEscapeKeyPress = (e) => {
    if (e.keyCode === 27) return cancelUpdateItem(e);
  };

  const setIsHoveredOkHandler = () => {
    setIsHoveredOk(!OkIconIsHovered);
  };

  const setIsHoveredCancelHandler = () => {
    setIsHoveredCancel(!CancelIconIsHovered);
  };

  const onFocus = (e) => e.target.select();
  const onBlur = (e) => {
    if (
      (e.relatedTarget && e.relatedTarget.classList.contains("edit-button")) ||
      OkIconIsHovered ||
      CancelIconIsHovered ||
      isTouchOK ||
      isTouchCancel
    )
      return false;

    if (!document.hasFocus() && inputRef.current === e.target) return false;

    !passwordEntryProcess && onClickUpdateItem(e, false);
  };

  return (
    <div
      className={styles.editingWrapper}
      data-view={viewAs || undefined}
      data-updating-row={
        isUpdatingRowItem && !isTable ? "" : undefined
      }
      data-folder={isFolder ? "" : undefined}
      data-disabled={isLoading ? "" : undefined}
    >
      {isTable ? elementIcon : null}
      {isUpdatingRowItem && !isTable ? (
        <Text className="edit-text">{itemTitle}</Text>
      ) : (
        <TextInput
          className="edit-text"
          name="title"
          scale
          value={itemTitle}
          tabIndex={1}
          isAutoFocussed
          onChange={renameTitle}
          onKeyPress={onKeyUpUpdateItem}
          onKeyDown={onEscapeKeyPress}
          onFocus={onFocus}
          onBlur={onBlur}
          isDisabled={isLoading}
          data-itemid={itemId}
          withBorder={!isTable}
          forwardedRef={inputRef}
        />
      )}
      {!isUpdatingRowItem ? (
        <>
          <Button
            className="edit-button not-selectable"
            size="small"
            isDisabled={isLoading}
            onClick={onClickUpdateItem}
            icon={okIcon}
            data-itemid={itemId}
            onMouseEnter={setIsHoveredOkHandler}
            onMouseLeave={setIsHoveredOkHandler}
            onTouchStart={() => setIsTouchOK(true)}
            isHovered={OkIconIsHovered}
            title=""
          />
          <Button
            className="edit-button not-selectable"
            size="medium"
            isDisabled={isLoading}
            onClick={cancelUpdateItem}
            icon={cancelIcon}
            data-itemid={itemId}
            data-action="cancel"
            onMouseEnter={setIsHoveredCancelHandler}
            onMouseLeave={setIsHoveredCancelHandler}
            onTouchStart={() => setIsTouchCancel(true)}
            isHovered={CancelIconIsHovered}
            title=""
          />
        </>
      ) : null}
    </div>
  );
};

export default EditingWrapperComponent;
