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

import { createPortal } from "react-dom";
import classNames from "classnames";
import React, {
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useOptimistic,
} from "react";
import { useTranslation } from "react-i18next";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";

import PlusIcon from "PUBLIC_DIR/images/icons/12/plus.svg?url";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import CheckIconURL from "PUBLIC_DIR/images/check.edit.react.svg?url";
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { useClickOutside } from "../../utils/useClickOutside";
import { useIsMobile } from "../../hooks/useIsMobile";
import { ModalDialog, ModalDialogType } from "../modal-dialog";

import { Tag } from "../tag";
import { Text } from "../text";
import { Checkbox } from "../checkbox";
import { IconButton } from "../icon-button";
import { InputSize, InputType, TextInput } from "../text-input";
import { Scrollbar } from "../scrollbar";

import styles from "./TagSelector.module.scss";
import {
  ROW_HEIGHT,
  ICON_SIZE,
  MAX_BODY_HEIGHT,
  MARGIN_BOTTOM,
} from "./TagSelector.constants";
import type { TagSelectorProps, TTag } from "./TagSelector.types";

export const TagSelector: React.FC<TagSelectorProps> = ({
  reference,
  onClose,
  tags: propsTags,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<TTag[]>(() => {
    return propsTags.map((tag) => ({
      name: tag,
      checked: true,
    }));
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const [newTagValue, setNewTagValue] = useState("");

  const deferredTagValue = useDeferredValue(newTagValue);

  const isMobile = useIsMobile();
  useClickOutside(isMobile ? modalRef : ref, onClose, [onClose]);

  const { t } = useTranslation("Common");

  useLayoutEffect(() => {
    if (!reference.current || !ref.current || isMobile) return;

    computePosition(reference.current, ref.current, {
      placement: "bottom-start",
      strategy: "fixed",
      middleware: [
        offset(4),
        flip({
          fallbackAxisSideDirection: "end",
        }),
        shift(),
      ],
    }).then(({ x, y }) => {
      if (ref.current) {
        ref.current.style.left = `${x}px`;
        ref.current.style.top = `${y}px`;
      }
    });
  }, [reference, ref, isMobile]);

  const onChangeTitleTag = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagValue(event.target.value);
  };

  const toggleChecked = (index: number) => {
    const newTags = [...tags];
    newTags[index].checked = !newTags[index].checked;
    setTags(newTags);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tags[index].name);
  };

  const confirmEdit = () => {
    if (editingIndex === null) return;
    const newTags = [...tags];
    newTags[editingIndex].name = editValue.trim();
    setTags(newTags);
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const deleteTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const filteredTags = useMemo(() => {
    const search = deferredTagValue.toLowerCase().trim();
    return tags.filter((tag) => tag.name.toLowerCase().includes(search));
  }, [tags, deferredTagValue]);

  const showCreateTag = useMemo(() => {
    const trimmedTagValue = deferredTagValue.trim();

    return (
      trimmedTagValue.length > 0 &&
      filteredTags.every((tag) => tag.name !== trimmedTagValue)
    );
  }, [deferredTagValue, filteredTags]);

  const onClickTag = () => {};

  const element = (
    <div
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      className={styles.tagSelector}
      ref={ref}
    >
      <TextInput
        scale
        autoFocus
        className={styles.input}
        value={newTagValue}
        placeholder="Add a tag"
        type={InputType.text}
        onChange={onChangeTitleTag}
        withBorder={false}
      />
      <hr className={styles.divider} />
      {showCreateTag ? (
        <Text
          as="div"
          className={classNames(styles.text, styles.wrapperCreateTag)}
          noSelect
          fontSize="12px"
          fontWeight={600}
          lineHeight="16px"
        >
          <span>{t("Common:CreateTag")}</span>
          <Tag
            withIcon
            icon={PlusIcon}
            className={styles.createTag}
            iconClassName={styles.createTagIcon}
            tag={deferredTagValue}
            label={deferredTagValue}
          />
        </Text>
      ) : null}
      <Text className={styles.text} fontSize="12px" lineHeight="16px" noSelect>
        {showCreateTag
          ? t("Common:OrSelectFromAvailableMatches")
          : t("Common:SelectAnOptionOrCreateOne")}
      </Text>
      <div
        className={styles.wrapperList}
        style={{
          height: isMobile
            ? "100%"
            : Math.min(
                MAX_BODY_HEIGHT,
                filteredTags.length * ROW_HEIGHT + MARGIN_BOTTOM,
              ),
        }}
      >
        <Scrollbar fixedSize className={styles.scrollbar}>
          {filteredTags.map((tag, index) => {
            return (
              <div key={tag.name} className={styles.row}>
                <Checkbox
                  className={styles.checkbox}
                  isChecked={tag.checked}
                  onChange={() => toggleChecked(index)}
                />
                {editingIndex === index ? (
                  <>
                    <TextInput
                      scale
                      autoFocus
                      value={editValue}
                      size={InputSize.base}
                      type={InputType.text}
                      className={styles.editInput}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <div className={styles.checkCross}>
                      <IconButton
                        size={ICON_SIZE}
                        className={styles.checkIcon}
                        iconName={CheckIconURL}
                        onClick={confirmEdit}
                      />
                      <IconButton
                        size={ICON_SIZE}
                        className={styles.crossIcon}
                        iconName={CrossIconReactSvgUrl}
                        onClick={cancelEdit}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Tag
                      className={styles.tag}
                      label={tag.name}
                      tag={tag.name}
                      onClick={onClickTag}
                    />
                    <IconButton
                      size={ICON_SIZE}
                      className={styles.editIcon}
                      iconName={AccessEditReactSvgUrl}
                      onClick={() => handleEdit(index)}
                    />
                    <IconButton
                      size={ICON_SIZE}
                      iconName={TrashReactSvgUrl}
                      className={styles.deleteIcon}
                      onClick={() => deleteTag(index)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </Scrollbar>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <ModalDialog visible autoMaxHeight displayType={ModalDialogType.modal}>
        <ModalDialog.Body className={styles.modalBody} ref={modalRef}>
          {element}
        </ModalDialog.Body>
      </ModalDialog>
    );
  }

  return createPortal(element, document.body);
};
