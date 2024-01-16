import React from "react";
import {
  SECTION_HEADER_NAME,
  SECTION_FILTER_NAME,
  SECTION_BODY_NAME,
  SECTION_FOOTER_NAME,
  SECTION_PAGING_NAME,
  SECTION_INFO_PANEL_BODY_NAME,
  SECTION_INFO_PANEL_HEADER_NAME,
  SECTION_WARNING_NAME,
} from "./Section.constants";

export const parseChildren = (children: React.JSX.Element[]) => {
  let sectionHeaderContent: React.JSX.Element | null = null;
  let sectionFilterContent: React.JSX.Element | null = null;
  let sectionPagingContent: React.JSX.Element | null = null;
  let sectionBodyContent: React.JSX.Element | null = null;
  let sectionFooterContent: React.JSX.Element | null = null;
  let infoPanelBodyContent: React.JSX.Element | null = null;
  let infoPanelHeaderContent: React.JSX.Element | null = null;
  let sectionWarningContent: React.JSX.Element | null = null;

  React.Children.forEach(children, (child: React.JSX.Element) => {
    if (!React.isValidElement(child)) return;

    const type = child.type as { displayName?: string; name?: string };

    const childType = type?.displayName || type?.name || "";

    const props = child.props as { children: React.JSX.Element };

    switch (childType) {
      case SECTION_HEADER_NAME:
        sectionHeaderContent = props.children;
        break;
      case SECTION_FILTER_NAME:
        sectionFilterContent = props.children;
        break;
      case SECTION_BODY_NAME:
        sectionBodyContent = props.children;
        break;
      case SECTION_FOOTER_NAME:
        sectionFooterContent = props.children;
        break;
      case SECTION_PAGING_NAME:
        sectionPagingContent = props.children;
        break;
      case SECTION_INFO_PANEL_BODY_NAME:
        infoPanelBodyContent = props.children;
        break;
      case SECTION_INFO_PANEL_HEADER_NAME:
        infoPanelHeaderContent = props.children;
        break;
      case SECTION_WARNING_NAME:
        sectionWarningContent = props.children;
        break;
      default:
        break;
    }
  });

  const arr = [
    sectionHeaderContent,
    sectionFilterContent,
    sectionBodyContent,
    sectionFooterContent,
    sectionPagingContent,
    sectionWarningContent,
    infoPanelBodyContent,
    infoPanelHeaderContent,
  ];

  return arr;
};
