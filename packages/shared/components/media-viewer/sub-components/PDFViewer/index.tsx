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

import {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { isDesktop, isMobile } from "react-device-detect";

import classNames from "classnames";
import { loadScript } from "../../../../utils/common";
import { combineUrl } from "../../../../utils/combineUrl";
import { getDocumentServiceLocation } from "../../../../api/files";
import styles from "./PDFViewer.module.scss";
import type {
  ImperativeHandle,
  ToolbarItemType,
} from "../ViewerToolbar/ViewerToolbar.props";
import { ViewerLoader } from "../ViewerLoader";
import { useInterfaceDirection } from "../../../../hooks/useInterfaceDirection";
import PDFViewerProps, { BookMarkType } from "./PDFViewer.props";

import { Sidebar } from "./ui/SideBar";
import { MainPanel } from "./ui/MainPanel";
import { MobileDrawer } from "./ui/MobileDrawer";
import { DesktopDetails } from "../DesktopDetails";
import { ViewerToolbar } from "../ViewerToolbar";

import { ToolbarActionType } from "../../MediaViewer.enums";

import { PageCount, PageCountRef } from "./ui/PageCount";

// import { isDesktop } from "react-device-detect";?
const pdfViewerId = "pdf-viewer";
const MaxScale = 5;
const MinScale = 0.5;

export const PDFViewer = ({
  src,
  title,
  toolbar,
  mobileDetails,
  isPDFSidebarOpen,
  isFistImage,
  isLastImage,
  onNext,
  onPrev,
  onMask,
  generateContextMenu,
  setIsOpenContextMenu,
  setIsPDFSidebarOpen,
}: PDFViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRTL } = useInterfaceDirection();

  // TODO: Add types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfViewer = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfThumbnail = useRef<any>(null);

  const toolbarRef = useRef<ImperativeHandle>(null);
  const pageCountRef = useRef<PageCountRef>(null);

  const [file, setFile] = useState<ArrayBuffer | string | null>();
  const [bookmarks, setBookmarks] = useState<BookMarkType[]>([]);

  const [isLoadedViewerScript, setIsLoadedViewerScript] = useState<boolean>(
    () => {
      const result = document.getElementById(pdfViewerId);
      return result !== null;
    },
  );
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isFileOpened, setIsFileOpened] = useState<boolean>(false);
  const [isOpenMobileDrawer, setIsOpenMobileDrawer] = useState<boolean>(false);

  const initViewer = () => {
    // eslint-disable-next-line no-console
    console.log("init PDF Viewer");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    pdfViewer.current = new window.AscViewer.CViewer("mainPanel", {
      theme: { type: "dark" },
    });

    pdfThumbnail.current =
      pdfViewer.current.createThumbnails("viewer-thumbnail");

    pdfViewer.current.registerEvent(
      "onStructure",
      (structure: BookMarkType[]) => {
        setBookmarks(structure);
      },
    );

    pdfViewer.current.registerEvent("onZoom", (currentZoom: number) => {
      toolbarRef.current?.setPercentValue(currentZoom);
    });

    pdfViewer.current.registerEvent(
      "onCurrentPageChanged",
      (pageNum: number) => {
        pageCountRef.current?.setPageNumber(pageNum + 1);
      },
    );

    pdfViewer.current.registerEvent("onPagesCount", (pagesCount: number) => {
      pageCountRef.current?.setPagesCount(pagesCount);
    });

    pdfViewer.current.registerEvent("onFileOpened", () => {
      setIsFileOpened(true);
      pdfViewer.current.setTargetType("text");
    });

    if (isMobile) {
      pdfViewer.current.setZoomMode(2);
    }
  };

  const loadViewerScript = useCallback(async () => {
    const path = window.ClientConfig?.pdfViewerUrl;
    const { docServiceUrl } = await getDocumentServiceLocation();

    setIsLoadingScript(true);
    loadScript(
      combineUrl(docServiceUrl, path),
      pdfViewerId,
      () => {
        // initViewer();
        setIsLoadedViewerScript(true);
        setIsLoadingScript(false);
      },
      (event: unknown) => {
        setIsLoadingScript(false);
        setIsError(true);
        // eslint-disable-next-line no-console
        console.error(event);
      },
    );
  }, []);

  const resize = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window?.AscViewer?.checkApplicationScale();
    pdfViewer.current?.resize();
    pdfThumbnail.current?.resize();
  }, []);

  const resizePDFThumbnail = useCallback(() => {
    pdfThumbnail.current?.resize();
  }, []);

  const resetState = useCallback(() => {
    setIsLoadingScript(false);
    setIsFileOpened(false);
    setIsLoadingFile(false);
    setIsPDFSidebarOpen(false);
    setIsError(false);
  }, [setIsPDFSidebarOpen]);

  const setZoom = (scale: number) => {
    pdfViewer.current.setZoom(scale);
  };

  const toolbarEvent = (item: ToolbarItemType) => {
    switch (item.actionType) {
      case ToolbarActionType.Panel:
        setIsPDFSidebarOpen((prev) => !prev);
        break;
      case ToolbarActionType.ZoomIn:
      case ToolbarActionType.ZoomOut: {
        if (!pdfViewer.current) return;

        const currentZoom = pdfViewer.current.getZoom();

        const changeBy =
          ToolbarActionType.ZoomOut === item.actionType ? -10 : 10;

        const newZoom = Math.round(currentZoom + changeBy);

        if (newZoom < MinScale * 100 || newZoom > MaxScale * 100) return;

        setZoom(newZoom);
        break;
      }
      case ToolbarActionType.Reset:
        setZoom(100);
        break;
      default:
        break;
    }
  };

  const navigate = (page: number) => {
    pdfViewer.current.navigate(page);
  };

  useEffect(() => {
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [resize]);

  useEffect(() => {
    return () => {
      resetState();
      pdfViewer.current?.close();
    };
  }, [resetState, src]);

  useLayoutEffect(() => {
    if (isError || isLoadedViewerScript) return;
    loadViewerScript();
  }, [isError, isLoadedViewerScript, loadViewerScript]);

  useEffect(() => {
    if (isError) return;

    setIsLoadingFile(true);
    setFile(undefined);

    fetch(src)
      .then((value) => {
        if (!value.ok) throw new Error(value.statusText);

        return value.blob();
      })
      .then((value) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFile(e.target?.result);
        };
        reader.readAsArrayBuffer(value);
      })
      .catch((event) => {
        setIsError(true);
        // eslint-disable-next-line no-console
        console.error(event);
      })
      .finally(() => {
        setIsLoadingFile(false);
      });
  }, [src, isError]);

  useEffect(() => {
    if (isLoadedViewerScript && !isLoadingFile && file) {
      try {
        initViewer();

        pdfViewer.current?.open(file);
      } catch (error) {
        setIsError(true);
        // eslint-disable-next-line no-console
        console.log(error);
      }
    }
  }, [file, isLoadedViewerScript, isLoadingFile]);

  useEffect(() => {
    if (isLoadedViewerScript && containerRef.current?.hasChildNodes()) {
      resize();
    }
  }, [isPDFSidebarOpen, isLoadedViewerScript, isOpenMobileDrawer, resize]);

  if (isError) {
    return (
      <section className={styles.errorWrapper} onClick={onMask}>
        <p className={styles.errorMessage}>Something went wrong</p>
      </section>
    );
  }

  return (
    <>
      {isDesktop ? (
        <DesktopDetails
          title={title}
          onMaskClick={onMask}
          className={classNames(styles.desktopTopBar, {
            [styles.panelOpen]: isPDFSidebarOpen,
          })}
        />
      ) : (
        mobileDetails
      )}

      <div className={styles.viewerWrapper} data-dir={isRTL ? "rtl" : "ltr"}>
        <ViewerLoader
          isLoading={isLoadingFile || isLoadingScript || !isFileOpened}
        />
        {isDesktop ? (
          <Sidebar
            bookmarks={bookmarks}
            isPanelOpen={isPDFSidebarOpen}
            navigate={navigate}
            setIsPDFSidebarOpen={setIsPDFSidebarOpen}
          />
        ) : null}
        <MainPanel
          src={src}
          ref={containerRef}
          setZoom={setZoom}
          onNext={onNext}
          onPrev={onPrev}
          isFistImage={isFistImage}
          isLastImage={isLastImage}
          isLoading={isLoadingFile || isLoadingScript || !isFileOpened}
        />
      </div>

      {isMobile ? (
        <MobileDrawer
          bookmarks={bookmarks}
          resizePDFThumbnail={resizePDFThumbnail}
          isOpenMobileDrawer={isOpenMobileDrawer}
          navigate={navigate}
          setIsOpenMobileDrawer={setIsOpenMobileDrawer}
        />
      ) : null}

      <section className={styles.toolbarWrapper}>
        <PageCount
          ref={pageCountRef}
          isPanelOpen={isPDFSidebarOpen}
          className="pdf-viewer_page-count"
          setIsOpenMobileDrawer={setIsOpenMobileDrawer}
          visible={!isLoadingFile && !isLoadingScript ? isFileOpened : false}
        />

        {isDesktop && !(isLoadingFile || isLoadingScript) ? (
          <ViewerToolbar
            className={classNames(
              styles.toolbar,
              { [styles.panelOpen]: isPDFSidebarOpen },
              "pdf-viewer_toolbar",
            )}
            data-dir={isRTL ? "rtl" : "ltr"}
            ref={toolbarRef}
            percentValue={1}
            toolbar={toolbar}
            toolbarEvent={toolbarEvent}
            generateContextMenu={generateContextMenu}
            setIsOpenContextMenu={setIsOpenContextMenu}
          />
        ) : null}
      </section>
    </>
  );
};
