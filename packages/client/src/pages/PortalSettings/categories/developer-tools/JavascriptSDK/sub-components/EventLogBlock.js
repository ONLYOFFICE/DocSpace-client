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

import { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { injectDefaultTheme, NoUserSelect } from "@docspace/shared/utils";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Link } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { DropDownItem } from "@docspace/ui-kit/components/drop-down-item";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/ui-kit/components/toast";

const GUTTER_WIDTH = 62;

const StyledWrapper = styled.div.attrs(injectDefaultTheme)`
  max-width: 800px;
  width: 100%;
  margin-top: 16px;
  border: 1px solid ${(p) => p.theme.plugins.borderColor};
  border-radius: 6px;
  overflow: hidden;
  background-color: ${(p) =>
    p.theme.isBase
      ? p.theme.backgroundColor
      : p.theme.sdkPresets.previewBackgroundColor};
  color: ${(p) =>
    p.theme.isBase ? globalColors.black : globalColors.darkGrayDark};
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
    monospace;
  font-size: 13px;
  line-height: 20px;
`;

const Header = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid ${(p) => p.theme.plugins.borderColor};
  background-color: ${(p) =>
    p.theme.isBase ? globalColors.grayLight : globalColors.grayDarkMid};
  ${NoUserSelect}
`;

const HeaderTitle = styled.span.attrs(injectDefaultTheme)`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) =>
    p.theme.isBase ? globalColors.black : globalColors.darkGrayDark};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterButtonWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const LogScroller = styled.div.attrs(injectDefaultTheme)`
  overflow-y: auto;
  height: 280px;
  display: flex;
  flex-direction: column;

  scrollbar-width: thin;
  scrollbar-color: ${(p) => p.theme.plugins.borderColor} transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${(p) => p.theme.plugins.borderColor};
    border-radius: 4px;
  }
`;

const EmptyState = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 12px;
  color: ${(p) => (p.theme.isBase ? globalColors.gray : globalColors.grayDark)};
  font-style: italic;
  ${NoUserSelect}
`;

const LogEntry = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  min-height: 28px;
  cursor: ${(p) => (p.$expandable ? "pointer" : "default")};

  &:hover {
    background-color: ${(p) =>
      p.theme.isBase
        ? globalColors.lightGrayHover
        : globalColors.lightDarkGrayHover};
  }
`;

const Gutter = styled.span.attrs(injectDefaultTheme)`
  flex-shrink: 0;
  width: ${GUTTER_WIDTH}px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
  font-size: 12px;
  color: ${(p) => (p.theme.isBase ? globalColors.gray : globalColors.grayDark)};
  white-space: nowrap;
  ${NoUserSelect}
`;

const Chevron = styled.span`
  font-size: 9px;
  line-height: 1;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: transform 0.15s ease;
  transform: ${(p) => (p.$expanded ? "rotate(90deg)" : "rotate(0deg)")};
  display: inline-block;
`;

const EventName = styled.span`
  flex-shrink: 0;
  padding: 0 6px 0 10px;
  font-weight: 600;
  white-space: nowrap;
`;

const Arrow = styled.span.attrs(injectDefaultTheme)`
  flex-shrink: 0;
  color: ${(p) => (p.theme.isBase ? globalColors.gray : globalColors.grayDark)};
  padding-right: 6px;
  ${NoUserSelect}
`;

const EventData = styled.span.attrs(injectDefaultTheme)`
  color: ${(p) => p.theme.sdkPresets.secondaryColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
  padding-right: 12px;
`;

const ExpandedRow = styled.div.attrs(injectDefaultTheme)`
  position: relative;
  border-top: 1px solid ${(p) => p.theme.plugins.borderColor};
`;

const CopyButton = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const ExpandedContent = styled.pre.attrs(injectDefaultTheme)`
  margin: 0;
  padding: 6px 8px;
  padding-right: 28px;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  color: ${(p) => p.theme.sdkPresets.secondaryColor};
  white-space: pre-wrap;
  word-break: break-all;
`;

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const formatCompact = (data, voidLabel) => {
  if (data === undefined || data === null) return voidLabel;
  try {
    const str = JSON.stringify(data);
    return str.length > 120 ? `${str.slice(0, 120)}\u2026` : str;
  } catch {
    return String(data);
  }
};

const formatExpanded = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

const isExpandable = (data) =>
  data !== null && data !== undefined && typeof data === "object";

export const EventLogBlock = ({ events, onClear, eventTypes, t }) => {
  const scrollerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [hiddenEvents, setHiddenEvents] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const displayedEvents = useMemo(
    () => events.filter((e) => !hiddenEvents.has(e.event)),
    [events, hiddenEvents],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (isAtBottom) el.scrollTop = el.scrollHeight;
  }, [displayedEvents]);

  useEffect(() => {
    if (events.length === 0) setExpandedIds(new Set());
  }, [events.length]);

  const toggle = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleEvent = (eventName) => {
    setHiddenEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventName)) next.delete(eventName);
      else next.add(eventName);
      return next;
    });
  };

  const hasFilter = eventTypes?.length > 0;
  const hasHidden = hiddenEvents.size > 0;

  return (
    <StyledWrapper>
      <Header>
        <HeaderActions>
          <HeaderTitle>{t("EventLog")}</HeaderTitle>
          {hasFilter && (
            <FilterButtonWrapper ref={filterButtonRef}>
              <IconButton
                size={16}
                color={hasHidden ? globalColors.lightBlueMain : undefined}
                onClick={() => setFilterOpen((v) => !v)}
                iconName={VerticalDotsReactSvgUrl}
              />
              <DropDown
                open={filterOpen}
                forwardedRef={filterButtonRef}
                clickOutsideAction={() => setFilterOpen(false)}
                directionY="bottom"
                directionX="right"
              >
                {eventTypes.map((eventName) => (
                  <DropDownItem
                    key={eventName}
                    label={eventName}
                    withToggle
                    checked={!hiddenEvents.has(eventName)}
                    onClick={() => toggleEvent(eventName)}
                    stopMouseDownPropagation
                    style={{ lineHeight: "28px", padding: "0 8px", gap: "24px" }}
                  />
                ))}
              </DropDown>
            </FilterButtonWrapper>
          )}
        </HeaderActions>
        {events.length > 0 && (
          <Link type="action" fontSize="13px" onClick={onClear}>
            {t("Common:ClearAll")}
          </Link>
        )}
      </Header>
      <LogScroller ref={scrollerRef}>
        {displayedEvents.length === 0 ? (
          <EmptyState>{t("NoEventsYet")}</EmptyState>
        ) : (
          displayedEvents.map((entry) => {
            const expandable = isExpandable(entry.data);
            const expanded = expandedIds.has(entry.id);

            return (
              <div key={entry.id}>
                <LogEntry
                  $expandable={expandable}
                  onClick={expandable ? () => toggle(entry.id) : undefined}
                >
                  <Gutter>
                    <Chevron $visible={expandable} $expanded={expanded}>
                      {"\u25B6"}
                    </Chevron>
                    <span>{formatTime(entry.timestamp)}</span>
                  </Gutter>
                  <EventName>{entry.event}</EventName>
                  <Arrow>→</Arrow>
                  <EventData>{formatCompact(entry.data, t("VoidReturn"))}</EventData>
                </LogEntry>
                {expanded && (
                  <ExpandedRow>
                    <ExpandedContent>
                      {formatExpanded(entry.data)}
                    </ExpandedContent>
                    <CopyButton>
                      <IconButton
                        size={16}
                        iconName={CopyReactSvgUrl}
                        onClick={() => {
                          copy(formatExpanded(entry.data));
                          toastr.success(t("Common:Copy"));
                        }}
                      />
                    </CopyButton>
                  </ExpandedRow>
                )}
              </div>
            );
          })
        )}
      </LogScroller>
    </StyledWrapper>
  );
};
