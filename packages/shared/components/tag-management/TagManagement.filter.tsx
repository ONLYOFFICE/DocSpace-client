/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {
  useCallback,
  startTransition,
  useState,
  useEffect,
} from "react";
import { Trans, useTranslation } from "react-i18next";

import PlusIcon from "PUBLIC_DIR/images/icons/12/plus.svg?url";

import { Tag } from "@docspace/ui-kit/components/tag";
import { Text } from "@docspace/ui-kit/components/text";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";

import { removeEmojiCharacters } from "../../utils/removeEmojiCharacters";

import { useTagManagement } from "./TagManagement.provider";
import { useCreateTagMutation } from "./hooks/useTagsQuery";
import type { TagManagementFilterProps, TTag } from "./TagManagement.types";
import styles from "./TagManagement.module.scss";

export const TagManagementFilter: React.FC<TagManagementFilterProps> = ({
  roomId,
  roomName,
}) => {
  const { t } = useTranslation("Common");
  const isMobile = useIsMobile();
  const {
    searchValue,
    deferredSearchValue,
    showCreateTag,
    setSearchValue,
    clearSearch,
    tags,
    setTags,
    filteredTags,
    access: { canSearch },
  } = useTagManagement();
  const createTag = useCreateTagMutation(roomId);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (searchValue === "") {
      setInputValue("");
    }
  }, [searchValue]);

  const onChangeSearchValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = removeEmojiCharacters(event.target.value);
      setInputValue(value);
      startTransition(() => {
        setSearchValue(value);
      });
    },
    [setSearchValue],
  );

  const handleCreateTag = useCallback(async () => {
    const trimmedValue = searchValue.trim();
    if (trimmedValue.length === 0 || !showCreateTag) return;

    const newTag: TTag = { label: trimmedValue, checked: true };
    const updatedTags = [newTag, ...tags];
    clearSearch();
    setInputValue("");

    createTag.mutate(trimmedValue, {
      onSuccess: () => {
        setTags(updatedTags);
      },
      onError: (error) => {
        console.error("Failed to create tag:", error);
        toastr.error(error);
      },
    });
  }, [searchValue, tags, clearSearch, createTag, setTags, showCreateTag]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "Enter":
          handleCreateTag();
          break;
        case "Escape":
          setInputValue("");
          clearSearch();
          break;
        default:
          break;
      }
    },
    [handleCreateTag, clearSearch],
  );

  if (!canSearch && !showCreateTag) {
    return (
      <Text className={styles.text} fontSize="12px" lineHeight="16px" noSelect>
        <Trans
          t={t}
          ns="Common"
          i18nKey="RoomTags"
          values={{ roomName }}
          components={{
            bold: <strong key="room-name" className={styles.roomName} />,
          }}
        />
      </Text>
    );
  }

  return (
    <>
      {canSearch ? (
        <>
          <TextInput
            scale
            autoFocus={!isMobile}
            withBorder={false}
            value={inputValue}
            size={InputSize.base}
            type={InputType.search}
            className={styles.input}
            onChange={onChangeSearchValue}
            placeholder={t("Common:AddTag")}
            onKeyDown={handleKeyDown}
            testId="add_tag_input"
          />
          <hr className={styles.divider} />
        </>
      ) : null}
      {showCreateTag ? (
        <Text
          as="div"
          className={styles.wrapperCreateTag}
          noSelect
          fontSize="12px"
          fontWeight={600}
          lineHeight="16px"
        >
          <span className={styles.createTagText}>{t("Common:CreateTag")}</span>
          <Tag
            icon={PlusIcon}
            className={styles.createTag}
            iconClassName={styles.createTagIcon}
            tag={deferredSearchValue}
            label={deferredSearchValue}
            onClick={handleCreateTag}
            dataTestId="create_tag_button"
          />
        </Text>
      ) : null}
      {filteredTags.length > 0 ? (
        <Text
          className={styles.text}
          fontSize="12px"
          lineHeight="16px"
          noSelect
        >
          {showCreateTag
            ? t("Common:OrSelectFromAvailableMatches")
            : t("Common:SelectAnOptionOrCreateOne")}
        </Text>
      ) : null}
    </>
  );
};
