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

import React from "react";

import { FileInput } from "../file-input";
import { Row } from "../row";
import { Text } from "../text";
import { InputSize } from "../text-input";

export const data = [
  {
    id: "Overview",
    name: "Overview",
    content: (
      <FileInput
        accept={[".doc", ".docx"]}
        id="file-input-id"
        name="demoFileInputName"
        onInput={() => {}}
        placeholder="Input file"
        size={InputSize.base}
      />
    ),
  },
  {
    id: "Documents",
    name: "Documents",
    content: <p>Documents</p>,
  },
  {
    id: "Milestones",
    name: "Milestones",
    content: (
      <Row
        key="1"
        checked
        contextOptions={[
          {
            key: "key1",
            label: "Edit",
            onClick: () => {},
          },
          {
            key: "key2",
            label: "Delete",
            onClick: () => {},
          },
        ]}
        onRowClick={() => {}}
        onSelect={() => {}}
      >
        <div
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            display: "flex",
          }}
        >
          <Text truncate>Sample text</Text>
        </div>
      </Row>
    ),
  },
  {
    id: "Time tracking",
    name: "Time tracking",
    content: <p>Time tracking</p>,
  },
  {
    id: "Contacts",
    name: "Contacts",
    content: <p>Contacts</p>,
  },
  {
    id: "Team",
    name: "Team",
    content: <p>Team</p>,
  },
];

export const startSelect = data[2];

export const testData = [
  {
    id: "Tab1",
    name: "Tab1",
    content: <p>1</p>,
  },
  {
    id: "Tab2",
    name: "Tab2",
    content: <p>2</p>,
  },
];

export const testStartSelect = testData[1];
