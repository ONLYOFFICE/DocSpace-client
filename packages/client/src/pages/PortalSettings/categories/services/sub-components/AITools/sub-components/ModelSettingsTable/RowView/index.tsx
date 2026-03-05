import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { RowContainer } from "@docspace/ui-kit/components/rows";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";

import type { TAiToolsPrices } from "SRC_DIR/store/ServicesStore";

import styles from "./ModelSettingsRowView.module.scss";

type ModelSettingsRowViewProps = {
  sectionWidth: number;
  isDisabled: boolean;
  aiToolsPrices?: TAiToolsPrices | null;
  formatAiModelsCurrency?: (amount: number) => string;
  setAiModelAvailability?: (modelId: string, enabled: boolean) => Promise<void>;
  aiModelAvailabilityMap?: Map<string, boolean>;
  aiModelAvailabilityUpdatingSet?: Set<string>;
};

const RowView = (props: ModelSettingsRowViewProps) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
    isDisabled,
  } = props;

  const models = aiToolsPrices?.chat ?? [];
  const { t } = useTranslation("Services");

  const onToggle = async (modelId: string, enabled: boolean) => {
    await setAiModelAvailability?.(modelId, enabled);
  };

  if (!models.length) return null;

  return (
    <div className={styles.rowContainer}>
      <Text className={styles.introText}>
        <Trans
          t={t}
          ns="Services"
          i18nKey="AIModelsIntro"
          components={{
            1: (
              <Link
                fontWeight={600}
                fontSize="12px"
                textDecoration="underline"
                href="https://openrouter.ai/models"
                target={LinkTarget.blank}
              />
            ),
          }}
        />
      </Text>
      <RowContainer
        useReactWindow
        fetchMoreFiles={() => Promise.resolve()}
        hasMoreFiles={false}
        itemCount={models.length}
        filesLength={models.length}
        itemHeight={72}
      >
        {models.map((m) => {
          const enabled = aiModelAvailabilityMap?.get(m.id) ?? true;
          const isUpdating = aiModelAvailabilityUpdatingSet?.has(m.id) ?? false;
          const inputPrice = formatAiModelsCurrency!(m.price.prompt);
          const outputPrice = formatAiModelsCurrency!(m.price.completion);

          return (
            <div className={styles.row} key={m.id}>
              <div className={styles.modelIcon}>
                <div
                  className={styles.iconInner}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                  dangerouslySetInnerHTML={{ __html: m.image }}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <Text
                    fontSize="13px"
                    fontWeight={600}
                    className={styles.title}
                  >
                    {m.alias}
                  </Text>
                  {m.provider ? (
                    <Text
                      fontSize="12px"
                      fontWeight={400}
                      as="span"
                      className={styles.provider}
                    >
                      ({m.provider})
                    </Text>
                  ) : null}
                </div>

                <Text
                  fontSize="12px"
                  fontWeight={600}
                  className={styles.prices}
                >
                  {t("AIModelPrice", {
                    inputPrice,
                    outputPrice,
                  })}
                </Text>
              </div>

              <div className={styles.toggle}>
                <ToggleButton
                  isChecked={enabled}
                  onChange={() => onToggle(m.id, !enabled)}
                  isDisabled={isDisabled || isUpdating}
                  dataTestId={`ai_model_toggle_${m.id}`}
                />
              </div>
            </div>
          );
        })}
      </RowContainer>
    </div>
  );
};

export default inject(({ servicesStore }: TStore) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  } = servicesStore;

  return {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  };
})(observer(RowView));
