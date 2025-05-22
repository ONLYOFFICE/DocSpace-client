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

import React, { useState, useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { EncryptionPortal } from "./index";

import { Button } from "../../components/button";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

const meta = {
  title: "Pages/EncryptionPortal",
  component: EncryptionPortal,
  parameters: {
    docs: {
      description: {
        component:
          "Encryption Portal component that displays the encryption progress or error messages. It shows the current progress of the encryption process and handles errors if they occur.",
      },
    },
    layout: "centered",
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=419-1989&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof EncryptionPortal>;

export default meta;

type Story = StoryObj<typeof EncryptionPortal>;

// Mock data for different encryption states
const mockStates = {
  loading: {
    isLoading: true,
    progress: null,
  },
  inProgress: {
    progress: 50,
  },
  error: {
    error: "Failed to start encryption process",
  },
  complete: {
    progress: 100,
  },
  progressAt25: {
    progress: 25,
  },
};

// Create a template component that can be reused across stories
const Template = ({
  state = "inProgress",
}: {
  state: keyof typeof mockStates;
}) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPortal, setShowPortal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Set up the initial state based on the selected mock state
  useEffect(() => {
    if (!showPortal) return;

    const mockState = mockStates[state as keyof typeof mockStates];

    if ("isLoading" in mockState && mockState.isLoading) {
      setIsLoading(true);
      // Simulate loading for 2 seconds then show progress
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(50);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if ("error" in mockState) {
      setIsLoading(false);
      setError(mockState.error);
    } else if ("simulateError" in mockState && mockState.simulateError) {
      // Do nothing here, the error will be simulated in the mock API
      setIsLoading(false);
    } else if ("progress" in mockState && mockState.progress !== null) {
      setIsLoading(false);
      setProgress(mockState.progress);

      // For progress states, simulate gradual progress increase
      if (mockState.progress < 100 && state !== "progressAt25") {
        const timer = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 5;
            if (newProgress >= 100) {
              clearInterval(timer);
              return 100;
            }
            return newProgress;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [state, showPortal]);

  // Mock the API calls and socket events
  const mockAPI = {
    getEncryptionProgress: async () => {
      action("getEncryptionProgress")(`Retry count: ${retryCount}`);

      return progress;
    },
  };

  // Reset state when toggling the portal
  const handleToggle = () => {
    if (showPortal) {
      setShowPortal(false);
      // Reset state
      setProgress(0);
      setError(null);
      setIsLoading(true);
      setRetryCount(0);
    } else {
      setShowPortal(true);
    }
  };

  // Mock socket event for encryption progress
  useEffect(() => {
    if (!showPortal || state !== "inProgress") return;

    const timer = setTimeout(() => {
      // Simulate socket event after 5 seconds
      action("socketEvent: EncryptionProgress")({
        percentage: 75,
        error: null,
      });

      setProgress(75);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showPortal, state]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <Button
        label={showPortal ? "Hide Encryption Portal" : "Show Encryption Portal"}
        onClick={handleToggle}
      />
      {showPortal ? (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <EncryptionPortal
            // @ts-expect-error - This is for storybook demonstration only
            storybook={{
              mockAPI,
              progress,
              error,
              isLoading,
            }}
          />
        </div>
      ) : null}
      <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
        {state === "loading"
          ? "This story demonstrates the loading state of the encryption portal."
          : null}
        {state === "inProgress"
          ? "This story shows the encryption progress at 50% with gradual increase and simulates a socket event after 5 seconds."
          : null}
        {state === "error" ? "This story simulates an error state." : null}
        {state === "complete"
          ? "This story demonstrates the completed encryption process (100%)."
          : null}
        {state === "progressAt25"
          ? "This story shows the encryption progress fixed at 25%."
          : null}
      </div>
    </div>
  );
};

export const Loading: Story = {
  render: () => <Template state="loading" />,
  parameters: {
    docs: {
      description: {
        story: "Initial loading state of the encryption portal",
      },
    },
  },
};

export const InProgress: Story = {
  render: () => <Template state="inProgress" />,
  parameters: {
    docs: {
      description: {
        story:
          "Encryption in progress with 50% completion and gradual increase",
      },
    },
  },
};

export const Error: Story = {
  render: () => <Template state="error" />,
  parameters: {
    docs: {
      description: {
        story: "Error state when encryption fails",
      },
    },
  },
};

export const Complete: Story = {
  render: () => <Template state="complete" />,
  parameters: {
    docs: {
      description: {
        story: "Encryption process completed (100%)",
      },
    },
  },
};

export const ProgressAt25Percent: Story = {
  render: () => <Template state="progressAt25" />,
  parameters: {
    docs: {
      description: {
        story: "Encryption progress fixed at 25%",
      },
    },
  },
};
