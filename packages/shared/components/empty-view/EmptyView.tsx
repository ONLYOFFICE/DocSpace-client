import React, { useContext } from "react";

import { Text } from "../text";

import {
  EmptyViewBody,
  EmptyViewHeader,
  EmptyViewWrapper,
  StyledLink,
} from "./EmptyView.styled";
import { EmptyViewItem } from "./EmptyView.item";
import type {
  EmptyViewLinkType,
  EmptyViewOptionsType,
  EmptyViewProps,
} from "./EmptyView.types";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { ThemeContext } from "styled-components";

const isEmptyLinkOptions = (
  options: EmptyViewOptionsType,
): options is EmptyViewLinkType => {
  return typeof options === "object" && "to" in options;
};

export const EmptyView = ({
  description,
  icon,
  options,
  title,
}: EmptyViewProps) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <EmptyViewWrapper>
      <EmptyViewHeader>
        {icon}
        <Text
          as="h3"
          fontWeight="700"
          lineHeight="22px"
          className="ev-header"
          noSelect
        >
          {title}
        </Text>
        <Text as="p" fontSize="12px" className="ev-subheading" noSelect>
          {description}
        </Text>
      </EmptyViewHeader>
      {options && (
        <EmptyViewBody>
          {isEmptyLinkOptions(options) ? (
            <StyledLink
              className="ev-link"
              to={options.to}
              state={options.state}
              onClick={options.onClick}
              $currentColorScheme={currentColorScheme}
            >
              {options.icon}
              <span>{options.description}</span>
            </StyledLink>
          ) : (
            options.map((option) => (
              <EmptyViewItem {...option} key={option.key} />
            ))
          )}
        </EmptyViewBody>
      )}
    </EmptyViewWrapper>
  );
};
