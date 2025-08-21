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

import { useEffect } from "react";
import { Meta, StoryFn } from "@storybook/react";
import TopLoaderService from "./index";

export default {
  title: "Components/TopLoader",
  parameters: {
    docs: {
      description: {
        component:
          "A top loading indicator that shows progress at the top of the page",
      },
    },
  },
} as Meta;

const Template: StoryFn = () => {
  useEffect(() => {
    // Create the progress bar element
    const progressBar = document.createElement("div");
    progressBar.id = "ipl-progress-indicator";
    progressBar.style.position = "fixed";
    progressBar.style.top = "0";
    progressBar.style.left = "0";
    progressBar.style.height = "2px";
    progressBar.style.backgroundColor = "#2DA7DB";
    progressBar.style.transition = "width 0.2s ease-in-out";
    document.body.appendChild(progressBar);

    return () => {
      document.body.removeChild(progressBar);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <button type="button" onClick={() => TopLoaderService.start()}>
        Start Loading
      </button>
      <button
        type="button"
        onClick={() => TopLoaderService.end()}
        style={{ marginLeft: "10px" }}
      >
        End Loading
      </button>
      <button
        type="button"
        onClick={() => TopLoaderService.cancel()}
        style={{ marginLeft: "10px" }}
      >
        Cancel Loading
      </button>
    </div>
  );
};

export const Default = Template.bind({});
Default.parameters = {
  docs: {
    description: {
      story: "Default top loader with start, end, and cancel controls",
    },
  },
};
