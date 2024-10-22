import React from "react";

import { Text } from "../text";

import {
  EmptyViewBody,
  EmptyViewHeader,
  EmptyViewWrapper,
} from "./EmptyView.styled";
import EmptyViewOption from "./EmptyView.option";
import type { EmptyViewProps } from "./EmptyView.types";

export const EmptyView = ({
  description,
  icon,
  options,
  title,
}: EmptyViewProps) => {
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
          {options.map((option) => (
            <EmptyViewOption key={option.key} option={option} />
          ))}
        </EmptyViewBody>
      )}
    </EmptyViewWrapper>
  );
};
