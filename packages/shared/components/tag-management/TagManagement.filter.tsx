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

import { useTagManagement } from "./TagManagement.provider";
import { useCreateTagMutation } from "./hooks/useTagsQuery";
import type { TagManagementFilterProps, TTag } from "./TagManagement.types";
import styles from "./TagManagement.module.scss";

export const TagManagementFilter: React.FC<TagManagementFilterProps> = ({
  roomId,
  roomName,
}) => {
  const { t } = useTranslation("Common");
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
      const value = event.target.value;
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
            autoFocus
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
