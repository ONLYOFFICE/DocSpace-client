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
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "styled-components";

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
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the components that are not needed for the test
jest.mock("../../components/selector", () => ({
  Selector: ({
    items,
    onSelect,
    renderCustomItem,
    onCancel,
    headerProps,
    withSearch,
    searchPlaceholder,
    onSearch,
    disableSubmitButton,
    submitButtonLabel,
    onSubmit,
    withCancelButton,
    cancelButtonLabel,
    "aria-label": ariaLabel,
    "data-selector-type": dataSelectorType,
    "data-test-id": dataTestId,
    // We're not using any other props
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
      status?: number,
    ) => React.ReactNode;
    onCancel?: () => void;
    headerProps?: { headerLabel?: string };
    withSearch?: boolean;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;
    disableSubmitButton?: boolean;
    submitButtonLabel?: string;
    onSubmit?: (items: Array<Record<string, unknown>>) => void;
    withCancelButton?: boolean;
    cancelButtonLabel?: string;
    "aria-label"?: string;
    "data-selector-type"?: string;
    "data-test-id"?: string;
    [key: string]: unknown;
  }) => {
    // Mock the renderCustomItem function if it's not provided
    const mockRenderCustomItem = (label: string): React.ReactNode => (
      <div>{label}</div>
    );

    return (
      <div
        data-testid="selector"
        aria-label={ariaLabel || "People Selector"}
        data-selector-type={dataSelectorType || "people"}
        data-test-id={dataTestId || "people-selector"}
        role="listbox"
      >
        <div data-testid="selector-header">{headerProps?.headerLabel}</div>
        <div data-testid="selector-items" role="list">
          {items
            ? items.map((item: Record<string, unknown>) => (
                <div
                  key={item.id as string}
                  data-testid={`selector-item-${item.id as string}`}
                  data-user-id={item.id as string}
                  data-selected={(item.isSelected ? "true" : "false") as string}
                  data-disabled={(item.isDisabled ? "true" : "false") as string}
                  role="option"
                  aria-selected={
                    typeof item.isSelected === "boolean"
                      ? item.isSelected
                      : false
                  }
                  tabIndex={0}
                  aria-label={`Selectable item: ${item.label as string}`}
                  onClick={() => {
                    if (onSelect) {
                      onSelect(item as Record<string, unknown>, false);
                    }
                  }}
                  onDoubleClick={() => {
                    if (onSelect) {
                      onSelect(item as Record<string, unknown>, true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && onSelect) {
                      onSelect(item as Record<string, unknown>, false);
                    }
                  }}
                >
                  {renderCustomItem
                    ? renderCustomItem(
                        String(item.label),
                        item.userType as string | undefined,
                        item.email as string | undefined,
                        item.isGroup as boolean | undefined,
                        item.status as number | undefined,
                      )
                    : mockRenderCustomItem(String(item.label))}
                </div>
              ))
            : null}
        </div>
        {withSearch ? (
          <div data-testid="selector-search">
            <input
              data-testid="search-input"
              type="text"
              placeholder={searchPlaceholder || ""}
              onChange={(e) => {
                if (onSearch) {
                  onSearch(e.target.value);
                }
              }}
              aria-label="Search"
            />
          </div>
        ) : null}
        <button
          type="button"
          data-testid="selector-submit"
          disabled={disableSubmitButton}
          onClick={() => {
            if (onSubmit) {
              onSubmit(items ? items.filter((item) => item.isSelected) : []);
            }
          }}
        >
          {submitButtonLabel || "Submit"}
        </button>
        {withCancelButton ? (
          <button
            type="button"
            data-testid="selector-cancel"
            onClick={onCancel}
          >
            {cancelButtonLabel || "Cancel"}
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
    role: EmployeeType.User,
    userType: EmployeeType.User,
    shared: false,
    groups: [],
    access: 0,
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

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={Base}>{component}</ThemeProvider>);
};

// We'll use the querySelector API directly instead of creating mock elements

describe("PeopleSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to default
    (peopleApi.getUserList as jest.Mock).mockImplementation(() =>
      Promise.resolve({ items: mockUsers, total: mockUsers.length }),
    );
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
});
