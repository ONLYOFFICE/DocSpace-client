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

import { useEffect, useState } from "react";

import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import { ContentType } from "../../../../../../api/ai/enums";

import type {
  MessageImagesProps,
  TChatPlaylistImage,
} from "../../../../Chat.types";

import { downloadImageAsBase64 } from "../../../../utils";

import styles from "../../ChatMessageBody.module.scss";

const Images = ({
  images,
  setAiPlaylistImages,
  setMediaViewerVisible,
}: MessageImagesProps) => {
  const [img, setImg] = useState<Map<string, string>>(new Map());
  const [playlist, setPlaylist] = useState<TChatPlaylistImage[]>([]);

  useEffect(() => {
    if (!images.length) return;

    const downloadImages = async () => {
      const newImg = new Map<string, string>();

      for (const image of images) {
        if (image.type !== ContentType.Images || !image.url || !image.id)
          continue;

        try {
          const base64 = await downloadImageAsBase64(image.url);
          newImg.set(image.id.toString(), base64);
        } catch (error) {
          console.error(`Failed to download image ${image.id}:`, error);
        }
      }

      setImg(newImg);
    };

    downloadImages();
  }, [images]);

  useEffect(() => {
    if (!images.length) return;

    const playlist: TChatPlaylistImage[] = [];

    for (const image of images) {
      if (image.type !== ContentType.Images || !image.url || !image.id)
        continue;

      playlist.push({ title: "Test.jpg", fileId: image.id, src: image.url });
    }

    setPlaylist(playlist);
  }, [images]);

  if (!images.length) return null;

  const isClickable = !!(setMediaViewerVisible && setAiPlaylistImages);

  const onImageClick = (imageId: string) => {
    if (!isClickable) return;

    setMediaViewerVisible(true);
    const openedImg = playlist.find(
      (item) => item.fileId.toString() === imageId,
    );
    if (!openedImg) return;
    setAiPlaylistImages([openedImg]);
  };

  return (
    <div className={styles.imagesListWrapper}>
      {images.map((image) => {
        if (image.type !== ContentType.Images) return null;

        const base64Image = img.get(image.id.toString());

        return (
          <div className={styles.imagesListItem} key={image.id}>
            {base64Image ? (
              <img
                className={styles.imagesListItemImage}
                src={base64Image}
                alt={`${image.id}`}
                onClick={() => onImageClick(image.id.toString())}
                style={isClickable ? { cursor: "pointer" } : undefined}
              />
            ) : (
              <Loader
                size="20px"
                type={LoaderTypes.track}
                className={styles.loader}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Images;
