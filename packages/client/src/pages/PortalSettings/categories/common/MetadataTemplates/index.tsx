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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";
import { isMobile } from "@docspace/shared/utils";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import ConfirmDeleteDialog from "SRC_DIR/components/ConfirmDeleteDialog";

import { useMetadataTemplates } from "./hooks/useMetadataTemplates";
import TemplatesView from "./sub-components";
import TemplatePanel from "./sub-components/TemplatePanel";
import styles from "./MetadataTemplates.module.scss";

const MetadataTemplates = () => {
  const { t, ready } = useTranslation(["Metadata", "Settings", "Files"]);

  const { templates, authors, loadTemplates, toggleVisible, removeTemplate } =
    useMetadataTemplates();

  const [editingTemplate, setEditingTemplate] =
    useState<TMetadataTemplate | null>();
  const [deletingTemplate, setDeletingTemplate] =
    useState<TMetadataTemplate | null>(null);

  useEffect(() => {
    if (ready) setDocumentTitle(t("Settings:MetadataTemplates"));
  }, [ready]);

  const closePanel = () => setEditingTemplate(undefined);

  const onSaved = () => {
    closePanel();
    loadTemplates();
  };

  return (
    <div className={styles.metadataTemplates} data-testid="metadata-templates">
      <Text className={styles.description}>
        {t("Metadata:MetadataTemplatesDescription")}
      </Text>

      <Button
        primary
        scale={isMobile()}
        size={isMobile() ? ButtonSize.normal : ButtonSize.small}
        label={t("Files:CreateTemplate")}
        onClick={() => setEditingTemplate(null)}
        testId="metadata_create_template_button"
      />

      {templates.length ? (
        <TemplatesView
          items={templates}
          authors={authors}
          onEdit={setEditingTemplate}
          onDelete={setDeletingTemplate}
          onToggleVisible={toggleVisible}
        />
      ) : null}

      {editingTemplate !== undefined ? (
        <TemplatePanel
          template={editingTemplate}
          onClose={closePanel}
          onSaved={onSaved}
        />
      ) : null}

      {deletingTemplate ? (
        <ConfirmDeleteDialog
          title={t("Metadata:DeleteTemplateTitle")}
          description={t("Metadata:DeleteTemplateDescription")}
          onDelete={() => removeTemplate(deletingTemplate)}
          onClose={() => setDeletingTemplate(null)}
        />
      ) : null}
    </div>
  );
};

export default MetadataTemplates;
