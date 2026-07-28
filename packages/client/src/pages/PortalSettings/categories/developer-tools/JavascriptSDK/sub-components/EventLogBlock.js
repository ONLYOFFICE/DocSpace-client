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

import { useRef, useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { Link } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { DropDownItem } from "@docspace/ui-kit/components/drop-down-item";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/ui-kit/components/toast";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import styles from "./EventLogBlock.module.scss";

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
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerActions}>
          <span className={styles.headerTitle}>{t("EventLog")}</span>
          {hasFilter && (
            <div className={styles.filterButtonWrapper} ref={filterButtonRef}>
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
            </div>
          )}
        </div>
        {events.length > 0 && (
          <Link type="action" fontSize="13px" onClick={onClear}>
            {t("Common:ClearAll")}
          </Link>
        )}
      </div>
      <div className={styles.logScroller} ref={scrollerRef}>
        {displayedEvents.length === 0 ? (
          <div className={styles.emptyState}>{t("NoEventsYet")}</div>
        ) : (
          displayedEvents.map((entry) => {
            const expandable = isExpandable(entry.data);
            const expanded = expandedIds.has(entry.id);

            return (
              <div key={entry.id}>
                <div
                  className={classNames(styles.logEntry, {
                    [styles.expandable]: expandable,
                  })}
                  onClick={expandable ? () => toggle(entry.id) : undefined}
                >
                  <span className={styles.gutter}>
                    <span
                      className={classNames(styles.chevron, {
                        [styles.visible]: expandable,
                        [styles.expanded]: expanded,
                      })}
                    >
                      {"\u25B6"}
                    </span>
                    <span>{formatTime(entry.timestamp)}</span>
                  </span>
                  <span className={styles.eventName}>{entry.event}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.eventData}>{formatCompact(entry.data, t("VoidReturn"))}</span>
                </div>
                {expanded && (
                  <div className={styles.expandedRow}>
                    <pre className={styles.expandedContent}>
                      {formatExpanded(entry.data)}
                    </pre>
                    <div className={styles.copyButton}>
                      <IconButton
                        size={16}
                        iconName={CopyReactSvgUrl}
                        onClick={() => {
                          copy(formatExpanded(entry.data));
                          toastr.success(t("Common:Copy"));
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
