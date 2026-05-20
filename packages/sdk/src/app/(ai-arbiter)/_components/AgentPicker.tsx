/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

"use client";

import React from "react";
import { observer } from "mobx-react";

import type { AgentSummary } from "@/types/arbiter";

import styles from "./ArbiterApp.module.scss";

const AVATAR_COLORS = [
  "#4e9df5",
  "#52c41a",
  "#fa8c16",
  "#722ed1",
  "#eb2f96",
  "#13c2c2",
  "#f5222d",
  "#096dd9",
];

function agentColor(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function agentInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length >= 2)
    return (words[0][0] + words[1][0]).toUpperCase();
  return title.slice(0, 2).toUpperCase();
}

type AgentPickerProps = {
  agents: AgentSummary[];
  expertIds: number[];
  arbiterId: number | null;
  isRunning: boolean;
  isUnavailable: (a: AgentSummary) => boolean;
  onAddExpert: (id: number) => void;
  onRemoveExpert: (id: number) => void;
  onSetArbiter: (id: number | null) => void;
};

export const AgentPicker = observer(
  ({
    agents,
    expertIds,
    arbiterId,
    isRunning,
    isUnavailable,
    onAddExpert,
    onRemoveExpert,
    onSetArbiter,
  }: AgentPickerProps) => {
    const [expertOpen, setExpertOpen] = React.useState(false);
    const [arbiterOpen, setArbiterOpen] = React.useState(false);
    const expertRef = React.useRef<HTMLDivElement>(null);
    const arbiterRef = React.useRef<HTMLDivElement>(null);

    const expertAgents = expertIds
      .map((id) => agents.find((a) => a.id === id))
      .filter((a): a is AgentSummary => !!a);

    const arbiterAgent = arbiterId != null
      ? agents.find((a) => a.id === arbiterId)
      : undefined;

    React.useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (expertRef.current && !expertRef.current.contains(e.target as Node))
          setExpertOpen(false);
        if (arbiterRef.current && !arbiterRef.current.contains(e.target as Node))
          setArbiterOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
      <div className={styles.pickerBar}>
        <span className={styles.pickerLabel}>Experts:</span>

        {expertAgents.map((a) => (
          <span key={a.id} className={styles.agentTag}>
            <span
              className={styles.agentAvatar}
              style={{ background: agentColor(a.title) }}
            >
              {agentInitials(a.title)}
            </span>
            {a.title}
            {!isRunning && (
              <button
                className={styles.agentTagRemove}
                type="button"
                onClick={() => onRemoveExpert(a.id)}
                aria-label={`Remove ${a.title}`}
              >
                ×
              </button>
            )}
          </span>
        ))}

        {!isRunning && (
          <div className={styles.dropdownWrap} ref={expertRef}>
            <button
              className={styles.addExpertBtn}
              type="button"
              onClick={() => setExpertOpen((o) => !o)}
            >
              + Expert
            </button>
            {expertOpen && (
              <div className={styles.dropdown}>
                {agents.map((a) => {
                  const picked = expertIds.includes(a.id) || a.id === arbiterId;
                  const unavail = isUnavailable(a);
                  return (
                    <div
                      key={a.id}
                      className={`${styles.dropdownItem} ${unavail || picked ? styles.dropdownItemDisabled : ""}`}
                      onClick={() => {
                        if (!unavail && !picked) {
                          onAddExpert(a.id);
                          setExpertOpen(false);
                        }
                      }}
                    >
                      <span
                        className={styles.agentAvatar}
                        style={{ background: agentColor(a.title) }}
                      >
                        {agentInitials(a.title)}
                      </span>
                      <span>{a.title}</span>
                      {picked && (
                        <span className={styles.dropdownItemBadge}>Added</span>
                      )}
                      {unavail && (
                        <span className={styles.dropdownItemBadge}>N/A</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <span className={styles.pickerLabel} style={{ marginLeft: 8 }}>
          Arbiter:
        </span>

        {arbiterAgent ? (
          <span className={styles.agentTagArbiter}>
            <span
              className={styles.agentAvatar}
              style={{ background: agentColor(arbiterAgent.title) }}
            >
              {agentInitials(arbiterAgent.title)}
            </span>
            {arbiterAgent.title}
            {!isRunning && (
              <button
                className={styles.agentTagRemove}
                type="button"
                onClick={() => onSetArbiter(null)}
                aria-label="Remove arbiter"
              >
                ×
              </button>
            )}
          </span>
        ) : (
          !isRunning && (
            <div className={styles.dropdownWrap} ref={arbiterRef}>
              <button
                className={styles.addExpertBtn}
                type="button"
                onClick={() => setArbiterOpen((o) => !o)}
              >
                + Arbiter
              </button>
              {arbiterOpen && (
                <div className={styles.dropdown}>
                  {agents.map((a) => {
                    const unavail = isUnavailable(a);
                    const pickedAsExpert = expertIds.includes(a.id);
                    const disabled = unavail || pickedAsExpert;
                    return (
                      <div
                        key={a.id}
                        className={`${styles.dropdownItem} ${disabled ? styles.dropdownItemDisabled : ""}`}
                        onClick={() => {
                          if (!disabled) {
                            onSetArbiter(a.id);
                            setArbiterOpen(false);
                          }
                        }}
                      >
                        <span
                          className={styles.agentAvatar}
                          style={{ background: agentColor(a.title) }}
                        >
                          {agentInitials(a.title)}
                        </span>
                        <span>{a.title}</span>
                        {unavail && (
                          <span className={styles.dropdownItemBadge}>N/A</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}
      </div>
    );
  },
);
