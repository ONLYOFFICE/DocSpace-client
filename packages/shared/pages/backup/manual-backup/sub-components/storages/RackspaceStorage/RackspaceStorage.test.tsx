import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ButtonSize } from "@docspace/shared/components/button";
import { ThirdPartyStorages } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import { RackspaceStorage } from ".";

jest.mock("@docspace/shared/components/rackspace-settings", () => ({
  RackspaceSettings: ({
    t,
    isNeedFilePath,
  }: {
    t: TTranslation;
    isNeedFilePath: boolean;
  }) => (
    <div data-testid="rackspace-settings">
      <span>{t("Common:RackspaceSettings")}</span>
      <span>{isNeedFilePath ? "FilePath" : "NoFilePath"}</span>
    </div>
  ),
  formNames: jest.fn().mockReturnValue({
    username: "",
    apiKey: "",
    region: "",
    container: "",
  }),
}));

const defaultProps = {
  t: jest.fn((key) => key),
  isValidForm: true,
  buttonSize: ButtonSize.normal,
  isMaxProgress: true,
  isLoadingData: false,
  isNeedFilePath: true,
  isLoading: false,
  selectedStorage: {
    id: ThirdPartyStorages.RackspaceId,
    isSet: true,
    title: "Rackspace",
    properties: [
      { name: "username", title: "Username", value: "test-username" },
      { name: "apiKey", title: "API Key", value: "test-api-key" },
      { name: "region", title: "Region", value: "test-region" },
      { name: "container", title: "Container", value: "test-container" },
    ],
  },
  formSettings: {
    username: "test-username",
    apiKey: "test-api-key",
    region: "test-region",
    container: "test-container",
  },
  errorsFieldsBeforeSafe: {},
  addValueInFormSettings: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  setCompletedFormFields: jest.fn(),
  onMakeCopyIntoStorage: jest.fn(),
};

describe("RackspaceStorage", () => {
  it("renders without errors", () => {
    render(<RackspaceStorage {...defaultProps} />);
    expect(screen.getByTestId("rackspace-storage")).toBeInTheDocument();
    expect(screen.getByTestId("rackspace-settings")).toBeInTheDocument();
    expect(screen.getByText("Common:CreateCopy")).toBeInTheDocument();
  });

  it("calls onMakeCopyIntoStorage when create copy button is clicked", () => {
    render(<RackspaceStorage {...defaultProps} />);
    fireEvent.click(screen.getByText("Common:CreateCopy"));
    expect(defaultProps.onMakeCopyIntoStorage).toHaveBeenCalled();
  });

  it("disables create copy button when isValidForm is false", () => {
    render(<RackspaceStorage {...defaultProps} isValidForm={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when isMaxProgress is false", () => {
    render(<RackspaceStorage {...defaultProps} isMaxProgress={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when selectedStorage is not set", () => {
    render(
      <RackspaceStorage
        {...defaultProps}
        selectedStorage={{
          id: ThirdPartyStorages.RackspaceId,
          isSet: false,
          title: "Rackspace",
          properties: [
            { name: "username", title: "Username", value: "" },
            { name: "apiKey", title: "API Key", value: "" },
            { name: "region", title: "Region", value: "" },
            { name: "container", title: "Container", value: "" },
          ],
        }}
      />,
    );
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("calls setCompletedFormFields on mount", () => {
    render(<RackspaceStorage {...defaultProps} />);
    expect(defaultProps.setCompletedFormFields).toHaveBeenCalled();
  });

  it("passes correct props to RackspaceSettings", () => {
    render(<RackspaceStorage {...defaultProps} />);
    const settingsComponent = screen.getByTestId("rackspace-settings");
    expect(settingsComponent).toBeInTheDocument();
    expect(screen.getByText("FilePath")).toBeInTheDocument();
  });
});
