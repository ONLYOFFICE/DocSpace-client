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
import { Meta, StoryFn } from "@storybook/react";

import ImageReactSvgUrl from "PUBLIC_DIR/images/empty_screen_done.svg?url";
import File32ReactSvgUrl from "PUBLIC_DIR/images/icons/32/file.svg?url";
import { ReactSVG } from "react-svg";
import { FileTile } from "../file-tile/FileTile";
import { TileContainerProps } from "./TileContainer.types";
import { TileContainer } from ".";
import { TileContent } from "../tile-content/TileContent";
import { Link } from "../../link";
import i18nextStoryDecorator from "../../../.storybook/decorators/i18nextStoryDecorator";
import { FileType } from "../../../enums";

const element = (
  <ReactSVG
    className="icon-empty"
    src={File32ReactSvgUrl}
    data-testid="empty-icon"
  />
);

const meta: Meta = {
  title: "Components/TileContainer",
  component: TileContainer,
  parameters: {
    docs: {
      description: {
        component: "Container component for displaying tiles in a grid layout",
      },
    },
  },
  decorators: [i18nextStoryDecorator],
};

export default meta;

const mockFiles = [
  {
    id: "1",
    title: "Document.docx",
    fileExst: ".docx",
    fileType: FileType.Document,
  },
  {
    id: "2",
    title: "Presentation.pptx",
    fileExst: ".pptx",
    fileType: FileType.Presentation,
  },
  {
    id: "3",
    title: "Spreadsheet.xlsx",
    fileExst: ".xlsx",
    fileType: FileType.Spreadsheet,
  },
];

const mockContextOptions = [
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

const Template: StoryFn<TileContainerProps> = (args) => {
  return (
    <TileContainer {...args}>
      {mockFiles.map((file) => (
        <FileTile
          key={file.id}
          item={file}
          contextOptions={mockContextOptions}
          temporaryIcon={ImageReactSvgUrl}
          element={element}
        >
          <TileContent>
            <Link>{file.title}</Link>
          </TileContent>
        </FileTile>
      ))}
    </TileContainer>
  );
};

export const Default = Template.bind({});
Default.args = {
  useReactWindow: false,
  headingFiles: "Files",
};
