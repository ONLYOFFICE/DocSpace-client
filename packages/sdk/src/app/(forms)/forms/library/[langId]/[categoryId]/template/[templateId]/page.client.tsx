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

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { copyToFolder } from "@docspace/shared/api/files";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import { ConflictResolveType } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { FormsSection } from "@/types/forms";
import { sectionToPath } from "../../../../../../_utils/sectionFromPathname";
import { useLibraryParams } from "../../../../../../_hooks/useLibraryParams";
import { libraryUrl } from "../../../../../../_utils/libraryUrl";
import { useLibraryBreadcrumb } from "../../../../../../_components/library-breadcrumb/LibraryBreadcrumbContext";
import { getThumbnail, setThumbnail } from "../../../../../../_utils/thumbnailCache";
import { useFormsSettingsStore } from "../../../../../../_store/FormsSettingsStore";

import styles from "../../../../../../_components/library-template-detail/LibraryTemplateDetail.module.scss";

const isFileType = (item: unknown): item is TFile =>
  !!item && typeof item === "object" && "fileExst" in item;

const LibraryTemplateRoute = () => {
  const { t } = useTranslation("Common");
  const router = useRouter();
  const { templateId, templateType, langId, categoryId, roomId, libraryId } =
    useLibraryParams();
  const { roomId: storeRoomId, libraryId: storeLibraryId } =
    useFormsSettingsStore();
  const breadcrumb = useLibraryBreadcrumb();
  const breadcrumbRef = useRef(breadcrumb);
  breadcrumbRef.current = breadcrumb;

  const effectiveRoomId = roomId || String(storeRoomId || "");
  const effectiveLibraryId = libraryId || String(storeLibraryId || "");

  const [template, setTemplate] = useState<TFile | TFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  // Fetch template data
  useEffect(() => {
    if (!templateId) return;

    const controller = new AbortController();
    setIsLoading(true);

    if (templateType === "folder") {
      // Fetch folder info
      const filter = FilesFilter.getDefault();
      filter.page = 0;
      filter.pageCount = 1;

      api.files
        .getFolder(templateId, filter, controller.signal)
        .then((res) => {
          if (!controller.signal.aborted) {
            setTemplate(res.current);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    } else {
      // Fetch the category folder to find the file
      if (!categoryId) {
        setIsLoading(false);
        return;
      }

      const filter = FilesFilter.getDefault();
      filter.page = 0;
      filter.pageCount = 100;

      api.files
        .getFolder(categoryId, filter, controller.signal)
        .then((res) => {
          if (controller.signal.aborted) return;

          // Update breadcrumb category title
          if (breadcrumbRef.current && res.current) {
            breadcrumbRef.current.setCategoryInfo(
              String(res.current.id),
              res.current.title,
            );
          }

          const file = res.files.find((f) => String(f.id) === String(templateId));
          if (file) {
            setTemplate(file);
          }
          setIsLoading(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }

    return () => controller.abort();
  }, [templateId, templateType, categoryId]);

  // Thumbnail
  const templateIsFile = isFileType(template);
  const thumbUrl =
    templateIsFile && template.thumbnailUrl
      ? template.thumbnailUrl.replace(/^https?:\/\/[^/]+/, "")
      : "";
  const [blobThumbnail, setBlobThumbnail] = useState("");

  useEffect(() => {
    if (!thumbUrl) return;

    const cached = getThumbnail(thumbUrl);
    if (cached) {
      setBlobThumbnail(cached);
      return;
    }

    let cancelled = false;
    fetch(thumbUrl, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(blob);
        setThumbnail(thumbUrl, blobUrl);
        setBlobThumbnail(blobUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [thumbUrl]);

  const handleUseTemplate = useCallback(async () => {
    if (!template) return;

    // For folders: navigate into the folder
    if (!templateIsFile) {
      router.push(
        libraryUrl({
          langId: langId ?? undefined,
          categoryId: template.id,
          roomId: effectiveRoomId || undefined,
          libraryId: effectiveLibraryId || undefined,
        }),
      );
      return;
    }

    if (isCopying || !effectiveRoomId) return;

    setIsCopying(true);
    try {
      const operations = await copyToFolder(
        Number(effectiveRoomId),
        [],
        [template.id as number],
        ConflictResolveType.Duplicate,
        false,
      );

      const op = operations?.[0];
      if (op?.error) {
        toastr.error(op.error);
        return;
      }

      const params = new URLSearchParams();
      if (effectiveRoomId) params.set("roomId", effectiveRoomId);
      if (effectiveLibraryId) params.set("libraryId", effectiveLibraryId);
      const qs = params.toString();

      router.push(
        `${sectionToPath(FormsSection.MyForms)}${qs ? `?${qs}` : ""}`,
      );
    } catch (error) {
      toastr.error(error as string);
    } finally {
      setIsCopying(false);
    }
  }, [
    template,
    templateIsFile,
    isCopying,
    effectiveRoomId,
    effectiveLibraryId,
    langId,
    router,
  ]);

  if (isLoading || !template) return null;

  const title = template.title.replace(/\.pdf$/i, "");
  const updatedDate = template.updated
    ? new Date(template.updated).toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.preview}>
            {blobThumbnail
              ? // biome-ignore lint/performance/noImgElement: blob URL not supported by next/image
                (<img
                  className={styles.thumbnail}
                  src={blobThumbnail}
                  alt={title}
                  draggable={false}
                />)
              : (<div className={styles.thumbnailPlaceholder} />
            )}
          </div>

          <div className={styles.howItWorks}>
            <h3 className={styles.sectionTitle}>
              {t("Common:LibraryHowItWorks")}
            </h3>
            <ol className={styles.stepsList}>
              <li className={styles.stepItem}>
                <span className={styles.stepNumber}>1</span>
                <div>
                  <div className={styles.stepTitle}>
                    {t("Common:LibraryStep1Title")}
                  </div>
                  <div className={styles.stepDesc}>
                    {t("Common:LibraryStep1DescShort")}
                  </div>
                </div>
              </li>
              <li className={styles.stepItem}>
                <span className={styles.stepNumber}>2</span>
                <div>
                  <div className={styles.stepTitle}>
                    {t("Common:LibraryStep2Title")}
                  </div>
                  <div className={styles.stepDesc}>
                    {t("Common:LibraryStep2Desc")}
                  </div>
                </div>
              </li>
              <li className={styles.stepItem}>
                <span className={styles.stepNumber}>3</span>
                <div>
                  <div className={styles.stepTitle}>
                    {t("Common:LibraryStep3Title")}
                  </div>
                  <div className={styles.stepDesc}>
                    {t("Common:LibraryStep3Desc")}
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <h1 className={styles.title}>{title}</h1>

          <div className={styles.metaRow}>
            {updatedDate && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  {t("Common:LibraryTemplateLastRevision")}
                </span>
                <span className={styles.metaValue}>{updatedDate}</span>
              </div>
            )}
            {templateIsFile && template.fileExst && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  {t("Common:LibraryTemplateFormat")}
                </span>
                <span className={styles.metaValue}>
                  {template.fileExst.replace(".", "").toUpperCase()}
                </span>
              </div>
            )}
            {!templateIsFile && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  {t("Common:LibraryTemplateFormat")}
                </span>
                <span className={styles.metaValue}>PDF</span>
              </div>
            )}
            {templateIsFile && template.contentLength && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  {t("Common:LibraryTemplateSize")}
                </span>
                <span className={styles.metaValue}>
                  {template.contentLength}
                </span>
              </div>
            )}
          </div>

          <Button
            className={styles.useButton}
            label={
              isCopying
                ? t("Common:CopyingTemplate")
                : t("Common:UseTemplate")
            }
            size={ButtonSize.normal}
            onClick={handleUseTemplate}
            isDisabled={isCopying}
            isLoading={isCopying}
            primary
          />

          <div className={styles.description}>
            <h3 className={styles.sectionTitle}>
              {t("Common:LibraryTemplateAbout")}
            </h3>
            <p className={styles.descriptionText}>
              {t("Common:LibraryTemplateAboutText")}
            </p>
          </div>

          <div className={styles.description}>
            <h3 className={styles.sectionTitle}>
              {t("Common:LibraryTemplateHowTo")}
            </h3>
            <p className={styles.descriptionText}>
              {t("Common:LibraryTemplateHowToText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryTemplateRoute;
