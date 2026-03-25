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

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";
import type {
  Component,
  IBox,
  ICheckbox,
  IComboBox,
  IFrame,
  IIconButton,
  IImage,
  IInput,
  ILabel,
  ILink,
  IMessage,
  ISkeleton,
  IText,
  ITextArea,
  IToggleButton,
} from "@onlyoffice/docspace-plugin-sdk";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { Text } from "@docspace/ui-kit/components/text";
import type { TextProps } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Label } from "@docspace/ui-kit/components/label";
import { Button } from "@docspace/ui-kit/components/button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link } from "@docspace/ui-kit/components/link";

import type PluginStore from "SRC_DIR/store/PluginStore";

import { PluginComponents } from "./enums";
import { borderToStyle, messageActions } from "./utils";
import type {
  TAllComponentProps,
  TButtonElementProps,
  TContextProps,
  TPluginComponentOwnProps,
  TPluginComponentProps,
  TPropsContext,
  TWrappedComponentProps,
} from "./WrappedComponent.types";
import { TMessageActionsParams } from "./types";

const PLUGIN_IFRAME_TITLE = "Plugin iframe";

const PropsContext = React.createContext<TPropsContext>({} as TPropsContext);

export const PluginComponent = inject(
  ({ pluginStore }: { pluginStore: PluginStore }) => {
    const {
      getPluginIconUrl,
      updatePluginStatus,
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
      setPluginSelectorVisible,
      setPluginSelectorProps,
      setPluginMediaViewerProps,
      setPluginMediaViewerVisible,
    } = pluginStore;

    return {
      getPluginIconUrl,
      updatePluginStatus,
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
      setPluginSelectorVisible,
      setPluginSelectorProps,
      setPluginMediaViewerProps,
      setPluginMediaViewerVisible,
    };
  },
)(
  observer(
    ({
      component,
      pluginName,
      getPluginIconUrl,
      setSettingsPluginDialogVisible,
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
      setPluginSelectorVisible,
      setPluginSelectorProps,
      setPluginMediaViewerProps,
      setPluginMediaViewerVisible,
    }: TPluginComponentProps) => {
      const [elementProps, setElementProps] =
        React.useState<TAllComponentProps>(component.props);

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
      }, [
        component.contextName
          ? contextProps?.[component.contextName]
          : undefined,
      ]);

      React.useEffect(() => {
        setElementProps(component.props);
      }, [component.props]);

      const sharedMessageParams: Omit<TMessageActionsParams, "message"> = {
        setElementProps,
        pluginName,
        setSettingsPluginDialogVisible,
        updatePlugin,
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
        setPluginSelectorVisible,
        setPluginSelectorProps,
        setPluginMediaViewerProps,
        setPluginMediaViewerVisible,
      };

      const getElement = (): React.ReactElement | null | undefined => {
        const componentName = component.component;

        const PluginComponentRecursive =
          PluginComponent as unknown as React.ComponentType<TPluginComponentOwnProps>;

        switch (componentName) {
          case PluginComponents.box: {
            const boxProps = elementProps as IBox;

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
              id,
              className,
              children,
              // All remaining IBox fields are CSS layout properties
              // (flexDirection, alignItems, justifyContent, …).
              ...cssLayoutProps
            } = boxProps || {};

            const elementStyles: React.CSSProperties = {
              width: widthProp,
              height: heightProp,
              padding: paddingProp,
              margin: marginProp,
              display: displayProp,
              background: backgroundProp,
              flex: flexProp,
              overflow: overflowProp,
              ...borderToStyle(borderProp),
              // cssLayoutProps only contains valid CSS property names from IBox.
              ...(cssLayoutProps as React.CSSProperties),
            };

            const childrenComponents = children?.map((item, index) => {
              return (
                <PluginComponentRecursive
                  key={`${pluginName}-box-${item.component}-${index}`}
                  component={item}
                  pluginName={pluginName}
                />
              );
            });

            return (
              <div id={id} className={className} style={elementStyles}>
                {childrenComponents}
              </div>
            );
          }

          case PluginComponents.text: {
            const { text, textAlign, ...rest } = elementProps as IText;
            return (
              <Text {...rest} textAlign={textAlign as TextProps["textAlign"]}>
                {text}
              </Text>
            );
          }

          case PluginComponents.label: {
            return <Label {...(elementProps as ILabel)} />;
          }

          case PluginComponents.checkbox: {
            const { onChange, ...restProps } = elementProps as ICheckbox;

            const onChangeAction = () => {
              const message = onChange();
              if (message) messageActions({ ...sharedMessageParams, message });
            };

            return <Checkbox {...restProps} onChange={onChangeAction} />;
          }

          case PluginComponents.toggleButton: {
            const { onChange, ...restProps } = elementProps as IToggleButton;

            const onChangeAction = () => {
              const message = onChange();
              if (message) messageActions({ ...sharedMessageParams, message });
            };

            return <ToggleButton {...restProps} onChange={onChangeAction} />;
          }

          case PluginComponents.textArea: {
            const {
              onChange,
              // TODO: fix the type mismatch for copyInfoText instead of dropping it
              copyInfoText: _copyInfoText,
              ...restProps
            } = elementProps as ITextArea;

            const onChangeAction = (
              e: React.ChangeEvent<HTMLTextAreaElement>,
            ) => {
              const message = onChange(e.target.value);
              if (message) messageActions({ ...sharedMessageParams, message });
            };

            return <Textarea {...restProps} onChange={onChangeAction} />;
          }

          case PluginComponents.input: {
            const {
              onChange,
              onBlur,
              onFocus,
              // TODO: fix the type mismatch for children instead of dropping it
              children: _children,
              ...restProps
            } = elementProps as IInput;

            const onEventAction =
              (eventHandler?: (value: string) => IMessage | void) =>
              (
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FocusEvent<HTMLInputElement>,
              ) => {
                if (!eventHandler) return;
                const message = eventHandler(e.target.value);
                if (message)
                  messageActions({ ...sharedMessageParams, message });
              };

            return (
              <TextInput
                {...(restProps as unknown as React.ComponentProps<
                  typeof TextInput
                >)}
                onChange={onEventAction(onChange)}
                onBlur={onEventAction(onBlur)}
                onFocus={onEventAction(onFocus)}
              />
            );
          }

          case PluginComponents.button: {
            const {
              withLoadingAfterClick,
              disableWhileRequestRunning,
              isSaveButton,
              settingsModalRequestRunning,
              setSettingsModalRequestRunning,
              onCloseAction,
              onClick,
              ...rest
            } = elementProps as TButtonElementProps;

            const onClickAction = async () => {
              if (withLoadingAfterClick) {
                setIsRequestRunning?.(true);
                setModalRequestRunning?.(true);
                if (isSaveButton) setSettingsModalRequestRunning?.(true);
              }

              const message = await onClick();
              if (message)
                messageActions({
                  ...sharedMessageParams,
                  message,
                  updatePlugin,
                });

              setIsRequestRunning?.(false);
              setModalRequestRunning?.(false);
              if (isSaveButton) {
                setSettingsModalRequestRunning?.(false);
                onCloseAction?.();
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
                {...(rest as unknown as React.ComponentProps<typeof Button>)}
                isLoading={isLoading}
                isDisabled={isDisabled}
                onClick={onClickAction}
              />
            );
          }

          case PluginComponents.comboBox: {
            const { onSelect, ...restProps } = elementProps as IComboBox;

            const onSelectAction = (
              option: React.ComponentProps<typeof ComboBox>["options"][number],
            ) => {
              if (!onSelect) return;
              const message = onSelect(option as IComboBox["options"][number]);
              if (message) messageActions({ ...sharedMessageParams, message });
            };

            return (
              <ComboBox
                {...(restProps as React.ComponentProps<typeof ComboBox>)}
                onSelect={onSelectAction}
              />
            );
          }

          case PluginComponents.iFrame: {
            const { style, ...frameRest } = elementProps as IFrame;
            return (
              <iframe
                title={PLUGIN_IFRAME_TITLE}
                {...frameRest}
                style={{
                  minHeight: "100%",
                  border: "none",
                  ...(style as React.CSSProperties),
                }}
              />
            );
          }

          case PluginComponents.img: {
            return (
              <img
                {...(elementProps as React.ImgHTMLAttributes<HTMLImageElement>)}
              />
            );
          }

          case PluginComponents.skeleton: {
            return <RectangleSkeleton {...(elementProps as ISkeleton)} />;
          }

          case PluginComponents.iconButton: {
            const { onClick, iconName, iconClickName, iconHoverName, ...rest } =
              elementProps as IIconButton;

            const onClickAction = async () => {
              if (!onClick) return;
              const message = await onClick();
              if (message) messageActions({ ...sharedMessageParams, message });
            };

            const icon = iconName
              ? getPluginIconUrl(pluginName, iconName)
              : undefined;
            const iconHover = iconHoverName
              ? getPluginIconUrl(pluginName, iconHoverName)
              : undefined;
            const iconClick = iconClickName
              ? getPluginIconUrl(pluginName, iconClickName)
              : undefined;

            return (
              <IconButton
                {...rest}
                iconName={icon}
                iconHoverName={iconHover}
                iconClickName={iconClick}
                onClick={onClickAction}
              />
            );
          }

          case PluginComponents.link: {
            const { text, onClick, ...restProps } = elementProps as ILink;

            const onClickAction = async () => {
              if (!onClick) return;
              const message = await onClick();
              if (message) messageActions({ ...sharedMessageParams, message });
            };

            return (
              <Link
                {...(restProps as React.ComponentProps<typeof Link>)}
                onClick={onClickAction}
              >
                {text}
              </Link>
            );
          }

          default:
            break;
        }
      };

      return getElement() ?? null;
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
}: TWrappedComponentProps) => {
  const [contextProps, setContextProps] = React.useState<TContextProps>({});
  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const updatePropsContext = (
    newContextProps: NonNullable<IMessage["contextProps"]>,
  ) => {
    const newProps = { ...contextProps };

    newContextProps.forEach(({ name, props }) => {
      if (saveButton && name === saveButton.contextName) {
        setSaveButtonProps?.((val) => ({ ...val, props }) as Component);
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
      {React.createElement(
        PluginComponent as unknown as React.ComponentType<TPluginComponentOwnProps>,
        { component, pluginName },
      )}
    </PropsContext>
  );
};

export default WrappedComponent;

