import React from "react";
import { Link } from "react-router-dom";

import { Text } from "../text";

import {
  EmptyViewBody,
  EmptyViewHeader,
  EmptyViewWrapper,
} from "./EmptyView.styled";
import { EmptyViewItem } from "./EmptyView.item";
import type {
  EmptyViewLinkType,
  EmptyViewOptionsType,
  EmptyViewProps,
} from "./EmptyView.types";

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
            <Link
              className="ev-link"
              to={options.to}
              state={options.state}
              onClick={options.onClick}
            >
              {options.icon}
              <span>{options.description}</span>
            </Link>
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
