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

import { useCallback, useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { getFileInfo, getFolder } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import { triggerFileDownload } from "@docspace/shared/services/private-room/encrypted-download";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  decryptVisitorFile,
  readVisitorFileName,
  type TVisitorLink,
} from "@docspace/shared/services/private-room/private-link-visitor";

import styles from "./PrivateLink.module.scss";

// shortcut: only raster images are shown in the page; a document opens in the editor, anything else is downloaded.
const IMAGE_NAME = /\.(png|jpe?g|gif|webp|bmp)$/i;
const DOCUMENT_NAME = /\.(docx?|xlsx?|pptx?|pdf|odt|ods|odp|rtf|txt|csv)$/i;

/**
 * The address of the editor for a document reached through a link. The part
 * after # goes with it, as on this page: the editor opens the key of the
 * file with it.
 */
const getEditorAddress = (link: TVisitorLink, fileId: number) =>
  `${combineUrl(
    window.ClientConfig?.proxy?.url,
    `/doceditor?fileid=${fileId}&share=${encodeURIComponent(link.key)}&action=view`,
  )}${window.location.hash}`;

type TName = string | null | "not-ready";

/** The real name of a file, decrypted with the key of the link. */
const useVisitorFileName = (link: TVisitorLink, file: TFile | null): TName => {
  const [name, setName] = useState<TName>(null);

  useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;
    readVisitorFileName(link, file)
      .then((value) => {
        if (!cancelled) setName(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [link, file]);

  return name;
};

type FileProps = { t: TFunction; link: TVisitorLink; file: TFile };

/**
 * One file reached through a link: its real name, a download of the
 * decrypted file and, for an image, a preview. The decrypted bytes stay in
 * the page.
 *
 * Spec: private-rooms/file-operations, "A visitor opens an external link without an account"
 */
export const VisitorFile = ({ t, link, file }: FileProps) => {
  const name = useVisitorFileName(link, file);
  const [isBusy, setIsBusy] = useState(false);
  const [notReady, setNotReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const isNotReady = notReady || name === "not-ready";
  const title = typeof name === "string" && !isNotReady ? name : file.title;

  const decrypt = async () => {
    setIsBusy(true);
    try {
      const result = await decryptVisitorFile(link, file);
      if (result === "not-ready") {
        setNotReady(true);
        return null;
      }
      if (!result.success || !result.file) {
        toastr.error(t("Common:PrivateLinkDecryptFailed"));
        return null;
      }
      return result.file;
    } finally {
      setIsBusy(false);
    }
  };

  const onDownload = async () => {
    const decrypted = await decrypt();
    if (decrypted) triggerFileDownload(decrypted, title);
  };

  const onPreview = async () => {
    const decrypted = await decrypt();
    if (!decrypted) return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(decrypted);
    setPreviewUrl(previewRef.current);
  };

  return (
    <div className={styles.file} data-testid={`private_link_file_${file.id}`}>
      <div className={styles.row}>
        <Text fontSize="14px" fontWeight="600" truncate title={title}>
          {title}
        </Text>
        {isNotReady ? null : (
          <div className={styles.actions}>
            {IMAGE_NAME.test(title) ? (
              <Button
                size={ButtonSize.small}
                label={t("Common:Preview")}
                onClick={onPreview}
                isDisabled={isBusy}
                testId={`private_link_preview_${file.id}`}
              />
            ) : null}
            {DOCUMENT_NAME.test(title) ? (
              <Button
                size={ButtonSize.small}
                label={t("Common:Preview")}
                onClick={() =>
                  window.open(getEditorAddress(link, file.id), "_blank")
                }
                isDisabled={isBusy}
                testId={`private_link_open_${file.id}`}
              />
            ) : null}
            <Button
              primary
              size={ButtonSize.small}
              label={t("Common:Download")}
              onClick={onDownload}
              isLoading={isBusy}
              testId={`private_link_download_${file.id}`}
            />
          </div>
        )}
      </div>
      {isNotReady ? (
        <Text fontSize="12px" className={styles.note}>
          {t("Common:PrivateLinkFileNotReady")}
        </Text>
      ) : null}
      {previewUrl ? (
        <img className={styles.preview} src={previewUrl} alt={title} />
      ) : null}
    </div>
  );
};

type SingleFileProps = { t: TFunction; link: TVisitorLink; fileId: number };

/** A link to one file. */
export const VisitorSingleFile = ({ t, link, fileId }: SingleFileProps) => {
  const [file, setFile] = useState<TFile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFileInfo(fileId, link.key)
      .then((info) => {
        if (!cancelled) setFile(info as TFile);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fileId, link.key]);

  if (failed) return <Text>{t("Common:LinkNoLongerAvailable")}</Text>;
  if (!file) return <Text>{t("Common:LoadingProcessing")}</Text>;
  return <VisitorFile t={t} link={link} file={file} />;
};

type FolderProps = { t: TFunction; link: TVisitorLink; folderId: number };

// shortcut: the first hundred entries of a folder are listed; add paging when a linked folder holds more.
const PAGE_SIZE = 100;

/**
 * A link to a folder or a room: its folders, which open in place, and its
 * files under their real names. Nothing but reading is offered.
 *
 * Spec: private-rooms/file-operations, "What a visitor of an external link can do"
 */
export const VisitorFolder = ({ t, link, folderId }: FolderProps) => {
  const [path, setPath] = useState<number[]>([folderId]);
  const [entries, setEntries] = useState<{
    folders: TFolder[];
    files: TFile[];
  } | null>(null);
  const [failed, setFailed] = useState(false);
  const current = path[path.length - 1];

  const load = useCallback(async () => {
    setEntries(null);
    setFailed(false);
    try {
      const filter = FilesFilter.getDefault({ pageCount: PAGE_SIZE });
      const data = await getFolder(current, filter, undefined, link.key);
      setEntries({ folders: data.folders ?? [], files: data.files ?? [] });
    } catch {
      setFailed(true);
    }
  }, [current, link.key]);

  useEffect(() => {
    load();
  }, [load]);

  if (failed) return <Text>{t("Common:LinkNoLongerAvailable")}</Text>;
  if (!entries) return <Text>{t("Common:LoadingProcessing")}</Text>;

  const isEmpty = entries.folders.length === 0 && entries.files.length === 0;

  return (
    <div className={styles.folder}>
      {path.length > 1 ? (
        <Button
          size={ButtonSize.small}
          label={t("Common:Back")}
          onClick={() => setPath(path.slice(0, -1))}
          testId="private_link_back"
        />
      ) : null}
      {isEmpty ? <Text>{t("Common:EmptyFolder")}</Text> : null}
      {entries.folders.map((folder) => (
        <button
          type="button"
          key={`folder-${folder.id}`}
          className={styles.folderRow}
          onClick={() => setPath([...path, Number(folder.id)])}
          data-testid={`private_link_folder_${folder.id}`}
        >
          <Text fontSize="14px" fontWeight="600" truncate>
            {folder.title}
          </Text>
        </button>
      ))}
      {entries.files.map((file) => (
        <VisitorFile key={`file-${file.id}`} t={t} link={link} file={file} />
      ))}
    </div>
  );
};
