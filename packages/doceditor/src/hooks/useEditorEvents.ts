// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useCallback } from "react";
import isUndefined from "lodash/isUndefined";
import { useSearchParams } from "next/navigation";

import {
  addFileToRecentlyViewed,
  createFile,
  getEditDiff,
  getEditHistory,
  getProtectUsers,
  getReferenceData,
  getSharedUsers,
  openEdit,
  restoreDocumentsVersion,
  sendEditorNotify,
  markAsFavorite,
  removeFromFavorite,
} from "@docspace/shared/api/files";
import {
  TEditHistory,
  TGetReferenceData,
  TSharedUsers,
} from "@docspace/shared/api/files/types";
import { EDITOR_ID, FILLING_STATUS_ID } from "@docspace/shared/constants";
import {
  assign,
  frameCallCommand,
  frameCallEvent,
} from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { StartFillingMode } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { Nullable } from "@docspace/shared/types";

import { IS_DESKTOP_EDITOR } from "@/utils/constants";

import { isMobile } from "react-device-detect";

import {
  getCurrentDocumentVersion,
  isFormRole,
  setDocumentTitle,
} from "@/utils";

import {
  TCatchError,
  TDocEditor,
  TEvent,
  THistoryData,
  UseEventsProps,
} from "@/types";
import { onSDKInfo, type TInfoEvent } from "@/utils/events";

let docEditor: TDocEditor | null = null;

const useEditorEvents = ({
  successAuth,
  fileInfo,
  config,
  doc,
  errorMessage,
  isSkipError,
  openOnNewPage,
  t,
  sdkConfig,
  organizationName,
  shareKey,
  setFillingStatusDialogVisible,
  openShareFormDialog,
  onStartFillingVDRPanel,
}: UseEventsProps) => {
  const searchParams = useSearchParams();

  const [documentReady, setDocumentReady] = React.useState(false);
  const [createUrl, setCreateUrl] = React.useState<Nullable<string>>(null);
  const [usersInRoom, setUsersInRoom] = React.useState<TSharedUsers[]>([]);
  const [docTitle, setDocTitle] = React.useState("");
  const [docSaved, setDocSaved] = React.useState(false);

  const onSDKRequestReferenceData = React.useCallback(
    async (event: object) => {
      const currEvent = event as TEvent;

      const link = currEvent?.data?.link ?? "";
      const reference = currEvent?.data?.referenceData;
      const path = currEvent?.data?.path ?? "";

      // (inDto.FileKey, inDto.InstanceId, inDto.SourceFileId, inDto.Path, inDto.Link);
      // string fileId, string portalName, T sourceFileId, string path, string link
      const data = {
        fileKey: reference?.fileKey ?? "",
        instanceId: reference?.instanceId ?? "",
        sourceFileId: fileInfo?.id,
        path,
        link,
      } as TGetReferenceData;

      const referenceData = await getReferenceData(data);

      docEditor?.setReferenceData?.(referenceData);
    },
    [fileInfo?.id],
  );

  const onSDKRequestOpen = React.useCallback(
    async (event: object) => {
      const currEvent = event as TEvent;
      const windowName = currEvent.data.windowName;
      const reference = currEvent.data;

      try {
        const data = {
          fileKey: reference.referenceData
            ? reference.referenceData.fileKey
            : "",
          instanceId: reference.referenceData
            ? reference.referenceData.instanceId
            : "",
          fileId: fileInfo?.id,
          path: reference.path || "",
        };

        const result = await getReferenceData(data);

        if (result.error) throw new Error(result.error);

        const link = result.link;
        window.open(link, windowName);
      } catch (e) {
        const winEditor = window.open("", windowName);

        winEditor?.close();
        docEditor?.showMessage?.(
          (e as { message?: string })?.message ??
            t("ErrorConnectionLost") ??
            "",
        );
      }
    },
    [fileInfo?.id, t],
  );

  const fixSize = React.useCallback(() => {
    try {
      // fix the editor sizes - bug 57099
      if (config?.type === "mobile") {
        const wrapEl = document.getElementsByTagName("iframe");
        if (wrapEl.length) {
          wrapEl[0].style.height = `${window.screen.availHeight}px`;
          window.scrollTo(0, -1);
          wrapEl[0].style.height = `${window.innerHeight}px`;
        }
      }
    } catch (e) {
      console.error("fixSize failed", e);
    }
  }, [config?.type]);

  const checkAndRequestRoles = useCallback(() => {
    const fillingStatus = window?.sessionStorage.getItem(FILLING_STATUS_ID);

    if (fillingStatus === "true") {
      docEditor?.requestRoles?.();
      window?.sessionStorage.removeItem(FILLING_STATUS_ID);
    }
  }, []);

  const onSDKAppReady = React.useCallback(() => {
    docEditor = window.DocEditor.instances[EDITOR_ID];

    fixSize();

    if (errorMessage || isSkipError)
      return docEditor?.showMessage?.(errorMessage || t("Common:InvalidLink"));

    console.log("ONLYOFFICE Document Editor is ready", docEditor);
    const url = window.location.href;

    const index = url.indexOf("#message/");

    if (index > -1) {
      const splitUrl = url.split("#message/");

      if (splitUrl.length === 2) {
        const message = decodeURIComponent(splitUrl[1]).replace(/\+/g, " ");

        docEditor?.showMessage?.(message);
        window.history.pushState({}, "", url.substring(0, index));
      } else if (config?.Error) docEditor?.showMessage?.(config.Error);
    }

    const message = searchParams.get("message");

    if (message) {
      docEditor?.showMessage?.(message);
      let search = "?";
      let idx = 0;
      searchParams.forEach((value, key) => {
        if (key !== "message") {
          if (idx) search += "&";
          idx++;
          search += `${key}=${value}`;
        }
      });

      window.history.pushState({}, "", `/doceditor${search}`);
    }
  }, [config?.Error, errorMessage, isSkipError, searchParams, t, fixSize]);

  const onDocumentReady = React.useCallback(() => {
    // console.log("onDocumentReady", { docEditor });
    setDocumentReady(true);

    frameCallCommand("setIsLoaded");
    checkAndRequestRoles();

    frameCallEvent({
      event: "onAppReady",
      data: { frameId: sdkConfig?.frameId },
    });

    if (config?.errorMessage) docEditor?.showMessage?.(config.errorMessage);

    // if (config?.file?.canShare) {
    //   loadUsersRightsList(docEditor);
    // }

    if (docEditor) {
      // console.log("call assign for asc files editor doceditor");
      assign(
        window as unknown as { [key: string]: object },
        ["ASC", "Files", "Editor", "docEditor"],
        docEditor,
      ); // Do not remove: it's for Back button on Mobile App
    }
  }, [config?.errorMessage, sdkConfig?.frameId, checkAndRequestRoles]);

  const onUserActionRequired = React.useCallback(() => {
    frameCallCommand("setIsLoaded");
  }, []);

  const onSDKRequestClose = React.useCallback(() => {
    const editorGoBack = sdkConfig?.editorGoBack;

    if (editorGoBack === "event") {
      frameCallEvent({ event: "onEditorCloseCallback" });
    } else {
      const backUrl = config?.editorConfig?.customization?.goback?.url;

      if (backUrl) window.location.replace(backUrl);
    }
  }, [
    sdkConfig?.editorGoBack,
    config?.editorConfig?.customization?.goback?.url,
  ]);

  const getDefaultFileName = React.useCallback(
    (withExt = false) => {
      const documentType = config?.documentType;

      const fileExt =
        documentType === "word"
          ? "docx"
          : documentType === "slide"
            ? "pptx"
            : documentType === "cell"
              ? "xlsx"
              : "pdf";

      let fileName = t("Common:NewDocument");

      switch (fileExt) {
        case "xlsx":
          fileName = t("Common:NewSpreadsheet");
          break;
        case "pptx":
          fileName = t("Common:NewPresentation");
          break;
        case "pdf":
          fileName = t("Common:NewPDFForm");
          break;
        default:
          break;
      }

      if (withExt) {
        fileName = `${fileName}.${fileExt}`;
      }

      return fileName;
    },
    [config?.documentType, t],
  );

  const onSDKRequestCreateNew = React.useCallback(() => {
    const defaultFileName = getDefaultFileName(true);

    if (!fileInfo?.folderId) return;

    createFile(fileInfo.folderId, defaultFileName ?? "")
      ?.then((newFile) => {
        const searchQuery = new URLSearchParams({
          fileId: newFile.id.toString(),
        });

        if (newFile.isForm && newFile.security.Edit) {
          searchQuery.append("action", "edit");
        }

        const newUrl = combineUrl(
          window.ClientConfig?.proxy?.url,
          `/doceditor?${searchQuery.toString()}`,
        );
        window.open(newUrl, openOnNewPage ? "_blank" : "_self");
      })
      .catch((e) => {
        toastr.error(e);
      });
  }, [fileInfo?.folderId, getDefaultFileName, openOnNewPage]);

  const getDocumentHistory = React.useCallback(
    (fileHistory: TEditHistory[], historyLength: number) => {
      const result = [];

      for (let i = 0; i < historyLength; i++) {
        const changes = fileHistory[i].changes;
        const serverVersion = fileHistory[i].serverVersion;
        const version = fileHistory[i].version;
        const versionGroup = fileHistory[i].versionGroup;

        const changesModified = [...changes];

        changesModified.forEach((item) => {
          item.created = `${new Date(item.created).toLocaleString(
            config?.editorConfig.lang,
          )}`;
        });

        const obj = {
          ...(changes.length !== 0 && { changes: changesModified }),
          created: `${new Date(fileHistory[i].created).toLocaleString(
            config?.editorConfig.lang,
          )}`,
          ...(serverVersion && { serverVersion }),
          key: fileHistory[i].key,
          user: {
            id: fileHistory[i].user.id,
            name: fileHistory[i].user.name,
          },
          version,
          versionGroup,
        };

        result.push(obj);
      }
      return result;
    },
    [config?.editorConfig.lang],
  );

  const onSDKRequestRestore = React.useCallback(
    async (event: object) => {
      const restoreVersion = (event as TEvent).data.version;

      if (!fileInfo?.id) return;
      try {
        const updateVersions = await restoreDocumentsVersion(
          fileInfo.id,
          restoreVersion ?? 0,
          doc ?? "",
        );
        const historyLength = updateVersions.length;
        docEditor?.refreshHistory?.({
          currentVersion: getCurrentDocumentVersion(
            updateVersions,
            historyLength,
          ),
          history: getDocumentHistory(updateVersions, historyLength),
        });
      } catch (error) {
        let newErrorMessage = "";

        const typedError = error as TCatchError;
        if (typeof typedError === "object") {
          newErrorMessage =
            ("response" in typedError &&
              typedError?.response?.data?.error?.message) ||
            ("statusText" in typedError && typedError?.statusText) ||
            ("message" in typedError && typedError?.message) ||
            "";
        } else {
          newErrorMessage = error as string;
        }

        docEditor?.refreshHistory?.({
          error: `${newErrorMessage}`, // TODO: maybe need to display something else.
        });
      }
    },
    [doc, fileInfo?.id, getDocumentHistory],
  );

  const onSDKRequestHistory = React.useCallback(async () => {
    try {
      //   const search = window.location.search;
      //   const shareIndex = search.indexOf("share=");
      //   const requestToken =
      //     shareIndex > -1 ? search.substring(shareIndex + 6) : null;
      //   const docIdx = search.indexOf("doc=");

      if (!fileInfo?.id) return;

      const fileHistory = await getEditHistory(fileInfo.id, doc ?? "");
      const historyLength = fileHistory.length;

      docEditor?.refreshHistory?.({
        currentVersion: getCurrentDocumentVersion(fileHistory, historyLength),
        history: getDocumentHistory(fileHistory, historyLength),
      });
    } catch (error) {
      let newErrorMessage = "";
      const typedError = error as TCatchError;
      if (typeof typedError === "object") {
        newErrorMessage =
          ("response" in typedError &&
            typedError?.response?.data?.error?.message) ||
          ("statusText" in typedError && typedError?.statusText) ||
          ("message" in typedError && typedError?.message) ||
          "";
      } else {
        newErrorMessage = error as string;
      }
      docEditor?.refreshHistory?.({
        error: `${newErrorMessage}`, // TODO: maybe need to display something else.
      });
    }
  }, [doc, fileInfo?.id, getDocumentHistory]);

  const onSDKRequestSendNotify = React.useCallback(
    async (event: object) => {
      const currEvent = event as TEvent;

      const actionData = currEvent.data.actionLink;
      const comment = currEvent.data.message;
      const emails = currEvent.data.emails;

      if (!fileInfo?.id) return;
      try {
        await sendEditorNotify(
          fileInfo.id,
          actionData ?? "",
          emails ?? [],
          comment ?? "",
        );

        if (usersInRoom.length === 0) return;

        const usersNotFound = emails?.filter((row) =>
          usersInRoom.every((value) => {
            return row !== value.email;
          }),
        );

        if (usersNotFound && usersNotFound.length > 0) {
          docEditor?.showMessage?.(
            t
              ? t("UsersWithoutAccess", {
                  users: usersNotFound,
                })
              : "",
          );
        }
      } catch (e) {
        toastr.error(e as TData);
      }
    },
    [fileInfo?.id, t, usersInRoom],
  );

  const onSDKRequestUsers = React.useCallback(
    async (event: object) => {
      try {
        const currEvent = event as TEvent;
        const c = currEvent?.data?.c;
        if (!fileInfo?.id) return;
        const users = await (c == "protect"
          ? getProtectUsers(fileInfo.id)
          : getSharedUsers(fileInfo.id));

        if (c !== "protect") {
          setUsersInRoom(users);
        }

        docEditor?.setUsers?.({
          c: c ?? "",
          users,
        });
      } catch (e) {
        docEditor?.showMessage?.(
          ((e as { message?: string })?.message || t("ErrorConnectionLost")) ??
            "",
        );
      }
    },
    [fileInfo?.id, t],
  );

  const onSDKRequestHistoryData = React.useCallback(
    async (event: object) => {
      const version = (event as { data: number }).data;

      try {
        // const search = window.location.search;
        // const shareIndex = search.indexOf("share=");
        // const requestToken =
        //   shareIndex > -1 ? search.substring(shareIndex + 6) : null;
        if (!fileInfo?.id) return;
        const versionDifference = await getEditDiff(
          fileInfo.id,
          version,
          doc ?? "",
          // requestToken,
        );
        const changesUrl = versionDifference.changesUrl;
        const previous = versionDifference.previous;
        const token = versionDifference.token;

        const obj: THistoryData = {
          url: versionDifference.url,
          version,
          key: versionDifference.key,
          fileType: versionDifference.fileType,
        };

        if (changesUrl) obj.changesUrl = changesUrl;
        if (previous)
          obj.previous = {
            fileType: previous.fileType,
            key: previous.key,
            url: previous.url,
          };
        if (token) obj.token = token;

        docEditor?.setHistoryData?.(obj);
      } catch (error) {
        let newErrorMessage = "";
        const typedError = error as TCatchError;
        if (typeof typedError === "object") {
          newErrorMessage =
            ("response" in typedError &&
              typedError?.response?.data?.error?.message) ||
            ("statusText" in typedError && typedError?.statusText) ||
            ("message" in typedError && typedError?.message) ||
            "";
        } else {
          newErrorMessage = error as string;
        }

        docEditor?.setHistoryData?.({
          error: `${newErrorMessage}`, // TODO: maybe need to display something else.
          version,
        });
      }
    },
    [doc, fileInfo?.id],
  );

  const onDocumentStateChange = React.useCallback(
    (event: object) => {
      if (!documentReady) return;

      setDocSaved(!(event as { data: boolean }).data);

      setTimeout(() => {
        if (docSaved) {
          setDocumentTitle(
            t,
            docTitle,
            config?.document.fileType ?? "",
            documentReady,
            successAuth ?? false,
            organizationName,
            setDocTitle,
          );
        } else {
          setDocumentTitle(
            t,
            `*${docTitle}`,
            config?.document.fileType ?? "",
            documentReady,
            successAuth ?? false,
            organizationName,
            setDocTitle,
          );
        }
      }, 500);
    },
    [
      t,
      config?.document.fileType,
      docSaved,
      docTitle,
      documentReady,
      successAuth,
      organizationName,
    ],
  );

  const onMetaChange = React.useCallback(
    async (event: object) => {
      const newTitle = (event as { data: { title: string } }).data.title;
      const favorite = (event as { data: { favorite: boolean } }).data.favorite;

      if (favorite !== fileInfo?.isFavorite && fileInfo?.id) {
        try {
          if (favorite) {
            await markAsFavorite([fileInfo.id], []);
          } else {
            await removeFromFavorite([fileInfo.id], []);
          }
        } catch (error) {
          console.error(error);
        } finally {
          docEditor?.setFavorite?.(favorite);
        }
      }

      if (newTitle && newTitle !== docTitle) {
        setDocumentTitle(
          t,
          newTitle,
          config?.document.fileType ?? "",
          documentReady,
          successAuth ?? false,
          organizationName,
          setDocTitle,
        );
        setDocTitle(newTitle);
      }
    },
    [
      t,
      config?.document.fileType,
      docTitle,
      documentReady,
      successAuth,
      organizationName,
    ],
  );

  const generateLink = (actionData: object) => {
    return encodeURIComponent(JSON.stringify(actionData));
  };

  const onMakeActionLink = React.useCallback((event: object) => {
    const url = window.location.href;

    const actionData = (event as { data: object }).data;

    const link = generateLink(actionData);

    const urlFormation = url.split("&anchor=")[0];

    const linkFormation = `${urlFormation}&anchor=${link}`;

    docEditor?.setActionLink?.(linkFormation);
  }, []);

  // const onRequestStartFilling = React.useCallback(
  //   (event: object) => {
  //     console.log("onRequestStartFilling", { event });

  //     if (!fileInfo?.id) return;

  //     docEditor?.startFilling?.();
  //     startFilling(fileInfo?.id);
  //   },
  //   [fileInfo?.id],
  // );

  React.useEffect(() => {
    // console.log("render docspace config", { ...window.ClientConfig });
    if (IS_DESKTOP_EDITOR || (typeof window !== "undefined" && !openOnNewPage))
      return;

    // FireFox security issue fix (onRequestCreateNew will be blocked)
    const documentType = config?.documentType || "word";
    const defaultFileName = getDefaultFileName();
    const url = new URL(
      combineUrl(
        window.location.origin,
        window.ClientConfig?.proxy?.url,
        "/filehandler.ashx",
      ),
    );
    url.searchParams.append("action", "create");
    url.searchParams.append("doctype", documentType);
    url.searchParams.append("title", defaultFileName ?? "");
    setCreateUrl(url.toString());
  }, [config?.documentType, getDefaultFileName, openOnNewPage]);

  const onOrientationChange = React.useCallback(() => {
    fixSize();
  }, [fixSize]);

  React.useEffect(() => {
    if (isMobile) {
      if (window.screen?.orientation) {
        window.screen.orientation.addEventListener(
          "change",
          onOrientationChange,
        );
      } else {
        window.addEventListener("orientationchange", onOrientationChange);
      }
    }

    return () => {
      window.removeEventListener("orientationchange", onOrientationChange);
      window.screen?.orientation?.removeEventListener(
        "change",
        onOrientationChange,
      );
    };
  }, [onOrientationChange]);

  const onSubmit = useCallback(() => {
    const origin = window.location.origin;

    const otherSearchParams = new URLSearchParams();

    const roomId = config?.document?.referenceData.roomId;
    const fileId = fileInfo?.id;

    if (config?.fillingSessionId)
      otherSearchParams.append("fillingSessionId", config.fillingSessionId);

    if (config?.startFillingMode === StartFillingMode.StartFilling) {
      otherSearchParams.append(
        "type",
        StartFillingMode.StartFilling.toString(),
      );

      if (!isUndefined(fileId)) {
        otherSearchParams.append("formId", fileId.toString());
      }

      if (!isUndefined(roomId)) {
        otherSearchParams.append("roomId", roomId);
      }
    }

    const combinedSearchParams = new URLSearchParams({
      ...Object.fromEntries(searchParams),
      ...Object.fromEntries(otherSearchParams),
    });

    window.location.replace(
      `${origin}/doceditor/completed-form?${combinedSearchParams.toString()}`,
    );
  }, [
    config?.document?.referenceData.roomId,
    config?.fillingSessionId,
    config?.startFillingMode,
    fileInfo?.id,
    searchParams,
  ]);

  const onRequestFillingStatus = useCallback(() => {
    setFillingStatusDialogVisible?.(true);
  }, [setFillingStatusDialogVisible]);

  const onRequestStartFilling = useCallback(
    (event: object) => {
      switch (config?.startFillingMode) {
        case StartFillingMode.ShareToFillOut:
          openShareFormDialog?.();
          break;

        case StartFillingMode.StartFilling:
          if (
            typeof event === "object" &&
            event !== null &&
            "data" in event &&
            isFormRole(event.data)
          ) {
            onStartFillingVDRPanel?.(event.data);
          }
          break;
        default:
          break;
      }
    },
    [config?.startFillingMode, openShareFormDialog, onStartFillingVDRPanel],
  );

  const onRequestRefreshFile = React.useCallback(async () => {
    if (!fileInfo?.id) return;

    const res = await openEdit(
      fileInfo.id,
      undefined,
      doc,
      config?.editorConfig.mode,
      undefined,
      shareKey,
      config?.editorType,
      config?.editorConfig.mode,
    );

    window.DocEditor?.instances[EDITOR_ID]?.refreshFile(res);
  }, [
    fileInfo?.id,
    doc,
    shareKey,
    config?.editorType,
    config?.editorConfig.mode,
  ]);

  const onInfo = React.useCallback(
    async (e: object) => {
      onSDKInfo(e);

      const mode = (e as TInfoEvent).data.mode;

      // Documents opened in "view" mode currently cannot be added to Recent automatically on the server,
      // so they are added manually on the client.
      if (successAuth && fileInfo?.id && mode === "view") {
        addFileToRecentlyViewed(fileInfo.id);
      }
    },
    [onSDKInfo, successAuth, fileInfo?.id],
  );

  return {
    createUrl,
    documentReady,
    usersInRoom,

    onDocumentReady,
    onUserActionRequired,
    onSDKRequestOpen,
    onSDKRequestReferenceData,
    onSDKAppReady,
    onSDKRequestClose,
    onSDKRequestCreateNew,
    onSDKRequestHistory,
    onSDKRequestUsers,
    onSDKRequestSendNotify,
    onSDKRequestRestore,
    onSDKRequestHistoryData,
    onDocumentStateChange,
    onMetaChange,
    onMakeActionLink,
    // onRequestStartFilling,
    setDocTitle,
    onSubmit,
    onRequestFillingStatus,
    onRequestStartFilling,
    onRequestRefreshFile,
    onInfo,
  };
};

export default useEditorEvents;
