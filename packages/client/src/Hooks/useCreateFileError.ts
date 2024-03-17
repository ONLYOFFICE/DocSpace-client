import React from "react";
import { useTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";

type UseCreateFileErrorProps = {
  setPortalTariff: Function;
  setFormCreationInfo: Function;
  setConvertPasswordDialogVisible: Function;
};

const useCreateFileError = ({
  setPortalTariff,
  setFormCreationInfo,
  setConvertPasswordDialogVisible,
}: UseCreateFileErrorProps) => {
  const alreadyUsed = React.useRef(false);

  const { t, ready } = useTranslation(["Common", "Translations"]);

  React.useEffect(() => {
    if (alreadyUsed.current || !ready) return;
    alreadyUsed.current = true;
    const searchParams = new URLSearchParams(window.location.search);

    const createError = searchParams.get("createError");
    if (!createError) return;

    const error = JSON.parse(createError);

    toastr.error(t("Translations:FileProtected"), t("Common:Warning"));

    setFormCreationInfo?.({
      newTitle: error?.fileInfo?.title,
      fromExst: ".docx",
      toExst: error?.fileInfo?.extension,
      open: error?.fileInfo?.open === "true",
      actionId: error?.fileInfo?.id,
      fileInfo: {
        id: error?.fileInfo?.templateId,
        folderId: Number(error?.fileInfo?.parentId),
        fileExst: error?.fileInfo?.extension,
      },
    });
    setConvertPasswordDialogVisible?.(true);
  }, [
    setConvertPasswordDialogVisible,
    setFormCreationInfo,
    setPortalTariff,
    t,
    ready,
  ]);
};

export default useCreateFileError;
