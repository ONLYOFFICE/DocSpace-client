// (c) Copyright Ascensio System SIA 2009-2024
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
import React, { useState, useCallback } from "react";
import { StoryFn, Meta } from "@storybook/react";
import { useTranslation } from "react-i18next";

import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

import { ImageEditor } from "./index";
import { ImageEditorProps, TImage } from "./ImageEditor.types";

export default {
  title: "Components/ImageEditor",
  component: ImageEditor,
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
      description: "Disable image editor",
    },
    editorBorderRadius: {
      control: "number",
      defaultValue: 8,
      description: "Border radius of the editor container in pixels",
    },
    disableImageRescaling: {
      control: "boolean",
      defaultValue: false,
      description: "Disable image rescaling",
    },
    maxImageSize: {
      control: "number",
      defaultValue: 1048576,
      description: "Maximum image size in bytes (default 1MB)",
    },
  },
  decorators: [i18nextStoryDecorator],
} as Meta;

const InteractiveTemplate: StoryFn<ImageEditorProps> = (args) => {
  const { t } = useTranslation("Common");

  const [image, setImage] = useState<TImage>({
    uploadedFile: "/images/logo/leftmenu.svg",
    zoom: 1,
    x: 0,
    y: 0,
  });

  const onChangeImage = useCallback((newImage: TImage) => {
    setImage(newImage);
  }, []);

  const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage((prev) => ({ ...prev, uploadedFile: file }));
    }
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "800px" }}>
      <ImageEditor
        {...args}
        t={t}
        image={image}
        onChangeImage={onChangeImage}
        onChangeFile={onChangeFile}
      />
    </div>
  );
};

export const ProfileAvatar = InteractiveTemplate.bind({});
ProfileAvatar.args = {
  isDisabled: false,
  disableImageRescaling: false,
  editorBorderRadius: 400,
  maxImageSize: 1048576,
};
