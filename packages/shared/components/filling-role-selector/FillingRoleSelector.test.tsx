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

import { render, screen } from "@testing-library/react";
import { FillingRoleSelector } from "./FillingRoleSelector";
import { FillingRoleSelectorProps } from "./FillingRoleSelector.types";
import "@testing-library/jest-dom";

describe("FillingRoleSelector", () => {
  const mockRoles = [
    {
      id: "1",
      name: "Role 1",
      order: 1,
      everyone: "everyone",
      color: "#000000",
    },
    {
      id: "2",
      name: "Role 2",
      order: 2,
      everyone: "",
      color: "#FFFFFF",
    },
    {
      id: "3",
      name: "Role 3",
      order: 3,
      everyone: "everyone",
      color: "#FF0000",
    },
  ];

  const mockUsers = [
    {
      id: "1",
      role: "Role 1",
      displayName: "User 1",
      hasAvatar: true,
      avatar: "avatar.png",
    },
    {
      id: "2",
      role: "Role 2",
      displayName: "User 2",
      hasAvatar: false,
    },
  ];

  const mockOnAddUser = jest.fn();
  const mockOnRemoveUser = jest.fn();

  const defaultProps: FillingRoleSelectorProps = {
    roles: mockRoles,
    users: mockUsers,
    onAddUser: mockOnAddUser,
    onRemoveUser: mockOnRemoveUser,
    descriptionEveryone: "Everyone description",
    descriptionTooltip: "Tooltip description",
    style: { color: "blue" },
  };

  it("renders without error", () => {
    render(<FillingRoleSelector {...defaultProps} />);
    expect(screen.getByTestId("filling-role-selector")).toBeInTheDocument();
  });

  it("should render the everyone role if it exists in the roles array", () => {
    render(<FillingRoleSelector {...defaultProps} />);

    expect(screen.getByText("Everyone description")).toBeInTheDocument();
    expect(screen.getByText("Tooltip description")).toBeInTheDocument();
  });
});
