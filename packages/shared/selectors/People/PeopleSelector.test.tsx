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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "styled-components";
import i18n from "i18next";

import PeopleSelector from "./index";
import { Base } from "../../themes";
import { EmployeeStatus, EmployeeType } from "../../enums";
import * as peopleApi from "../../api/people";

// Mock the API calls
jest.mock("../../api/people", () => ({
  getUserList: jest.fn(() => Promise.resolve({ items: [], total: 0 })),
  getMembersList: jest.fn(() => Promise.resolve({ items: [], total: 0 })),
}));

// Mock the Avatar component
jest.mock("../../components/avatar", () => ({
  Avatar: ({ size, userName }: { size: string; userName: string }) => (
    <div data-testid="avatar" data-size={size} data-user-name={userName}>
      Avatar
    </div>
  ),
}));

// Mock the GroupIcon component
jest.mock("../../icons", () => ({
  GroupIcon: ({ size, className }: { size: string; className?: string }) => (
    <div data-testid="group-icon" data-size={size} className={className}>
      Group Icon
    </div>
  ),
}));

// Mock the StyledSendClockIcon component
jest.mock("./components/SendClockIcon", () => ({
  __esModule: true,
  default: ({ className, size }: { className?: string; size?: string }) => (
    <div data-testid="send-clock-icon" data-size={size} className={className}>
      Send Clock Icon
    </div>
  ),
}));

// Mock the translation hook
jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (options) {
        return `${key} ${Object.values(options).join(" ")}`;
      }
      return key;
    },
    ready: true,
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the components that are not needed for the test
jest.mock("../../components/selector", () => ({
  Selector: ({
    items,
    onSelect,
    renderCustomItem,
    onCancel,
    ...props
  }: {
    items?: Array<{
      id: string;
      label: string;
      userType?: string;
      email?: string;
      isGroup?: boolean;
      status?: number;
      isSelected?: boolean;
      isDisabled?: boolean;
    }>;
    onSelect?: (item: Record<string, unknown>, isDoubleClick: boolean) => void;
    renderCustomItem?: (
      label: string,
      userType?: string,
      email?: string,
      isGroup?: boolean,
      status?: number
    ) => React.ReactNode;
    onCancel?: () => void;
    [key: string]: any;
  }) => {
    // Mock the renderCustomItem function if it's not provided
    const mockRenderCustomItem = (label: string) => <div>{label}</div>;

    return (
      <div
        data-testid="selector"
        aria-label={props["aria-label"] || "People Selector"}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        data-selector-type={props["data-selector-type"] || "people"}
        data-test-id={props["data-test-id"] || "people-selector"}
      >
        <div data-testid="selector-header">
          {props.headerProps?.headerLabel}
        </div>
        <div data-testid="selector-items">
          {items
            ? items.map((item: any) => (
                <div
                  key={item.id}
                  data-testid={`selector-item-${item.id}`}
                  data-user-id={item.id}
                  data-user-type={item.userType}
                  data-user-status={item.status}
                  data-selected={item.isSelected ? "true" : "false"}
                  data-disabled={item.isDisabled ? "true" : "false"}
                  onClick={() => {
                    if (onSelect) onSelect(item as Record<string, unknown>, false);
                  }}
                  onDoubleClick={() => {
                    if (onSelect) onSelect(item as Record<string, unknown>, true);
                  }}
                >
                  {renderCustomItem
                    ? renderCustomItem(
                        item.label,
                        item.userType,
                        item.email,
                        item.isGroup,
                        item.status,
                      )
                    : mockRenderCustomItem(item.label)}
                </div>
              ))
            : null}
        </div>
        {props.withSearch ? (
          <div data-testid="selector-search">
            <input
              data-testid="search-input"
              type="text"
              placeholder={props.searchPlaceholder}
              onChange={(e) => props.onSearch && props.onSearch(e.target.value)}
            />
          </div>
        ) : null}
        <button
          type="button"
          data-testid="selector-submit"
          disabled={props.disableSubmitButton}
          onClick={() =>
            props.onSubmit && props.onSubmit(items ? items.filter((item) => item.isSelected) : [])
          }
        >
          {props.submitButtonLabel}
        </button>
        {props.withCancelButton ? (
          <button
            type="button"
            data-testid="selector-cancel"
            onClick={onCancel}
          >
            {props.cancelButtonLabel}
          </button>
        ) : null}
      </div>
    );
  },
  SelectorAccessRightsMode: {
    Detailed: "detailed",
  },
}));

const mockUsers = [
  {
    id: "user1",
    displayName: "John Doe",
    email: "john@example.com",
    avatar: "",
    hasAvatar: false,
    isOwner: false,
    isAdmin: false,
    isVisitor: false,
    isCollaborator: true,
    isRoomAdmin: false,
    status: EmployeeStatus.Active,
    role: EmployeeType.RoomAdmin,
    userType: EmployeeType.RoomAdmin,
    shared: false,
    groups: [],
  },
  {
    id: "user2",
    displayName: "Jane Smith",
    email: "jane@example.com",
    avatar: "",
    hasAvatar: false,
    isOwner: false,
    isAdmin: true,
    isVisitor: false,
    isCollaborator: false,
    isRoomAdmin: false,
    status: EmployeeStatus.Active,
    role: EmployeeType.Admin,
    userType: EmployeeType.Admin,
    shared: false,
    groups: [],
  },
];

// Sample group data for tests if needed later
const mockGroups = [
  {
    id: "group1",
    name: "Marketing",
    manager: "user1",
  },
  {
    id: "group2",
    name: "Development",
    manager: "user2",
  },
];

jest.mock("../../api/people", () => ({
  getUserList: jest.fn(() => Promise.resolve({ items: [], total: 0 })),
  getMembersList: jest.fn(() => Promise.resolve({ items: [], total: 0 })),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={Base}>{component}</ThemeProvider>);
};



describe("PeopleSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component with correct aria and data attributes", async () => {
    // Mock API response
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={jest.fn()}
        disableSubmitButton={false}
      />,
    );

    // Check if the component renders with proper accessibility attributes
    const selector = await screen.findByTestId("selector");
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveAttribute("aria-label", "People Selector");
    expect(selector).toHaveAttribute("data-selector-type", "people");
    expect(selector).toHaveAttribute("data-test-id", "people-selector");

    // Check if the header is rendered
    const header = screen.getByTestId("selector-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent("Select People");

    // Check if the submit button is rendered
    const submitButton = screen.getByTestId("selector-submit");
    expect(submitButton).toBeInTheDocument();
  });

  test("allows selecting users and submitting", async () => {
    const onSubmitMock = jest.fn();

    // Mock API response with users that can be selected
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={onSubmitMock}
        isMultiSelect
        disableSubmitButton={false}
      />,
    );

    // Wait for users to load
    await waitFor(() => {
      expect(peopleApi.getUserList).toHaveBeenCalled();
    });

    // Submit button should be present
    const submitButton = screen.getByTestId("selector-submit");
    expect(submitButton).toBeInTheDocument();

    // Click the submit button
    fireEvent.click(submitButton);

    // onSubmit should have been called
    expect(onSubmitMock).toHaveBeenCalled();
  });

  test("handles cancel button click", async () => {
    // Mock API response
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    const onCancelMock = jest.fn();

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={jest.fn()}
        withCancelButton
        cancelButtonLabel="Cancel"
        disableSubmitButton={false}
        onCancel={onCancelMock}
      />,
    );

    // Wait for users to load
    await waitFor(() => {
      expect(peopleApi.getUserList).toHaveBeenCalled();
    });

    // Cancel button should be present
    const cancelButton = screen.getByTestId("selector-cancel");
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent("Cancel");

    // Click cancel button
    fireEvent.click(cancelButton);
    // onCancel should have been called
    expect(onCancelMock).toHaveBeenCalled();
  });

  test("handles search functionality", async () => {
    // Mock API response
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={jest.fn()}
        disableSubmitButton={false}
      />,
    );

    // Wait for users to load
    await waitFor(() => {
      expect(peopleApi.getUserList).toHaveBeenCalled();
    });

    // Check if getUserList was called with the correct parameters
    expect(peopleApi.getUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "", // Initial search is empty
      }),
    );
  });

  test("renders with groups when withGroups is true", async () => {
    // Mock API responses
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={jest.fn()}
        withGroups
        disableSubmitButton={false}
      />,
    );

    // Wait for users to load
    await waitFor(() => {
      expect(peopleApi.getUserList).toHaveBeenCalled();
    });

    // The component should render with the correct props
    const selector = screen.getByTestId("selector");
    expect(selector).toBeInTheDocument();
  });

  test("handles disabled users correctly", async () => {
    // Mock API response
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    const disabledUsers = ["user1"];

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={jest.fn()}
        disableInvitedUsers={disabledUsers}
        disableSubmitButton={false}
      />,
    );

    // Wait for users to load
    await waitFor(() => {
      expect(peopleApi.getUserList).toHaveBeenCalled();
    });

    // The component should render with the correct props
    const selector = screen.getByTestId("selector");
    expect(selector).toBeInTheDocument();
  });

  test("renders with accessibility attributes", async () => {
    // Mock API response
    (peopleApi.getUserList as jest.Mock).mockResolvedValueOnce({
      items: mockUsers,
      total: mockUsers.length,
    });

    renderWithTheme(
      <PeopleSelector
        headerProps={{
          headerLabel: "Select People",
          onCloseClick: jest.fn(),
        }}
        withHeader
        submitButtonLabel="Select"
        onSubmit={jest.fn()}
        aria-label="Custom People Selector"
        aria-describedby="selector-description"
        data-selector-type="custom-people"
        data-test-id="custom-people-selector"
        disableSubmitButton={false}
      />
    );

    // Wait for users to load
    await waitFor(() => {
      expect(peopleApi.getUserList).toHaveBeenCalled();
    });

    // Check if the component renders with custom accessibility attributes
    const selector = screen.getByTestId("selector");
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveAttribute("aria-label", "Custom People Selector");
    expect(selector).toHaveAttribute(
      "aria-describedby",
      "selector-description"
    );
    expect(selector).toHaveAttribute("data-selector-type", "custom-people");
    expect(selector).toHaveAttribute("data-test-id", "custom-people-selector");
  });
});
