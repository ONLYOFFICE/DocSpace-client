// (c) Copyright Ascensio System SIA 2009-2026
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

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Events } from "@docspace/shared/enums";

import config from "PACKAGE_FILE";

import { PluginActions, PluginToastType } from "./enums";
import { CategoryType } from "@docspace/shared/constants";
import { getCategoryType } from "@docspace/shared/utils/common";
import {
  showInfoPanel,
  openMembersTab,
  openShareTab,
  setView,
  InfoPanelView,
  setFileView,
  setRoomsView,
} from "../info-panel";

export const messageActions = ({
  message,
  setElementProps,
  pluginName,
  setSettingsPluginDialogVisible,
  setCurrentSettingsDialogPlugin,
  updatePluginStatus,
  updatePropsContext,
  setPluginDialogVisible,
  setPluginDialogProps,
  setPluginSelectorVisible,
  setPluginSelectorProps,
  addPluginFloatingOperations,
  removePluginFloatingOperations,
  updatePluginFloatingOperations,
  updateContextMenuItems,
  updateInfoPanelItems,
  updateMainButtonItems,
  updateProfileMenuItems,
  updateEventListenerItems,
  updateFileItems,
  updateArticleButtonItems,
  updateCreateDialogProps,
  updatePlugin,
}) => {
  if (!message || !message.actions || message.actions.length === 0) return;

  message.actions.forEach((action) => {
    switch (action) {
      case PluginActions.updateProps:
        setElementProps?.({ ...message.newProps });

        break;

      case PluginActions.updateContext:
        if (message?.contextProps) {
          updatePropsContext(message.contextProps);
        }
        break;

      case PluginActions.updateStatus:
        updatePluginStatus?.(pluginName);

        break;

      case PluginActions.showToast:
        if (message.toastProps) {
          message.toastProps.forEach((toast) => {
            switch (toast.type) {
              case PluginToastType.success:
                toastr.success(toast.title);
                break;
              case PluginToastType.info:
                toastr.info(toast.title);
                break;
              case PluginToastType.error:
                toastr.error(toast.title);
                break;
              case PluginToastType.warning:
                toastr.warning(toast.title);
                break;
              default:
                break;
            }
          });
        }

        break;
      case PluginActions.showSelector:
        {
          if (!message.selectorProps) return;

          setPluginSelectorVisible?.(true);
          setPluginSelectorProps?.({
            ...message.selectorProps,
            pluginName,
          });
        }
        break;

      case PluginActions.closeSelector:
        setPluginSelectorVisible?.(false);
        setPluginSelectorProps?.(null);
        break;

      case PluginActions.updateSelector:
        {
          if (!message.selectorProps) return;

          setPluginSelectorProps?.({
            ...message.selectorProps,
            pluginName,
          });
        }
        break;

      case PluginActions.addFloatingOperationsButton:
        {
          if (!message.floatingOperationsButtonProps) return;
          addPluginFloatingOperations?.({
            ...message.floatingOperationsButtonProps,
            pluginName,
          });
        }
        break;

      case PluginActions.removeFloatingOperationsButton: {
        if (!message.floatingOperationsButtonPropsId) return;
        removePluginFloatingOperations?.(
          message.floatingOperationsButtonPropsId,
        );
        break;
      }

      case PluginActions.updateFloatingOperationsButton:
        {
          if (!message.floatingOperationsButtonProps) return;

          updatePluginFloatingOperations?.({
            ...message.floatingOperationsButtonProps,
            pluginName,
          });
        }
        break;

      case PluginActions.showSettingsModal:
        if (pluginName) {
          setSettingsPluginDialogVisible?.(true);
          setCurrentSettingsDialogPlugin?.({
            pluginName,
          });
        }
        break;

      case PluginActions.closeSettingsModal:
        setSettingsPluginDialogVisible?.(false);
        setCurrentSettingsDialogPlugin?.(null);

        break;

      case PluginActions.showCreateDialogModal:
        if (message.createDialogProps) {
          const payload = {
            ...message.createDialogProps,

            pluginName,
          };

          const event = new Event(Events.CREATE_PLUGIN_FILE);

          event.payload = payload;

          window.dispatchEvent(event);
        }
        break;

      case PluginActions.updateCreateDialogModal:
        if (message.createDialogProps) {
          updateCreateDialogProps?.(message.createDialogProps);
        }
        break;

      case PluginActions.showModal:
        if (message.modalDialogProps) {
          setPluginDialogVisible?.(true);
          setPluginDialogProps?.({ ...message.modalDialogProps, pluginName });
        }
        break;

      case PluginActions.closeModal:
        setPluginDialogVisible?.(false);
        setPluginDialogProps?.(null);
        break;

      case PluginActions.updateContextMenuItems:
        updateContextMenuItems?.(pluginName);

        break;
      case PluginActions.updateInfoPanelItems:
        updateInfoPanelItems?.(pluginName);

      case PluginActions.updateArticleButtonItems:
        updateArticleButtonItems?.(pluginName);

        break;
      case PluginActions.updateMainButtonItems:
        updateMainButtonItems?.(pluginName);

        break;
      case PluginActions.updateProfileMenuItems:
        updateProfileMenuItems?.(pluginName);

        break;
      case PluginActions.updateEventListenerItems:
        updateEventListenerItems?.(pluginName);

        break;
      case PluginActions.updateFileItems:
        updateFileItems?.(pluginName);

        break;

      case PluginActions.sendPostMessage: {
        if (!message.postMessage) return;

        const { postMessage } = message;

        const frame = document.getElementById(`${postMessage.frameId}`);

        if (frame) {
          frame.contentWindow.postMessage(
            JSON.stringify(postMessage.message),
            "*",
          );
        }

        break;
      }
      case PluginActions.saveSettings:
        updatePlugin(pluginName, null, message.settings);
        break;

      case PluginActions.navigate:
        if (!message.navigatePath) return;

        window.DocSpace.navigate(message.navigatePath);

        break;

      case PluginActions.openInfoPanel:
        setPluginDialogVisible(false);
        setSettingsPluginDialogVisible(false);
        setPluginSelectorVisible(false);
        showInfoPanel();

        switch (message.infoPanelTab) {
          case InfoPanelView.infoShare:
            openShareTab();
            break;
          case InfoPanelView.infoMembers:
            openMembersTab();
            break;
          case InfoPanelView.infoDetails:
          case InfoPanelView.infoHistory:
            setView(message.infoPanelTab);
            break;
          default:
            setView(`info_plugin-${message.infoPanelTab}`);
            setFileView(`info_plugin-${message.infoPanelTab}`);
            setRoomsView(`info_plugin-${message.infoPanelTab}`);
        }

        break;
      default:
        break;
    }
  });
};

export const getPluginUrl = (url, file) => {
  const splittedURL = url.split("/");

  splittedURL.pop();

  const path = splittedURL.join("/");

  return combineUrl(
    window.ClientConfig?.proxy?.url,
    config.homepage,
    path,
    file,
  );
};

export const isAIAgents = () => {
  const categoryType = getCategoryType(window.location);

  return (
    categoryType === CategoryType.Chat ||
    categoryType === CategoryType.AIAgent ||
    categoryType === CategoryType.AIAgents ||
    window.location.pathname.startsWith("/ai-agents")
  );
};

export function borderToStyle(border = {}) {
  const { width, style, color, radius } = border;

  const borderValue = [width, style, color].filter(Boolean).join(" ");

  return {
    ...(borderValue ? { border: borderValue } : {}),
    ...(radius ? { borderRadius: radius } : {}),
  };
}
