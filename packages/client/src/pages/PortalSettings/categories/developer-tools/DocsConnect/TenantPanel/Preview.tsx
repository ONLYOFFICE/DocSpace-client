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

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Tabs, TabsTypes } from "@docspace/ui-kit/components/tabs";
import { EmptyView } from "@docspace/ui-kit/components/empty-view";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { DocumentEditor, type IConfig } from "@docspace/ui-kit/document-editor";

import DocumentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import CopyIcon from "PUBLIC_DIR/images/copyTo.react.svg";
import DesktopOnlyIcon from "PUBLIC_DIR/images/emptyview/empty.desktop.only.svg";

import { EmptyServerErrorContainer } from "SRC_DIR/components/EmptyContainer/EmptyServerErrorContainer";

import { DeviceType } from "@docspace/shared/enums";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { signDocsConnectToken } from "../utils";
import { DOCS_CONNECT_PREVIEW } from "../constants";

import styles from "./TenantPanel.module.scss";

interface PreviewProps {
  info?: TDocsConnectInfo;
  user?: TUser;
  copyToClipboard?: (value: string, t: TTranslation) => void;
  currentDeviceType?: DeviceType;
}

const Preview = ({
  info,
  user,
  copyToClipboard,
  currentDeviceType,
}: PreviewProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const [view, setView] = useState<"editor" | "code">("editor");
  const [token, setToken] = useState<string | null>(null);
  const [editorError, setEditorError] = useState(false);
  const [documentReady, setDocumentReady] = useState(false);
  const [previewKey] = useState(
    () => `docs-connect-preview-${Math.random().toString(36).slice(2, 10)}`,
  );

  const address = info?.tenant.address ?? "";
  const secret = info?.config.security.secret ?? "";
  const serverUrl = address.startsWith("http") ? address : `https://${address}`;

  const config = useMemo<IConfig>(() => {
    const editorConfig: IConfig = {
      documentType: DOCS_CONNECT_PREVIEW.editorType,
      document: {
        fileType: DOCS_CONNECT_PREVIEW.fileType,
        key: previewKey,
        title: DOCS_CONNECT_PREVIEW.title,
        url: DOCS_CONNECT_PREVIEW.source,
      },
      editorConfig: {
        lang: i18n.language,
        user: user ? { id: user.id, name: user.displayName } : undefined,
      },
    };

    if (isMobile) editorConfig.type = "mobile";

    return editorConfig;
  }, [previewKey, i18n.language, user]);

  useEffect(() => {
    if (!secret) return;

    let cancelled = false;

    signDocsConnectToken(config, secret)
      .then((value) => {
        if (!cancelled) setToken(value);
      })
      .catch(() => {
        if (!cancelled) setEditorError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [config, secret]);

  const demoCode = useMemo(() => {
    const configJson = JSON.stringify(config, null, 2);
    return [
      `<div id="placeholder"></div>`,
      `<script src="${serverUrl}/web-apps/apps/api/documents/api.js"></script>`,
      `<script>`,
      `  const config = ${configJson.replace(/\n/g, "\n  ")};`,
      `  config.token = "<JWT signed with your secret key (HS256)>";`,
      `  new DocsAPI.DocEditor("placeholder", config);`,
      `</script>`,
    ].join("\n");
  }, [config, serverUrl]);

  if (!info) return null;

  return (
    <div className={styles.preview}>
      <Tabs
        type={TabsTypes.Secondary}
        withoutStickyIntend
        items={[
          {
            id: "editor",
            name: t("Common:Editor"),
            iconName: DocumentsReactSvgUrl,
            content: null,
          },
          {
            id: "code",
            name: t("DocsConnect:DemoCode"),
            iconName: CodeReactSvgUrl,
            content: null,
          },
        ]}
        selectedItemId={view}
        onSelect={(item) => setView(item.id as "editor" | "code")}
      />

      {isMobileView ? (
        view === "editor" ? (
          <EmptyView
            icon={<DesktopOnlyIcon />}
            title={t("DocsConnect:PreviewDesktopOnlyTitle")}
            description={t("DocsConnect:PreviewDesktopOnlyDescription")}
            options={null}
          />
        ) : null
      ) : (
        <div
          className={`${styles.previewEditorSlot} ${
            view === "editor" ? "" : styles.previewEditorSlotHidden
          }`}
        >
          <div className={styles.previewEditor}>
            {editorError ? (
              <EmptyServerErrorContainer />
            ) : (
              <>
                {!documentReady ? (
                  <div className={styles.previewLoader}>
                    <Loader type={LoaderTypes.rombs} size="40px" />
                  </div>
                ) : null}
                {token ? (
                  <DocumentEditor
                    id="docs-connect-preview-editor"
                    documentServerUrl={`${serverUrl}/`}
                    config={{ ...config, token }}
                    width="100%"
                    height="100%"
                    onLoadComponentError={() => setEditorError(true)}
                    events_onDocumentReady={() => setDocumentReady(true)}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      {view === "code" ? (
        <div className={styles.demoCode}>
          <IconButton
            className={styles.demoCodeCopy}
            iconNode={<CopyIcon />}
            size={16}
            onClick={() => copyToClipboard?.(demoCode, t)}
            dataTestId="docs_connect_demo_code_copy"
          />
          <pre className={styles.demoCodeText}>{demoCode}</pre>
        </div>
      ) : null}
    </div>
  );
};

export default inject(
  ({ docsConnectStore, userStore, settingsStore }: TStore) => ({
    info: docsConnectStore.info,
    user: userStore.user,
    copyToClipboard: docsConnectStore.copyToClipboard,
    currentDeviceType: settingsStore.currentDeviceType,
  }),
)(observer(Preview));
