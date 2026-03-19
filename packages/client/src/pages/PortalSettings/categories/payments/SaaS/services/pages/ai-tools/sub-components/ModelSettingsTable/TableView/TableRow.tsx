import React, { useCallback } from "react";

import { TableCell, TableRow } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";

import styles from "./ModelSettingsTable.module.scss";

type ModelSettingsRowProps = {
  modelId: string;
  image: string;
  title: string;
  isDisabled: boolean;
  provider?: string;
  inputPrice: string;
  outputPrice?: string;
  enabled: boolean;
  isUpdating: boolean;
  onToggle: (modelId: string, enabled: boolean) => Promise<void>;
};

const ModelSettingsRow: React.FC<ModelSettingsRowProps> = ({
  modelId,
  title,
  provider,
  inputPrice,
  outputPrice,
  enabled,
  isUpdating,
  onToggle,
  image,
  isDisabled,
}) => {
  const onChange = useCallback(() => {
    void onToggle(modelId, !enabled);
  }, [enabled, modelId, onToggle]);

  return (
    <TableRow>
      <TableCell>
        <div className={styles.modelCell}>
          <div className={styles.modelTitleRow}>
            <div className={styles.modelIconPlaceholder}>
              <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                dangerouslySetInnerHTML={{ __html: image }}
                className={styles.iconsContainer}
              />
            </div>
            <Text
              fontSize="12px"
              fontWeight={600}
              className={styles.modelTitle}
            >
              {title}
            </Text>
            {provider ? (
              <Text
                fontSize="12px"
                fontWeight={400}
                as="span"
                className={styles.modelProvider}
              >
                ({provider})
              </Text>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Text fontSize="12px" fontWeight={600} className={styles.priceCell}>
          {inputPrice}
        </Text>
      </TableCell>
      <TableCell>
        <Text fontSize="12px" fontWeight={600} className={styles.priceCell}>
          {outputPrice ?? "—"}
        </Text>
      </TableCell>
      <TableCell>
        <div className={styles.toggleCell}>
          <ToggleButton
            isChecked={enabled}
            onChange={onChange}
            isDisabled={isDisabled || isUpdating}
            dataTestId={`ai_model_toggle_${modelId}`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ModelSettingsRow;
