/*
 * (c) Copyright Ascensio System SIA 2009-2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Tag } from "@docspace/ui-kit/components/tag";
import { Text } from "@docspace/ui-kit/components/text";
import PlusIcon from "@docspace/ui-kit/assets/icons/16/plus.svg";

import type { TProviderModelInfo } from "@docspace/shared/api/ai/types";

import styles from "./AddUpdateDialog.module.scss";

type SelectedModelsListProps = {
  selectedModels: TProviderModelInfo[];
  onAddClick: () => void;
  hasError: boolean;
  addButtonRef?: React.RefObject<HTMLDivElement | null>;
};

export const SelectedModelsList = ({
  selectedModels,
  onAddClick,
  hasError,
  addButtonRef,
}: SelectedModelsListProps) => {
  const { t } = useTranslation(["AISettings"]);

  return (
    <div className={styles.selectedModelsField}>
      <Text
        className={styles.selectedModelsLabel}
        fontWeight={600}
        fontSize="13px"
      >
        {t("AISettings:ListModels")}
        <span className={styles.requiredMark}>{" *"}</span>
      </Text>
      <div
        className={classNames(styles.selectedModelsContainer, {
          [styles.selectedModelsError]: hasError,
        })}
      >
        <div
          ref={addButtonRef}
          className={styles.addButtonAnchor}
          onClick={() => onAddClick()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAddClick();
          }}
        >
          <Tag
            tag="add-model"
            label={t("AISettings:SelectModels")}
            icon={PlusIcon}
            withLabel={false}
            className="add-model-tag"
            dataTestId="add-model-button"
          />
        </div>
        {selectedModels.map((model) => (
          <Tag
            key={model.modelId}
            tag={model.modelId}
            label={model.displayName}
            className="model-tag"
            dataTestId={`model-tag-${model.modelId}`}
          />
        ))}
      </div>
      {hasError ? (
        <Text className={styles.selectedModelsErrorText} fontSize="12px">
          {t("AISettings:SelectAtLeastOneModel")}
        </Text>
      ) : null}
    </div>
  );
};

