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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Textarea } from "@docspace/shared/components/textarea";
import { TextInput } from "@docspace/shared/components/text-input";
import { Label } from "@docspace/shared/components/label";
import { Button } from "@docspace/shared/components/button";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { ComboBox } from "@docspace/shared/components/combobox";

import { PluginComponents } from "./enums";

import { borderToStyle, messageActions } from "./utils";

const PLUGIN_IFRAME_TITLE = "Plugin iframe";

const PropsContext = React.createContext({});

export const PluginComponent = inject(({ pluginStore }) => {
  const {
    updatePluginStatus,
    setCurrentSettingsDialogPlugin,
    setSettingsPluginDialogVisible,
    setPluginDialogVisible,
    setPluginDialogProps,
    updateContextMenuItems,
    updateInfoPanelItems,
    updateMainButtonItems,
    updateProfileMenuItems,
    updateEventListenerItems,
    updateFileItems,
    updatePlugin,
  } = pluginStore;

  return {
    updatePluginStatus,
    setCurrentSettingsDialogPlugin,
    setSettingsPluginDialogVisible,
    setPluginDialogVisible,
    setPluginDialogProps,
    updateContextMenuItems,
    updateInfoPanelItems,
    updateMainButtonItems,
    updateProfileMenuItems,
    updateEventListenerItems,
    updateFileItems,
    updatePlugin,
  };
})(
  observer(
    ({
      component,

      pluginName,

      setSettingsPluginDialogVisible,
      setCurrentSettingsDialogPlugin,
      updatePluginStatus,
      setPluginDialogVisible,
      setPluginDialogProps,

      updateContextMenuItems,
      updateInfoPanelItems,
      updateMainButtonItems,
      updateProfileMenuItems,
      updateEventListenerItems,
      updateFileItems,
      updatePlugin,
    }) => {
      const [elementProps, setElementProps] = React.useState(component.props);

      const {
        contextProps,
        updatePropsContext,
        isRequestRunning,
        setIsRequestRunning,
        setModalRequestRunning,
        modalRequestRunning,
      } = React.use(PropsContext);

      React.useEffect(() => {
        if (
          !component.contextName ||
          (contextProps && !contextProps[component.contextName])
        )
          return;

        contextProps && setElementProps(contextProps[component.contextName]);
      }, [contextProps && contextProps[component.contextName]]);

      React.useEffect(() => {
        setElementProps(component.props);
      }, [component.props]);

      const getElement = () => {
        const componentName = component.component;

        let elementStyles = {};
        if (elementProps) {
          const {
            widthProp,
            paddingProp,
            displayProp,
            borderProp,
            backgroundProp,
            flexProp,
            heightProp,
            marginProp,
            overflowProp,
            ...elementRest
          } = elementProps;

          elementStyles = {
            width: widthProp,
            height: heightProp,
            padding: paddingProp,
            margin: marginProp,
            display: displayProp,
            background: backgroundProp,
            flex: flexProp,
            overflow: overflowProp,
            ...borderToStyle(borderProp),
            ...elementRest,
          };
        }

        switch (componentName) {
          case PluginComponents.box: {
            const childrenComponents = elementProps?.children?.map(
              (item, index) => (
                <PluginComponent
                  key={`${pluginName}-box-${item.component}-${index}`}
                  component={item}
                  pluginName={pluginName}
                />
              ),
            );

            return <div style={elementStyles}>{childrenComponents}</div>;
          }

          case PluginComponents.text: {
            return <Text {...elementProps}>{elementProps.text}</Text>;
          }

          case PluginComponents.label: {
            return <Label {...elementProps} />;
          }

          case PluginComponents.checkbox: {
            const onChangeAction = () => {
              const message = elementProps.onChange();

              messageActions({
                message,
                setElementProps,
                pluginName,
                setSettingsPluginDialogVisible,
                setCurrentSettingsDialogPlugin,
                updatePluginStatus,
                updatePropsContext,
                setPluginDialogVisible,
                setPluginDialogProps,
                updateContextMenuItems,
                updateInfoPanelItems,
                updateMainButtonItems,
                updateProfileMenuItems,
                updateEventListenerItems,
                updateFileItems,
              });
            };

            return <Checkbox {...elementProps} onChange={onChangeAction} />;
          }

          case PluginComponents.toggleButton: {
            const onChangeAction = () => {
              const message = elementProps.onChange();

              messageActions({
                message,
                setElementProps,
                pluginName,
                setSettingsPluginDialogVisible,
                setCurrentSettingsDialogPlugin,
                updatePluginStatus,
                updatePropsContext,
                setPluginDialogVisible,
                setPluginDialogProps,
                updateContextMenuItems,
                updateInfoPanelItems,
                updateMainButtonItems,
                updateProfileMenuItems,
                updateEventListenerItems,
                updateFileItems,
              });
            };

            return <ToggleButton {...elementProps} onChange={onChangeAction} />;
          }

          case PluginComponents.textArea: {
            const onChangeAction = (e) => {
              const message = elementProps.onChange(e.target.value);

              messageActions({
                message,
                setElementProps,
                pluginName,
                setSettingsPluginDialogVisible,
                setCurrentSettingsDialogPlugin,
                updatePluginStatus,
                updatePropsContext,
                setPluginDialogVisible,
                setPluginDialogProps,
                updateContextMenuItems,
                updateInfoPanelItems,
                updateMainButtonItems,
                updateProfileMenuItems,
                updateEventListenerItems,
                updateFileItems,
              });
            };

            return <Textarea {...elementProps} onChange={onChangeAction} />;
          }

          case PluginComponents.input: {
            const onChangeAction = (e) => {
              const message = elementProps.onChange(e.target.value);

              messageActions({
                message,
                setElementProps,
                pluginName,
                setSettingsPluginDialogVisible,
                setCurrentSettingsDialogPlugin,
                updatePluginStatus,
                updatePropsContext,
                setPluginDialogVisible,
                setPluginDialogProps,
                updateContextMenuItems,
                updateInfoPanelItems,
                updateMainButtonItems,
                updateProfileMenuItems,
                updateEventListenerItems,
                updateFileItems,
              });
            };

            return <TextInput {...elementProps} onChange={onChangeAction} />;
          }

          case PluginComponents.button: {
            const {
              withLoadingAfterClick,
              disableWhileRequestRunning,
              isSaveButton,
              settingsModalRequestRunning,
              setSettingsModalRequestRunning,
              onCloseAction,
              ...rest
            } = elementProps;

            const onClickAction = async () => {
              if (withLoadingAfterClick) {
                setIsRequestRunning && setIsRequestRunning(true);
                setModalRequestRunning && setModalRequestRunning(true);
                if (isSaveButton) {
                  setSettingsModalRequestRunning &&
                    setSettingsModalRequestRunning(true);
                }
              }

              const message = await elementProps.onClick();

              messageActions({
                message,
                setElementProps,
                pluginName,
                setSettingsPluginDialogVisible,
                setCurrentSettingsDialogPlugin,
                updatePluginStatus,
                updatePropsContext,
                setPluginDialogVisible,
                setPluginDialogProps,
                updateContextMenuItems,
                updateInfoPanelItems,
                updateMainButtonItems,
                updateProfileMenuItems,
                updateEventListenerItems,
                updateFileItems,
                updatePlugin,
              });

              setIsRequestRunning && setIsRequestRunning(false);
              setModalRequestRunning && setModalRequestRunning(false);
              if (isSaveButton) {
                setSettingsModalRequestRunning &&
                  setSettingsModalRequestRunning(false);
                onCloseAction && onCloseAction();
              }
            };

            const isLoading = withLoadingAfterClick
              ? isSaveButton
                ? settingsModalRequestRunning
                : isRequestRunning || rest.isLoading || modalRequestRunning
              : rest.isLoading;

            const isDisabled = disableWhileRequestRunning
              ? isSaveButton
                ? settingsModalRequestRunning
                : isRequestRunning || rest.isDisabled || modalRequestRunning
              : rest.isDisabled;

            return (
              <Button
                {...rest}
                isLoading={isLoading}
                isDisabled={isDisabled}
                onClick={onClickAction}
              />
            );
          }

          case PluginComponents.comboBox: {
            const onSelectAction = (option) => {
              const message = elementProps.onSelect(option);

              messageActions({
                message,
                setElementProps,
                pluginName,
                setSettingsPluginDialogVisible,
                setCurrentSettingsDialogPlugin,
                updatePluginStatus,
                updatePropsContext,
                setPluginDialogVisible,
                setPluginDialogProps,
                updateContextMenuItems,
                updateInfoPanelItems,
                updateMainButtonItems,
                updateProfileMenuItems,
                updateEventListenerItems,
                updateFileItems,
              });
            };

            return <ComboBox {...elementProps} onSelect={onSelectAction} />;
          }

          case PluginComponents.iFrame: {
            return (
              <iframe
                title={PLUGIN_IFRAME_TITLE}
                {...elementProps}
                style={{
                  minHeight: "100%",
                  border: "none",
                  ...elementProps.style,
                }}
              />
            );
          }

          case PluginComponents.img: {
            return <img alt="Plugin" {...elementProps} />;
          }

          case PluginComponents.skeleton: {
            return <RectangleSkeleton {...elementProps} />;
          }
          default:
            break;
        }
      };

      const element = getElement();

      return element;
    },
  ),
);

const WrappedComponent = ({
  pluginName,

  component,

  saveButton,
  setSaveButtonProps,

  setModalRequestRunning,
  modalRequestRunning,
}) => {
  const [contextProps, setContextProps] = React.useState({});

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const updatePropsContext = (newContextProps) => {
    const newProps = { ...contextProps };

    newContextProps.forEach(({ name, props }) => {
      if (saveButton && name === saveButton.contextName) {
        setSaveButtonProps && setSaveButtonProps((val) => ({ ...val, props }));
      } else {
        newProps[name] = props;
      }
    });

    setContextProps(newProps);
  };

  const contextValue = useMemo(
    () => ({
      contextProps,
      updatePropsContext,
      isRequestRunning,
      setIsRequestRunning,
      setModalRequestRunning,
      modalRequestRunning,
    }),
    [
      contextProps,
      isRequestRunning,
      setModalRequestRunning,
      modalRequestRunning,
    ],
  );

  return (
    <PropsContext value={contextValue}>
      <PluginComponent component={component} pluginName={pluginName} />
    </PropsContext>
  );
};

export default WrappedComponent;
