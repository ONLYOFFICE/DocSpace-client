import React, { useState, useRef, useEffect } from "react";

import { useDropzone } from "react-dropzone";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'resi... Remove this comment to see the full error message
import resizeImage from "resize-image";

import Loader from "../../loader";

import { toastr } from "../../";

import { ColorTheme, ThemeType } from "../../ColorTheme";
import StyledDropzone from "./StyledDropzone";

const ONE_MEGABYTE = 1024 * 1024;
const COMPRESSION_RATIO = 2;
const NO_COMPRESSION_RATIO = 1;

const Dropzone = ({
  t,
  setUploadedFile,
  isDisabled
}: any) => {
  const [loadingFile, setLoadingFile] = useState(false);
  const mount = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
      timer.current && clearTimeout(timer.current);
    };
  }, []);

  // @ts-expect-error TS(7023): 'resizeRecursiveAsync' implicitly has return type ... Remove this comment to see the full error message
  async function resizeRecursiveAsync(
    img: any,
    canvas: any,
    compressionRatio = COMPRESSION_RATIO,
    depth = 0
  ) {
    const data = resizeImage.resize(
      canvas,
      img.width / compressionRatio,
      img.height / compressionRatio,
      resizeImage.JPEG
    );

    const file = await fetch(data)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "File name", {
          type: "image/jpg",
        });
        return file;
      });

    const stepMessage = `Step ${depth + 1}`;
    const sizeMessage = `size = ${file.size} bytes`;
    const compressionRatioMessage = `compressionRatio = ${compressionRatio}`;

    console.log(`${stepMessage} ${sizeMessage} ${compressionRatioMessage}`);

    if (file.size < ONE_MEGABYTE) {
      return file;
    }

    if (depth > 5) {
      console.log("start");
      throw new Error("recursion depth exceeded");
    }

    return await resizeRecursiveAsync(
      img,
      canvas,
      compressionRatio + 1,
      depth + 1
    );
  }

  // @ts-expect-error TS(7031): Binding element 'file' implicitly has an 'any' typ... Remove this comment to see the full error message
  const onDrop = async ([file]) => {
    // @ts-expect-error TS(2322): Type 'Timeout' is not assignable to type 'null'.
    timer.current = setTimeout(() => {
      setLoadingFile(true);
    }, 50);
    try {
      const imageBitMap = await createImageBitmap(file);

      const width = imageBitMap.width;
      const height = imageBitMap.height;
      const canvas = resizeImage.resize2Canvas(imageBitMap, width, height);

      resizeRecursiveAsync(
        { width, height },
        canvas,
        file.size > ONE_MEGABYTE ? COMPRESSION_RATIO : NO_COMPRESSION_RATIO
      )
        .then((file: any) => {
          if (mount.current) {
            setUploadedFile(file);
          }
        })
        .catch((error: any) => {
          if (
            error instanceof Error &&
            error.message === "recursion depth exceeded"
          ) {
            // @ts-expect-error TS(2554): Expected 5 arguments, but got 1.
            toastr.error(t("Common:SizeImageLarge"));
          }
          console.error(error);
        })
        .finally(() => {
          timer.current && clearTimeout(timer.current);
          if (mount.current) {
            setLoadingFile(false);
          }
        });
    } catch (error) {
      console.error(error);
      // @ts-expect-error TS(2554): Expected 5 arguments, but got 1.
      toastr.error(t("Common:NotSupportedFormat"));
      timer.current && clearTimeout(timer.current);
      if (mount.current) {
        setLoadingFile(false);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 0,
    noClick: isDisabled,
    noKeyboard: isDisabled,
    // maxSize: 1000000,
    accept: ["image/png", "image/jpeg"],
    // @ts-expect-error TS(2322): Type '([file]: [any]) => Promise<void>' is not ass... Remove this comment to see the full error message
    onDrop,
  });

  return (
    // @ts-expect-error TS(2769): No overload matches this call.
    <StyledDropzone $isLoading={loadingFile}>
      {loadingFile && (
        <Loader className="dropzone_loader" size="30px" type="track" />
      )}
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="dropzone-link">
          // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
          <ColorTheme className="dropzone-link-main" themeId={ThemeType.Link}>
            {t("Common:DropzoneTitleLink")}
          </ColorTheme>
          <span className="dropzone-link-secondary">
            {t("Common:DropzoneTitleSecondary")}
          </span>
        </div>
        <div className="dropzone-exsts">{t("Common:DropzoneTitleExsts")}</div>
      </div>
    </StyledDropzone>
  );
};

export default Dropzone;
