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

import { globalColors } from "../../../themes/globalColors";

export interface UpdatePromptOptions {
  message: string;
  updateButtonText: string;
  dismissButtonText: string;
  onUpdate: () => void;
  autoHideDelay?: number;
}

const PROMPT_STYLES = `
.sw-update-prompt {
  position: fixed;
  top: 20px;
  right: 20px;
  color: ${globalColors.white};
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px ${globalColors.popupShadow};
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  max-width: 300px;
  animation: sw-prompt-slide-in 0.3s ease-out;
}

.sw-update-prompt__message {
  margin-bottom: 12px;
  line-height: 1.5;
}

.sw-update-prompt__actions {
  display: flex;
  gap: 8px;
}

.sw-update-prompt__button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  font-size: 14px;
  transition: opacity 0.2s ease;
}

.sw-update-prompt__button:hover {
  opacity: 0.9;
}

.sw-update-prompt__button:focus {
  outline: 2px solid ${globalColors.onWhiteColor};
  outline-offset: 2px;
}

.sw-update-prompt__button--primary {
  background: ${globalColors.white};
  color: ${globalColors.black};
}

.sw-update-prompt__button--secondary {
  background: transparent;
  color: ${globalColors.white};
  border: 1px solid ${globalColors.white};
}

@keyframes sw-prompt-slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
` as const;

function injectStyles(): void {
  const existingStyle = document.getElementById("sw-update-prompt-styles");
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = "sw-update-prompt-styles";
  style.textContent = PROMPT_STYLES;
  document.head.appendChild(style);
}

export function createUpdatePrompt(options: UpdatePromptOptions): HTMLElement {
  injectStyles();

  const container = document.createElement("div");
  container.className = "sw-update-prompt";
  container.setAttribute("role", "alert");
  container.setAttribute("aria-live", "assertive");
  container.setAttribute("aria-atomic", "true");

  const message = document.createElement("div");
  message.className = "sw-update-prompt__message";
  message.textContent = options.message;
  container.appendChild(message);

  const actions = document.createElement("div");
  actions.className = "sw-update-prompt__actions";

  const updateButton = document.createElement("button");
  updateButton.className =
    "sw-update-prompt__button sw-update-prompt__button--primary";
  updateButton.textContent = options.updateButtonText;
  updateButton.setAttribute(
    "aria-label",
    `${options.updateButtonText} - ${options.message}`,
  );
  updateButton.addEventListener("click", () => {
    options.onUpdate();
    container.remove();
  });
  actions.appendChild(updateButton);

  const dismissButton = document.createElement("button");
  dismissButton.className =
    "sw-update-prompt__button sw-update-prompt__button--secondary";
  dismissButton.textContent = options.dismissButtonText;
  dismissButton.setAttribute("aria-label", options.dismissButtonText);
  dismissButton.addEventListener("click", () => {
    container.remove();
  });
  actions.appendChild(dismissButton);

  container.appendChild(actions);

  document.body.appendChild(container);

  const autoHideDelay = options.autoHideDelay ?? 30000;
  if (autoHideDelay > 0) {
    setTimeout(() => {
      if (container.parentNode) {
        container.remove();
      }
    }, autoHideDelay);
  }

  return container;
}
