/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import type {
  ButtonGroup,
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
import { TextInput, InputSize } from "@docspace/ui-kit/components/text-input";
import { Label } from "@docspace/ui-kit/components/label";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link } from "@docspace/ui-kit/components/link";

import type PluginStore from "SRC_DIR/store/PluginStore";

import { PluginComponents } from "./enums";
import { borderToStyle } from "./utils";
import type {
  TAllComponentProps,
  TButtonElementProps,
  TContextProps,
  TPluginComponentOwnProps,
  TPluginComponentProps,
  TPropsContext,
  TWrappedComponentProps,
} from "./WrappedComponent.types";

const PLUGIN_IFRAME_TITLE = "Plugin iframe";

const BUTTON_SIZE_MAP: Partial<Record<string, ButtonSize>> = {
  "extra-small": ButtonSize.extraSmall,
  extraSmall: ButtonSize.extraSmall,
  small: ButtonSize.small,
  normal: ButtonSize.normal,
  medium: ButtonSize.medium,
};

const INPUT_SIZE_MAP: Partial<Record<string, InputSize>> = {
  base: InputSize.base,
  middle: InputSize.middle,
  big: InputSize.large,
  huge: InputSize.large,
  large: InputSize.large,
};

const PropsContext = React.createContext<TPropsContext>({} as TPropsContext);

const PluginComponentBase = inject(
  ({ pluginStore }: { pluginStore: PluginStore }) => {
    const { getPluginIconUrl, dispatchMessage } = pluginStore;

    return { getPluginIconUrl, dispatchMessage };
  },
)(
  observer(
    ({
      component,
      pluginName,
      getPluginIconUrl,
      dispatchMessage,
    }: TPluginComponentProps) => {
      const { t } = useTranslation("Common");

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

      const dispatch = (message: IMessage | void) =>
        dispatchMessage({
          message,
          pluginName,
          setElementProps,
          updatePropsContext,
        });

      const getElement = (): React.ReactElement | null | undefined => {
        const componentName = component.component;

        switch (componentName) {
          case PluginComponents.box: {
            const boxProps = (elementProps ?? {}) as IBox;

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
              ...cssLayoutProps
            } = boxProps;

            const elementStyles: React.CSSProperties = {
              boxSizing: "border-box",
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
                <PluginComponent
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
              const message = onChange?.();
              dispatch(message);
            };

            return <Checkbox {...restProps} onChange={onChangeAction} />;
          }

          case PluginComponents.toggleButton: {
            const { onChange, ...restProps } = elementProps as IToggleButton;

            const onChangeAction = () => {
              const message = onChange?.();
              dispatch(message);
            };

            return <ToggleButton {...restProps} onChange={onChangeAction} />;
          }

          case PluginComponents.textArea: {
            const { onChange, copyInfoText, ...restProps } =
              elementProps as ITextArea;

            const onChangeAction = (
              e: React.ChangeEvent<HTMLTextAreaElement>,
            ) => {
              const message = onChange?.(e.target.value);
              dispatch(message);
            };

            return (
              <Textarea
                {...restProps}
                copyInfoText={
                  copyInfoText ? t("Common:CopiedToClipboard") : undefined
                }
                onChange={onChangeAction}
              />
            );
          }

          case PluginComponents.input: {
            const {
              onChange,
              onBlur,
              onFocus,
              size,
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
                dispatch(eventHandler?.(e.target.value));
              };

            return (
              <TextInput
                {...(restProps as unknown as React.ComponentProps<
                  typeof TextInput
                >)}
                size={size ? INPUT_SIZE_MAP[size] : undefined}
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
              size,
              ...rest
            } = elementProps as TButtonElementProps;

            const onClickAction = async () => {
              if (withLoadingAfterClick) {
                setIsRequestRunning?.(true);
                setModalRequestRunning?.(true);
                if (isSaveButton) setSettingsModalRequestRunning?.(true);
              }

              const message = await onClick?.();
              dispatch(message);

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
                {...rest}
                size={BUTTON_SIZE_MAP[size]}
                isLoading={isLoading}
                isDisabled={isDisabled}
                onClick={onClickAction}
              />
            );
          }

          case PluginComponents.comboBox: {
            const { onSelect, ...restProps } = elementProps as IComboBox;

            const onSelectAction = async (
              option: React.ComponentProps<typeof ComboBox>["options"][number],
            ) => {
              const message = await onSelect?.(
                option as IComboBox["options"][number],
              );
              dispatch(message);
            };

            return (
              <ComboBox
                {...(restProps as React.ComponentProps<typeof ComboBox>)}
                onSelect={onSelectAction}
              />
            );
          }

          case PluginComponents.iFrame: {
            const { style, src, ...frameRest } = elementProps as IFrame;
            return (
              <iframe
                title={PLUGIN_IFRAME_TITLE}
                {...frameRest}
                src={src || undefined}
                style={{
                  minHeight: "100%",
                  border: "none",
                  ...(style as React.CSSProperties),
                }}
              />
            );
          }

          case PluginComponents.img: {
            const { alt, style, src, ...restProps } = elementProps as IImage;

            return (
              <img
                {...restProps}
                src={src || undefined}
                alt={alt ?? "Plugin"}
                style={style as React.CSSProperties}
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
              const message = await onClick?.();
              dispatch(message);
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
              const message = await onClick?.();
              dispatch(message);
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

export const PluginComponent =
  PluginComponentBase as unknown as React.ComponentType<TPluginComponentOwnProps>;

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

  const updatePropsContext = React.useCallback(
    (newContextProps: NonNullable<IMessage["contextProps"]>) => {
      newContextProps?.forEach(({ name, props }) => {
        if (saveButton && name === saveButton.contextName) {
          setSaveButtonProps?.((val) => ({ ...val, props }) as ButtonGroup);
          return;
        }

        setContextProps((prev) => ({ ...prev, [name]: props }));
      });
    },
    [saveButton, setSaveButtonProps],
  );

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
      updatePropsContext,
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
