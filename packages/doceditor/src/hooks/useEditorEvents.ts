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

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import IConfig from "@onlyoffice/document-editor-react/dist/esm/types/model/config";

import {
  createFile,
  getEditDiff,
  getEditHistory,
  getProtectUsers,
  getReferenceData,
  getSharedUsers,
  restoreDocumentsVersion,
  sendEditorNotify,
  startFilling,
} from "@docspace/shared/api/files";
import {
  TEditHistory,
  TGetReferenceData,
  TSharedUsers,
} from "@docspace/shared/api/files/types";
import { EDITOR_ID } from "@docspace/shared/constants";
import {
  assign,
  frameCallCommand,
  frameCallEvent,
} from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { FolderType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import { Nullable } from "@docspace/shared/types";

import { IS_DESKTOP_EDITOR } from "@/utils/constants";

import { isMobile } from "react-device-detect";

import { getCurrentDocumentVersion, setDocumentTitle } from "@/utils";

import {
  TCatchError,
  TDocEditor,
  TEvent,
  THistoryData,
  UseEventsProps,
} from "@/types";

type IConfigEvents = Pick<IConfig, "events">;

let docEditor: TDocEditor | null = null;

const useEditorEvents = ({
  user,
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
}: UseEventsProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [events, setEvents] = React.useState<IConfigEvents>({});
  const [documentReady, setDocumentReady] = React.useState(false);
  const [createUrl, setCreateUrl] = React.useState<Nullable<string>>(null);
  const [usersInRoom, setUsersInRoom] = React.useState<TSharedUsers[]>([]);
  const [docTitle, setDocTitle] = React.useState("");
  const [docSaved, setDocSaved] = React.useState(false);

  const onSDKRequestReferenceData = React.useCallback(async (event: object) => {
    const currEvent = event as TEvent;
    const referenceData = await getReferenceData(
      currEvent.data.referenceData ??
        (currEvent.data as unknown as TGetReferenceData),
    );

    docEditor?.setReferenceData?.(referenceData);
  }, []);

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

        var link = result.link;
        window.open(link, windowName);
      } catch (e) {
        var winEditor = window.open("", windowName);

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
          wrapEl[0].style.height = screen.availHeight + "px";
          window.scrollTo(0, -1);
          wrapEl[0].style.height = window.innerHeight + "px";
        }
      }
    } catch (e) {
      console.error("fixSize failed", e);
    }
  }, [config?.type]);

  const onSDKAppReady = React.useCallback(() => {
    docEditor = window.DocEditor.instances[EDITOR_ID];

    fixSize();

    frameCallCommand("setIsLoaded");

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
        history.pushState({}, "", url.substring(0, index));
      } else {
        if (config?.Error) docEditor?.showMessage?.(config.Error);
      }
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

      history.pushState({}, "", `${pathname}${search}`);
    }
  }, [
    config?.Error,
    errorMessage,
    isSkipError,
    searchParams,
    pathname,
    t,
    fixSize,
  ]);

  const onDocumentReady = React.useCallback(() => {
    // console.log("onDocumentReady", { docEditor });
    setDocumentReady(true);

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
        window as unknown as { [key: string]: {} },
        ["ASC", "Files", "Editor", "docEditor"],
        docEditor,
      ); //Do not remove: it's for Back button on Mobile App
    }
  }, [config?.errorMessage, sdkConfig?.frameId]);

  const getBackUrl = React.useCallback(() => {
    if (!fileInfo) return;
    const search = window.location.search;
    const shareIndex = search.indexOf("share=");
    const key = shareIndex > -1 ? search.substring(shareIndex + 6) : null;

    let backUrl = "";

    if (fileInfo.rootFolderType === FolderType.Rooms) {
      if (key) {
        backUrl = `/rooms/share?key=${key}&folder=${fileInfo.folderId}`;
      } else {
        backUrl = `/rooms/shared/${fileInfo.folderId}/filter?folder=${fileInfo.folderId}`;
      }
    } else {
      if (fileInfo.rootFolderType === FolderType.SHARE) {
        backUrl = `/rooms/personal/filter?folder=recent`;
      } else {
        backUrl = `/rooms/personal/filter?folder=${fileInfo.folderId}`;
      }
    }

    const url = window.location.href;
    const origin = url.substring(0, url.indexOf("/doceditor"));

    return `${combineUrl(origin, backUrl)}`;
  }, [fileInfo]);

  const onSDKRequestClose = React.useCallback(() => {
    const editorGoBack = sdkConfig?.editorGoBack;

    if (editorGoBack === "event") {
      frameCallEvent({ event: "onEditorCloseCallback" });
    } else {
      const backUrl = getBackUrl();
      if (backUrl) window.location.replace(backUrl);
    }
  }, [getBackUrl, sdkConfig?.editorGoBack]);

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
              : "docxf";

      let fileName = t("Common:NewDocument");

      switch (fileExt) {
        case "xlsx":
          fileName = t("Common:NewSpreadsheet");
          break;
        case "pptx":
          fileName = t("Common:NewPresentation");
          break;
        case "docxf":
          fileName = t("Common:NewMasterForm");
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
        const newUrl = combineUrl(
          window.ClientConfig?.proxy?.url,
          `/doceditor?fileId=${encodeURIComponent(newFile.id)}`,
        );
        window.open(newUrl, openOnNewPage ? "_blank" : "_self");
      })
      .catch((e) => {
        toastr.error(e);
      });
  }, [fileInfo?.folderId, getDefaultFileName, openOnNewPage]);

  const getDocumentHistory = React.useCallback(
    (fileHistory: TEditHistory[], historyLength: number) => {
      let result = [];

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

        let obj = {
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
        let errorMessage = "";

        const typedError = error as TCatchError;
        if (typeof typedError === "object") {
          errorMessage =
            ("response" in typedError &&
              typedError?.response?.data?.error?.message) ||
            ("statusText" in typedError && typedError?.statusText) ||
            ("message" in typedError && typedError?.message) ||
            "";
        } else {
          errorMessage = error as string;
        }

        docEditor?.refreshHistory?.({
          error: `${errorMessage}`, //TODO: maybe need to display something else.
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
      let errorMessage = "";
      const typedError = error as TCatchError;
      if (typeof typedError === "object") {
        errorMessage =
          ("response" in typedError &&
            typedError?.response?.data?.error?.message) ||
          ("statusText" in typedError && typedError?.statusText) ||
          ("message" in typedError && typedError?.message) ||
          "";
      } else {
        errorMessage = error as string;
      }
      docEditor?.refreshHistory?.({
        error: `${errorMessage}`, //TODO: maybe need to display something else.
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

        usersNotFound &&
          usersNotFound.length > 0 &&
          docEditor?.showMessage?.(
            t
              ? t("UsersWithoutAccess", {
                  users: usersNotFound,
                })
              : "",
          );
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
        let errorMessage = "";
        const typedError = error as TCatchError;
        if (typeof typedError === "object") {
          errorMessage =
            ("response" in typedError &&
              typedError?.response?.data?.error?.message) ||
            ("statusText" in typedError && typedError?.statusText) ||
            ("message" in typedError && typedError?.message) ||
            "";
        } else {
          errorMessage = error as string;
        }

        docEditor?.setHistoryData?.({
          error: `${errorMessage}`, //TODO: maybe need to display something else.
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
        docSaved
          ? setDocumentTitle(
              t,
              docTitle,
              config?.document.fileType ?? "",
              documentReady,
              successAuth ?? false,
              organizationName,
              setDocTitle,
            )
          : setDocumentTitle(
              t,
              `*${docTitle}`,
              config?.document.fileType ?? "",
              documentReady,
              successAuth ?? false,
              organizationName,
              setDocTitle,
            );
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
    (event: object) => {
      const newTitle = (event as { data: { title: string } }).data.title;
      //const favorite = event.data.favorite;

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

  const onMakeActionLink = React.useCallback((event: object) => {
    const url = window.location.href;

    const actionData = (event as { data: {} }).data;

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

  const generateLink = (actionData: {}) => {
    return encodeURIComponent(JSON.stringify(actionData));
  };

  React.useEffect(() => {
    // console.log("render docspace config", { ...window.ClientConfig });
    if (IS_DESKTOP_EDITOR || (typeof window !== "undefined" && !openOnNewPage))
      return;

    //FireFox security issue fix (onRequestCreateNew will be blocked)
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

  return {
    events,
    createUrl,
    documentReady,
    usersInRoom,

    onDocumentReady,
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
  };
};

export default useEditorEvents;
