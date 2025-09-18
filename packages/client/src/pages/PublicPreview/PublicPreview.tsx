import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { useLoaderData, useRevalidator } from "react-router";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { ValidationStatus } from "@docspace/shared/enums";
import { PublicRoomPasswordForm } from "@docspace/shared/pages/PublicRoom";
import useFilesSettings from "@docspace/shared/selectors/utils/hooks/useFilesSettings";

import PublicPreviewViewer from "./PublicPreview.viewer";
import type { PublicPreviewLoaderProps } from "./PublicPreview.types";

export const PublicPreview = () => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  const { validateData, key, settings } =
    useLoaderData<PublicPreviewLoaderProps>();

  const { getIcon } = useFilesSettings(undefined, settings);

  const onSuccessValidation = () => {
    revalidator.revalidate();
  };

  return match(validateData.status)
    .with(ValidationStatus.Ok, () => (
      <PublicPreviewViewer
        getIcon={(size: number, fileExst: string) => getIcon(fileExst, size)}
        extsImagePreviewed={settings.extsImagePreviewed}
      />
    ))
    .with(ValidationStatus.ExternalAccessDenied, () => {
      if (typeof window === "undefined") return;

      const pathName = window.location.pathname;
      const searchName = window.location.search;

      window.location.href = combineUrl(
        window.ClientConfig?.proxy?.url,
        "/login",
        `?referenceUrl=${pathName}${searchName}`,
      );
    })
    .with(ValidationStatus.Password, () => (
      <PublicRoomPasswordForm
        t={t}
        roomKey={key}
        getIcon={getIcon}
        validationData={validateData}
        onSuccessValidationCallback={onSuccessValidation}
      />
    ))
    .otherwise(() => {
      return null;
    });
};
