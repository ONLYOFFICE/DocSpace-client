import React, { useRef } from "react";
import { inject, observer } from "mobx-react";

import { TableBody, TableContainer } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { useTranslation, Trans } from "react-i18next";

import type { TAiToolsPrices } from "SRC_DIR/store/ServicesStore";

import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import styles from "./ModelSettingsTable.module.scss";
import { Link, LinkTarget } from "@docspace/ui-kit/components";

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `aiModelsColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelAiModelsColumnsSize_ver-${TABLE_VERSION}`;

type ModelSettingsTableViewProps = {
  sectionWidth: number;
  aiToolsPrices?: TAiToolsPrices | null;
  formatAiModelsCurrency?: (amount: number) => string;
  setAiModelAvailability?: (modelId: string, enabled: boolean) => Promise<void>;
  aiModelAvailabilityMap?: Map<string, boolean>;
  aiModelAvailabilityUpdatingSet?: Set<string>;
  userId?: string;
  isDisabled: boolean;
};

const TableView = (props: ModelSettingsTableViewProps) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
    userId,
    sectionWidth,
    isDisabled,
  } = props;

  const models = aiToolsPrices?.chat ?? [];

  const { t } = useTranslation("Services");

  const onToggle = async (modelId: string, enabled: boolean) => {
    await setAiModelAvailability?.(modelId, enabled);
  };

  const ref = useRef<HTMLDivElement>(null);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <div className={styles.tableWrapper}>
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

      <TableContainer
        forwardedRef={ref as React.RefObject<HTMLDivElement>}
        useReactWindow={false}
        className={styles.tableContainer}
      >
        <TableHeader
          sectionWidth={sectionWidth}
          containerRef={ref as React.RefObject<HTMLDivElement>}
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          itemHeight={48}
        />
        <TableBody
          useReactWindow
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          itemHeight={48}
          filesLength={models.length}
          fetchMoreFiles={() => Promise.resolve()}
          hasMoreFiles={false}
          itemCount={models.length}
        >
          {models.map((m) => (
            <TableRow
              key={m.id}
              modelId={m.id}
              title={m.alias}
              provider={m.provider}
              inputPrice={formatAiModelsCurrency!(m.price.prompt)}
              outputPrice={formatAiModelsCurrency!(m.price.completion)}
              enabled={aiModelAvailabilityMap?.get(m.id) ?? true}
              isUpdating={aiModelAvailabilityUpdatingSet?.has(m.id) ?? false}
              onToggle={onToggle}
              image={m.image}
              isDisabled={isDisabled}
            />
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

export default inject(({ servicesStore, userStore }: TStore) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  } = servicesStore;

  const userId = userStore.user?.id;

  return {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
    userId,
  };
})(observer(TableView));
