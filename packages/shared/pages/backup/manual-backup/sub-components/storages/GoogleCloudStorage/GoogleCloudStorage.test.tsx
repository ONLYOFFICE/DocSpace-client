import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ButtonSize } from "@docspace/shared/components/button";
import { ThirdPartyStorages } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import { GoogleCloudStorage } from ".";

jest.mock("@docspace/shared/components/google-cloud-settings", () => ({
  GoogleCloudSettings: ({
    t,
    isNeedFilePath,
  }: {
    t: TTranslation;
    isNeedFilePath: boolean;
  }) => (
    <div data-testid="google-cloud-settings">
      <span>{t("Common:GoogleCloudSettings")}</span>
      <span>{isNeedFilePath ? "FilePath" : "NoFilePath"}</span>
    </div>
  ),
  formNames: jest.fn().mockReturnValue({
    projectId: "",
    privateKey: "",
    clientEmail: "",
    bucket: "",
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
    id: ThirdPartyStorages.GoogleId,
    isSet: true,
    title: "Google Cloud",
    properties: [
      { name: "projectId", title: "Project ID", value: "test-project" },
      { name: "privateKey", title: "Private Key", value: "test-private-key" },
      { name: "clientEmail", title: "Client Email", value: "test@example.com" },
      { name: "bucket", title: "Bucket", value: "test-bucket" },
    ],
  },
  formSettings: {
    projectId: "test-project",
    privateKey: "test-private-key",
    clientEmail: "test@example.com",
    bucket: "test-bucket",
  },
  errorsFieldsBeforeSafe: {},
  addValueInFormSettings: jest.fn(),
  setRequiredFormSettings: jest.fn(),
  setIsThirdStorageChanged: jest.fn(),
  setCompletedFormFields: jest.fn(),
  onMakeCopyIntoStorage: jest.fn(),
};

describe("GoogleCloudStorage", () => {
  it("renders without errors", () => {
    render(<GoogleCloudStorage {...defaultProps} />);
    expect(screen.getByTestId("google-cloud-settings")).toBeInTheDocument();
    expect(screen.getByText("Common:CreateCopy")).toBeInTheDocument();
  });

  it("calls onMakeCopyIntoStorage when create copy button is clicked", () => {
    render(<GoogleCloudStorage {...defaultProps} />);
    fireEvent.click(screen.getByText("Common:CreateCopy"));
    expect(defaultProps.onMakeCopyIntoStorage).toHaveBeenCalled();
  });

  it("disables create copy button when isValidForm is false", () => {
    render(<GoogleCloudStorage {...defaultProps} isValidForm={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when isMaxProgress is false", () => {
    render(<GoogleCloudStorage {...defaultProps} isMaxProgress={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when selectedStorage is not set", () => {
    render(
      <GoogleCloudStorage
        {...defaultProps}
        selectedStorage={{
          id: ThirdPartyStorages.GoogleId,
          isSet: false,
          title: "Google Cloud",
          properties: [
            { name: "projectId", title: "Project ID", value: "" },
            { name: "privateKey", title: "Private Key", value: "" },
            { name: "clientEmail", title: "Client Email", value: "" },
            { name: "bucket", title: "Bucket", value: "" },
          ],
        }}
      />,
    );
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("calls setCompletedFormFields on mount", () => {
    render(<GoogleCloudStorage {...defaultProps} />);
    expect(defaultProps.setCompletedFormFields).toHaveBeenCalled();
  });

  it("passes correct props to GoogleCloudSettings", () => {
    render(<GoogleCloudStorage {...defaultProps} />);
    const settingsComponent = screen.getByTestId("google-cloud-settings");
    expect(settingsComponent).toBeInTheDocument();
    expect(screen.getByText("FilePath")).toBeInTheDocument();
  });
});
