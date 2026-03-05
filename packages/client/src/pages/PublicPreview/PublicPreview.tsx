import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { useLoaderData, useRevalidator } from "react-router";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { ValidationStatus } from "@docspace/shared/enums";
import { PublicRoomPasswordForm } from "@docspace/shared/pages/PublicRoom";
import useFilesSettings from "@docspace/ui-kit/selectors/utils/hooks/useFilesSettings";
import type { FilesSettingsDto } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

import PublicPreviewViewer from "./PublicPreview.viewer";
import type { PublicPreviewLoaderProps } from "./PublicPreview.types";

export const PublicPreview = () => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  const { validateData, key, settings } =
    useLoaderData<PublicPreviewLoaderProps>();

  const { getIcon } = useFilesSettings(
    undefined,
    settings as unknown as FilesSettingsDto,
  );

  const onSuccessValidation = () => {
    revalidator.revalidate();
  };

  const getIconString = (size: number, fileExst: string) => {
    const icon = getIcon(fileExst, size);
    return typeof icon === "string" ? icon : "";
  };

  const getIconByExst = (fileExst: string) => getIconString(32, fileExst);

  return match(validateData?.status)
    .with(ValidationStatus.Ok, () => (
      <PublicPreviewViewer
        getIcon={getIconString}
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
        getIcon={getIconByExst}
        validationData={validateData}
        onSuccessValidationCallback={onSuccessValidation}
      />
    ))
    .otherwise(() => {
      return null;
    });
};
