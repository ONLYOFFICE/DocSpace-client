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

import EmptyFilterLightSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg?url";
import EmptyFilterDarkSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.dark.svg?url";
import EmptyFolderLightSvgUrl from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.light.svg?url";
import EmptyFolderDarkSvgUrl from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.dark.svg?url";

import { useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { EmptyScreenContainer } from "@onlyoffice/apps-ui-kit/components/empty-screen-container";
import { SearchInput } from "@onlyoffice/apps-ui-kit/components/search-input";
import { InputSize } from "@onlyoffice/apps-ui-kit/components/text-input";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type {
  TEntryMetadataTemplate,
  TMetadataTemplate,
} from "@docspace/shared/api/metadata/types";

import { useAssignableTemplates } from "../../hooks/useAssignableTemplates";
import { filterTemplatesByName } from "../../utils";
import styles from "../Panel.module.scss";

type TemplateListProps = {
  assigned: TEntryMetadataTemplate[];
  selected: TMetadataTemplate | null;
  onSelect: (template: TMetadataTemplate) => void;
  onOpen: (template: TMetadataTemplate) => void;
};

const TemplateList = ({
  assigned,
  selected,
  onSelect,
  onOpen,
}: TemplateListProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);
  const { isBase } = useTheme();
  const { templates, isLoading } = useAssignableTemplates(assigned);
  const [search, setSearch] = useState("");

  if (isLoading) return null;

  if (!templates.length) {
    return (
      <EmptyScreenContainer
        className={styles.emptyScreen}
        imageSrc={isBase ? EmptyFolderLightSvgUrl : EmptyFolderDarkSvgUrl}
        imageAlt=""
        headerText={t("Metadata:NoTemplatesToAdd")}
        descriptionText={t("Metadata:NoTemplatesToAddDescription")}
      />
    );
  }

  const foundTemplates = filterTemplatesByName(templates, search);

  return (
    <div className={styles.templateList}>
      <div className={styles.templateSearch}>
        <SearchInput
          size={InputSize.base}
          value={search}
          placeholder={t("Common:Search")}
          onChange={setSearch}
          onClearSearch={() => setSearch("")}
          scale
          dataTestId="metadata_template_search"
        />
      </div>

      {foundTemplates.length ? (
        foundTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            className={classNames(styles.templateItem, {
              [styles.selected]: template.id === selected?.id,
            })}
            onClick={() => onSelect(template)}
            onDoubleClick={() => onOpen(template)}
            data-testid={`metadata_template_item_${template.id}`}
          >
            <Text
              as="span"
              fontSize="14px"
              fontWeight={600}
              lineHeight="20px"
              truncate
            >
              {template.name}
            </Text>
            <Text
              as="span"
              className={styles.hint}
              fontSize="12px"
              lineHeight="16px"
            >
              {t("Metadata:FieldsCount", {
                count: template.fields?.length ?? 0,
              })}
            </Text>
          </button>
        ))
      ) : (
        <EmptyScreenContainer
          className={styles.emptyScreen}
          imageSrc={isBase ? EmptyFilterLightSvgUrl : EmptyFilterDarkSvgUrl}
          imageAlt=""
          headerText={t("Metadata:NotFoundTemplates")}
          descriptionText={t("Metadata:NotFoundTemplatesDescription")}
        />
      )}
    </div>
  );
};

export default TemplateList;
