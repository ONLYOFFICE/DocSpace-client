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
import { Story, Meta } from "@storybook/react";
import { ImageEditor } from "./index";
import { ImageEditorProps } from "./ImageEditor.types";

export default {
  title: "Components/ImageEditor",
  component: ImageEditor,
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
    },
    editorBorderRadius: {
      control: "number",
      defaultValue: 8,
    },
    disableImageRescaling: {
      control: "boolean",
      defaultValue: false,
    },
  },
} as Meta;

const Template: Story<ImageEditorProps> = (args) => <ImageEditor {...args} />;

export const Default = Template.bind({});
Default.args = {
  t: (key: string) => key,
  image: {
    uploadedFile: undefined,
    zoom: 1,
    x: 0,
    y: 0,
  },
  onChangeImage: () => {},
  Preview: <div>Preview</div>,
  setPreview: () => {},
  isDisabled: false,
  editorBorderRadius: 8,
  onChangeFile: () => {},
};

export const WithImage = Template.bind({});
WithImage.args = {
  ...Default.args,
  image: {
    uploadedFile: "https://example.com/sample-image.jpg",
    zoom: 1,
    x: 0,
    y: 0,
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  isDisabled: true,
};
