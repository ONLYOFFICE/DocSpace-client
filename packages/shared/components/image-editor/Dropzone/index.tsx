import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import resizeImage from "resize-image";

import { Loader, LoaderTypes } from "../../loader";
import { toastr } from "../../toast";
import { ColorTheme, ThemeId } from "../../color-theme";
import { StyledDropzone } from "../ImageEditor.styled";

const ONE_MEGABYTE = 1024 * 1024;
const COMPRESSION_RATIO = 2;
const NO_COMPRESSION_RATIO = 1;

const Dropzone = ({
  t,
  setUploadedFile,
  isDisabled,
}: {
  t: (key: string) => string;
  setUploadedFile: (f: File) => void;
  isDisabled?: boolean;
}) => {
  const [loadingFile, setLoadingFile] = useState(false);
  const mount = useRef(false);
  const timer = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function resizeRecursiveAsync(
    img: { width: number; height: number },
    canvas: HTMLCanvasElement,
    compressionRatio = COMPRESSION_RATIO,
    depth = 0,
  ): Promise<unknown> {
    const data = resizeImage.resize(
      // @ts-expect-error canvas
      canvas,
      img.width / compressionRatio,
      img.height / compressionRatio,
      resizeImage.JPEG,
    );

    const file = await fetch(data)
      .then((res) => res.blob())
      .then((blob) => {
        const f = new File([blob], "File name", {
          type: "image/jpg",
        });
        return f;
      });

    // const stepMessage = `Step ${depth + 1}`;
    // const sizeMessage = `size = ${file.size} bytes`;
    // const compressionRatioMessage = `compressionRatio = ${compressionRatio}`;

    // console.log(`${stepMessage} ${sizeMessage} ${compressionRatioMessage}`);

    if (file.size < ONE_MEGABYTE) {
      return file;
    }

    if (depth > 5) {
      // console.log("start");
      throw new Error("recursion depth exceeded");
    }

    return new Promise((resolve) => {
      // eslint-disable-next-line no-promise-executor-return
      return resolve(file);
    }).then(() =>
      resizeRecursiveAsync(img, canvas, compressionRatio + 1, depth + 1),
    );
  }

  const onDrop = async ([file]: [File]) => {
    timer.current = setTimeout(() => {
      setLoadingFile(true);
    }, 50);
    try {
      const imageBitMap = await createImageBitmap(file);

      const width = imageBitMap.width;
      const height = imageBitMap.height;

      // @ts-expect-error imageBitMap
      const canvas = resizeImage.resize2Canvas(imageBitMap, width, height);

      resizeRecursiveAsync(
        { width, height },
        canvas,
        file.size > ONE_MEGABYTE ? COMPRESSION_RATIO : NO_COMPRESSION_RATIO,
      )
        .then((f) => {
          if (mount.current) {
            if (f instanceof File) setUploadedFile(f);
          }
        })
        .catch((error) => {
          if (
            error instanceof Error &&
            error.message === "recursion depth exceeded"
          ) {
            toastr.error(t("Common:SizeImageLarge"));
          }
          // console.error(error);
        })
        .finally(() => {
          if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
          }
          if (mount.current) {
            setLoadingFile(false);
          }
        });
    } catch (error) {
      // console.error(error);
      toastr.error(t("Common:NotSupportedFormat"));
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
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
    // @ts-expect-error onDrop
    onDrop,
  });

  return (
    <StyledDropzone $isLoading={loadingFile}>
      {loadingFile && (
        <Loader
          className="dropzone_loader"
          size="30px"
          type={LoaderTypes.track}
        />
      )}
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <div className="dropzone-link">
          <ColorTheme className="dropzone-link-main" themeId={ThemeId.Link}>
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
