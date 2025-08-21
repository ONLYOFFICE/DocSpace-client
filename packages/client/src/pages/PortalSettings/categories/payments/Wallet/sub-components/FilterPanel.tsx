// (c) Copyright Ascensio System SIA 2009-2025
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

import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";

import styles from "../styles/TransactionHistory.module.scss";

type FilterPanelProps = {
  isFilterDialogVisible: boolean;
  closeFilterDialog: () => void;
  isSelectorVisible: boolean;
  selectorComponent: React.ReactNode;
  datesComponent: React.ReactNode;
  contactSelector: React.ReactNode;
  typeOfHistoty: TOption[];
  selectedType: TOption;
  onSelectType: (option: TOption) => void;
  onApplyFilter: () => void;
  isChanged: boolean;
};

const FilterPanel = ({
  isFilterDialogVisible,
  closeFilterDialog,
  isSelectorVisible,
  selectorComponent,
  datesComponent,
  contactSelector,
  typeOfHistoty,
  selectedType,
  onSelectType,
  onApplyFilter,
  isChanged,
}: FilterPanelProps) => {
  const { t } = useTranslation(["Payments", "Settings"]);
  return (
    <ModalDialog
      visible={isFilterDialogVisible}
      onClose={closeFilterDialog}
      displayType={ModalDialogType.aside}
      className={styles.filterDialog}
      containerVisible={isSelectorVisible}
    >
      <ModalDialog.Container>{selectorComponent}</ModalDialog.Container>
      <ModalDialog.Header>{t("Filter")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.filterDialogContent}>
          <div className={styles.filterDialogSection}>
            <Text fontWeight={600} fontSize="15px">
              {t("Common:Type")}
            </Text>
            <ComboBox
              options={typeOfHistoty}
              selectedOption={selectedType}
              onSelect={onSelectType}
              directionY="both"
              noBorder={false}
              dropDownMaxHeight={300}
              showDisabledItems
              size={ComboBoxSize.content}
              scaled
              testId="transaction_type_combobox"
              dropDownTestId="transaction_type_dropdown"
            />
          </div>
          <div className={styles.filterDialogDivider} />
          <div className={styles.filterDialogSection}>
            <Text fontWeight={600} fontSize="15px">
              {t("TransactionPeriod")}
            </Text>
            <div>{datesComponent}</div>
          </div>
          <div className={styles.filterDialogDivider} />
          <div className={styles.filterDialogSection}>
            <Text fontWeight={600} fontSize="15px">
              {t("Contact")}
            </Text>
            <div>{contactSelector}</div>
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          onClick={onApplyFilter}
          size={ButtonSize.medium}
          label={t("Common:ApplyButton")}
          isDisabled={!isChanged}
          primary
          scale
          testId="apply_filter_button"
        />
        <Button
          onClick={closeFilterDialog}
          size={ButtonSize.medium}
          label={t("Common:CancelButton")}
          scale
          testId="cancel_filter_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
export default FilterPanel;
