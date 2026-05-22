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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@docspace/ui-kit/components/combobox";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import CheckIcon from "@docspace/ui-kit/assets/check.react.svg";
import DangerIcon from "@docspace/ui-kit/assets/danger.toast.react.svg";

import { getDefaultProvider, getModels } from "@docspace/shared/api/ai";
import type { TAgent, TModel } from "@docspace/shared/api/ai/types";
import {
  cleanupOrphanAgents,
  ensureWizardAgent,
  findActivePanel,
  provisionPanel,
  type AgentConfig,
  type AgentModelRef,
  type DefaultProviderRef,
  type ProvisionProgress,
} from "@/utils/ai-arbiter";

import type { AgentSummary } from "@/types/arbiter";

import SEEDS_RAW from "./seeds.json";

import { useAiArbiterAgentsStore } from "../../_store/AiArbiterAgentsStore";

import { ChatPhase } from "./ChatPhase";
import { useWizardChat } from "./useWizardChat";
import styles from "./Wizard.module.scss";

type Phase =
  | "bootstrap"
  | "chat"
  | "preview"
  | "provisioning"
  | "done"
  | "failed";

type ProvisioningItem = {
  label: string;
  status: "pending" | "active" | "done";
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SEEDS: Record<string, string> = SEEDS_RAW;

function buildSeedMessage(language: string | undefined): string {
  if (!language) return SEEDS.en;
  const key = language.trim();
  if (SEEDS[key]) return SEEDS[key];
  const base = key.split(/[-_]/)[0].toLowerCase();
  if (SEEDS[base]) return SEEDS[base];
  return SEEDS.en;
}

function toAgentSummary(a: TAgent): AgentSummary {
  return {
    id: a.id,
    title: a.title ?? "",
    modelAlias: a.chatSettings?.modelAlias ?? "",
    modelId: a.chatSettings?.modelId ?? "",
    prompt: a.chatSettings?.prompt ?? "",
    providerId: a.chatSettings?.providerId ?? 0,
    tags: a.tags,
  };
}

function updateProgressItems(
  prev: ProvisioningItem[],
  ev: ProvisionProgress,
): ProvisioningItem[] {
  const lastIndex = prev.length - 1;
  switch (ev.type) {
    case "create_expert":
      return prev.map((it, i) =>
        i === ev.index ? { ...it, status: "active" } : it,
      );
    case "expert_created":
      return prev.map((it, i) =>
        i === ev.index ? { ...it, status: "done" } : it,
      );
    case "create_arbiter":
      return prev.map((it, i) =>
        i === lastIndex ? { ...it, status: "active" } : it,
      );
    case "arbiter_created":
      return prev.map((it, i) =>
        i === lastIndex ? { ...it, status: "done" } : it,
      );
    case "rollback":
      return prev.map((it) => ({ ...it, status: "pending" }));
    default:
      return prev;
  }
}

export const WizardOverlay = observer(({ visible, onClose }: Props) => {
  const { t, i18n } = useTranslation(["Common"]);
  const seedMessage = React.useMemo(
    () => buildSeedMessage(i18n.language),
    [i18n.language],
  );

  const agentsStore = useAiArbiterAgentsStore();
  const userId = agentsStore.userId;

  const [phase, setPhase] = React.useState<Phase>("bootstrap");
  const [wizardAgentId, setWizardAgentId] = React.useState<number | null>(null);
  const [defaultProvider, setDefaultProvider] =
    React.useState<DefaultProviderRef | null>(null);
  const [availableModels, setAvailableModels] = React.useState<TModel[]>([]);
  const [expertModelIds, setExpertModelIds] = React.useState<string[]>([]);
  const [arbiterModelId, setArbiterModelId] = React.useState<string>("");
  const [pendingConfig, setPendingConfig] = React.useState<AgentConfig | null>(
    null,
  );
  const [provisioningItems, setProvisioningItems] = React.useState<
    ProvisioningItem[]
  >([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const provisionAbortRef = React.useRef<AbortController | null>(null);
  const seedSentRef = React.useRef(false);

  const handleConfigDetected = React.useCallback(
    (config: AgentConfig) => {
      setPendingConfig(config);
      const knownIds = new Set(availableModels.map((m) => m.modelId));
      const fallback = defaultProvider?.modelId ?? "";
      setExpertModelIds(
        config.experts.map((e) =>
          e.model && knownIds.has(e.model) ? e.model : fallback,
        ),
      );
      setArbiterModelId(
        config.arbiter.model && knownIds.has(config.arbiter.model)
          ? config.arbiter.model
          : fallback,
      );
      setPhase("preview");
    },
    [defaultProvider, availableModels],
  );

  const wizardChat = useWizardChat({
    wizardAgentId,
    onConfigDetected: handleConfigDetected,
  });
  const { send: sendChat, abort: abortChat, reset: resetChat } = wizardChat;

  React.useEffect(() => {
    if (!visible) return;
    if (phase !== "bootstrap") return;
    if (!userId) {
      setErrorMessage("Unable to identify current user.");
      setPhase("failed");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        try {
          const removed = await cleanupOrphanAgents(userId);
          if (removed > 0) {
            console.info(
              `[ai-arbiter] cleaned up ${removed} orphan agent(s) from a previous setup`,
            );
          }
        } catch (err) {
          console.warn("[ai-arbiter] orphan cleanup failed", err);
        }
        if (cancelled) return;

        const provider = await getDefaultProvider();
        if (cancelled) return;
        if (!provider) {
          setErrorMessage("No AI provider is configured for this workspace.");
          setPhase("failed");
          return;
        }

        const providerRef: DefaultProviderRef = {
          providerId: provider.providerId,
          modelId: provider.defaultModel,
          modelAlias: provider.defaultModelAlias,
        };

        let models: TModel[] = [];
        try {
          models = await getModels(providerRef.providerId);
        } catch (err) {
          console.warn("[ai-arbiter] failed to fetch model list", err);
        }
        if (cancelled) return;

        const wizard = await ensureWizardAgent({
          userId,
          defaultProvider: providerRef,
          availableModels: models.map((m) => ({
            id: m.modelId,
            alias: m.alias,
          })),
        });
        if (cancelled) return;

        setDefaultProvider(providerRef);
        setArbiterModelId(providerRef.modelId);
        setAvailableModels(models);

        setWizardAgentId(wizard.id);
        setPhase("chat");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
        setPhase("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, phase, userId]);

  React.useEffect(() => {
    if (phase !== "chat") return;
    if (!wizardAgentId) return;
    if (seedSentRef.current) return;
    seedSentRef.current = true;
    void sendChat(seedMessage, { hidden: true });
  }, [phase, wizardAgentId, seedMessage, sendChat]);

  React.useEffect(() => {
    if (visible) return;
    setPhase("bootstrap");
    setWizardAgentId(null);
    setDefaultProvider(null);
    setAvailableModels([]);
    setExpertModelIds([]);
    setArbiterModelId("");
    setPendingConfig(null);
    setProvisioningItems([]);
    setErrorMessage(null);
    seedSentRef.current = false;
    provisionAbortRef.current?.abort();
    provisionAbortRef.current = null;
    resetChat();
  }, [visible, resetChat]);

  const handleProceed = React.useCallback(async () => {
    if (!pendingConfig || !defaultProvider || !userId) return;

    const items: ProvisioningItem[] = [
      ...pendingConfig.experts.map((e) => ({
        label: e.role_title,
        status: "pending" as const,
      })),
      {
        label: `Arbiter — ${pendingConfig.domain}`,
        status: "pending" as const,
      },
    ];
    setProvisioningItems(items);
    setPhase("provisioning");

    const ac = new AbortController();
    provisionAbortRef.current = ac;

    const buildModelRef = (modelId: string): AgentModelRef => {
      const found = availableModels.find((m) => m.modelId === modelId);
      return {
        providerId: defaultProvider.providerId,
        modelId: modelId || defaultProvider.modelId,
        modelAlias: found?.alias ?? defaultProvider.modelAlias,
      };
    };

    const expertModels = pendingConfig.experts.map((_, i) =>
      buildModelRef(expertModelIds[i] ?? ""),
    );
    const arbiterModel = buildModelRef(arbiterModelId);

    try {
      await provisionPanel(pendingConfig, {
        userId,
        defaultProvider,
        expertModels,
        arbiterModel,
        signal: ac.signal,
        onProgress: (p) => {
          setProvisioningItems((prev) => updateProgressItems(prev, p));
        },
      });

      const refetched = await findActivePanel(userId);
      if (refetched) {
        agentsStore.setActivePanel({
          sessionId: refetched.sessionId,
          arbiter: toAgentSummary(refetched.arbiter),
          experts: refetched.experts.map(toAgentSummary),
        });
      }
      setPhase("done");
    } catch (err) {
      if (ac.signal.aborted) {
        setPhase("preview");
        toastr.info(t("Common:ArbiterSetupCancelled"));
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
        setPhase("failed");
      }
    } finally {
      provisionAbortRef.current = null;
    }
  }, [
    pendingConfig,
    defaultProvider,
    userId,
    agentsStore,
    availableModels,
    expertModelIds,
    arbiterModelId,
  ]);

  const handleBackToChat = React.useCallback(() => {
    setPendingConfig(null);
    setPhase("chat");
  }, []);

  const handleCancelProvisioning = React.useCallback(() => {
    provisionAbortRef.current?.abort();
  }, []);

  const handleRetry = React.useCallback(() => {
    setErrorMessage(null);
    setPhase("bootstrap");
  }, []);

  const handleOpen = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const renderBootstrap = () => (
    <div className={styles.bootstrapBody}>
      <div className={styles.spinner} aria-hidden="true" />
      <Text as="p" className={styles.bootstrapText}>
        Preparing your setup wizard...
      </Text>
    </div>
  );

  const renderPreview = () => {
    if (!pendingConfig) return null;
    const hasModelOptions = availableModels.length > 1;

    const modelOptions: TOption[] = availableModels.map((m) => ({
      key: m.modelId,
      label: m.alias ?? m.modelId,
    }));

    const optionFor = (modelId: string): TOption => {
      const found = availableModels.find((m) => m.modelId === modelId);
      return {
        key: modelId,
        label: found?.alias ?? modelId,
      };
    };

    const renderModelControl = (
      value: string,
      onChange: (v: string) => void,
    ) => {
      if (!hasModelOptions) {
        return (
          <span className={styles.previewModelStatic}>
            {availableModels[0]?.alias ??
              defaultProvider?.modelAlias ??
              defaultProvider?.modelId ??
              "default"}
          </span>
        );
      }
      return (
        <ComboBox
          options={modelOptions}
          selectedOption={optionFor(value)}
          onSelect={(opt) => onChange(String(opt.key))}
          size={ComboBoxSize.base}
          scaled
          scaledOptions
          directionY="both"
          displaySelectedOption
        />
      );
    };

    return (
      <div className={styles.previewBody}>
        <Text as="p" className={styles.previewIntro}>
          {`I'll create ${pendingConfig.experts.length} expert agent${
            pendingConfig.experts.length === 1 ? "" : "s"
          } and 1 arbiter for the domain `}
          <strong>{pendingConfig.domain}</strong>.
        </Text>

        <Scrollbar
          className={styles.previewScroll}
          style={{ maxHeight: "calc(70vh - 200px)" }}
          translateContentSizeYToHolder
          paddingInlineEnd="0"
          autoHide
        >
          <ul className={styles.previewList}>
            {pendingConfig.experts.map((e, i) => (
              <li key={e.role_title} className={styles.previewItem}>
                <div className={styles.previewItemBody}>
                  <span className={styles.previewItemTitle}>
                    {e.role_title}
                  </span>
                  <span className={styles.previewItemMeta}>
                    {e.domain_expertise.slice(0, 3).join(" • ")}
                  </span>
                </div>
                <div className={styles.previewItemModel}>
                  <span className={styles.previewModelLabel}>Model</span>
                  {renderModelControl(expertModelIds[i] ?? "", (v) =>
                    setExpertModelIds((prev) => {
                      const next = [...prev];
                      next[i] = v;
                      return next;
                    }),
                  )}
                </div>
              </li>
            ))}
            <li
              className={`${styles.previewItem} ${styles.previewItemArbiter}`}
            >
              <div className={styles.previewItemBody}>
                <span className={styles.previewItemTitle}>Arbiter</span>
                <span className={styles.previewItemMeta}>
                  Synthesizes expert answers
                </span>
              </div>
              <div className={styles.previewItemModel}>
                <span className={styles.previewModelLabel}>Model</span>
                {renderModelControl(arbiterModelId, setArbiterModelId)}
              </div>
            </li>
          </ul>
        </Scrollbar>
      </div>
    );
  };

  const renderProvisioning = () => (
    <div className={styles.provisioningBody}>
      <Text as="p" className={styles.provisioningIntro}>
        Creating your agents...
      </Text>
      <ol className={styles.provisioningList}>
        {provisioningItems.map((it) => (
          <li
            key={it.label}
            className={styles.provisioningItem}
            data-status={it.status}
          >
            <span className={styles.provisioningStatus} aria-hidden="true">
              {it.status === "done" ? "•" : "•"}
            </span>
            <span className={styles.provisioningLabel}>{it.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  const renderDone = () => (
    <div className={styles.statusBody}>
      <div
        className={styles.statusBadge}
        data-status="success"
        aria-hidden="true"
      >
        <CheckIcon />
      </div>
      <Text as="p" className={styles.statusText}>
        Your AI Arbiter panel is ready.
      </Text>
    </div>
  );

  const renderFailed = () => (
    <div className={styles.statusBody}>
      <div
        className={styles.statusBadge}
        data-status="error"
        aria-hidden="true"
      >
        <DangerIcon />
      </div>
      <Text as="p" className={styles.statusError}>
        {errorMessage ?? "Something went wrong."}
      </Text>
    </div>
  );

  const renderBody = () => {
    switch (phase) {
      case "bootstrap":
        return renderBootstrap();
      case "chat":
        return (
          <ChatPhase
            messages={wizardChat.messages}
            isStreaming={wizardChat.isStreaming}
            onSend={(t) => sendChat(t)}
            onStop={abortChat}
          />
        );
      case "preview":
        return renderPreview();
      case "provisioning":
        return renderProvisioning();
      case "done":
        return renderDone();
      case "failed":
        return renderFailed();
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (phase) {
      case "preview":
        return (
          <>
            <Button
              primary
              scale
              size={ButtonSize.normal}
              label={t("Common:ArbiterProceed")}
              onClick={handleProceed}
            />
            <Button
              scale
              size={ButtonSize.normal}
              label={t("Common:Back")}
              onClick={handleBackToChat}
            />
          </>
        );
      case "provisioning":
        return (
          <Button
            scale
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            onClick={handleCancelProvisioning}
          />
        );
      case "done":
        return (
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={t("Common:ArbiterOpenAiArbiter")}
            onClick={handleOpen}
          />
        );
      case "failed":
        return (
          <>
            <Button
              primary
              scale
              size={ButtonSize.normal}
              label={t("Common:ArbiterRetry")}
              onClick={handleRetry}
            />
            <Button
              scale
              size={ButtonSize.normal}
              label={t("Common:CloseButton")}
              onClick={onClose}
            />
          </>
        );
      default:
        return null;
    }
  };

  const header = (() => {
    switch (phase) {
      case "done":
        return "AI Arbiter ready";
      case "failed":
        return "Setup failed";
      default:
        return "Set up AI Arbiter";
    }
  })();

  const footer = renderFooter();

  return (
    <ModalDialog visible={visible} onClose={onClose} isLarge autoMaxHeight>
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>{renderBody()}</ModalDialog.Body>
      {footer ? <ModalDialog.Footer>{footer}</ModalDialog.Footer> : null}
    </ModalDialog>
  );
});

export default WizardOverlay;
