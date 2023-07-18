import { useState, useMemo, ChangeEvent } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import HelpButton from "@docspace/components/help-button";
import ModalDialog from "@docspace/components/modal-dialog";
import RadioButtonGroup from "@docspace/components/radio-button-group";

import SettingsStore from "@docspace/common/store/SettingsStore";

import {
  ContentWrapper,
  StyledTooltip,
  TooltipWrapper,
} from "./DeleteFormDialog.styled";

import type DeleteFormDialogProps from "./DeleteFormDialog.props";
import type { StoreType } from "SRC_DIR/types";

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

function DeleteFormDialog(props: DeleteFormDialogProps) {
  const { visible, removeItem, theme, setVisible } = props;

  const { t, ready } = useTranslation(["DeleteFormDialog", "Common"]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [seleted, setSeleted] = useState<string>("keep");

  const onClose = () => {
    setVisible(false);
  };

  const onDeleteForm = () => {};

  const onSelectTfaType = (event: ChangeEvent<HTMLInputElement>) => {
    if (seleted !== event.target.value) {
      setSeleted(event.target.value);
    }
  };

  const tooltip = () => (
    <StyledTooltip>
      {/* @ts-ignore */}
      <Text fontSize="12px">{t("Tooltip")}</Text>
    </StyledTooltip>
  );

  const options = useMemo(
    () => [
      {
        label: t("DeleteTheLinkedBoards"),
        value: "delete",
        afterContent: (
          <TooltipWrapper>
            <HelpButton
              iconName={InfoReactSvgUrl}
              displayType="dropdown"
              place="right"
              offsetRight={0}
              getContent={tooltip}
              tooltipColor={theme.client.settings.security.owner.tooltipColor}
            />
          </TooltipWrapper>
        ),
      },
      {
        label: t("KeepTheBoards"),
        value: "keep",
      },
    ],
    [t]
  );

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      zIndex={310}
      onClose={onClose}
      modalLoaderBodyHeight={undefined}
      isDoubleFooterLine={undefined}
    >
      {/*@ts-ignore*/}
      <ModalDialog.Header>{t("DeleteFormDialog:Title")}</ModalDialog.Header>
      {/*@ts-ignore*/}
      <ModalDialog.Body>
        <ContentWrapper>
          {t("DeleteFormDialog:Body", {
            fileName: removeItem?.title ?? "",
            boardName: "",
          })}
          <RadioButtonGroup
            className="box"
            fontSize="13px"
            fontWeight="400"
            name="group"
            orientation="vertical"
            spacing="8px"
            options={options}
            selected={seleted}
            onClick={onSelectTfaType}
          />
        </ContentWrapper>
      </ModalDialog.Body>
      {/*@ts-ignore*/}
      <ModalDialog.Footer>
        <Button
          /*@ts-ignore*/
          isLoading={isLoading}
          label={t("Common:Delete")}
          size="normal"
          primary
          scale
          onClick={onDeleteForm}
        />
        <Button
          /*@ts-ignore*/
          isLoading={isLoading}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

export default inject<StoreType>(({ dialogsStore, filesStore, auth }) => {
  const {
    deleteFormDialogVisible: visible,
    setDeleteFormDialogVisible: setVisible,
  } = dialogsStore;

  const theme = (auth.settingsStore as unknown as SettingsStore).theme;

  const removeItem = filesStore.bufferSelection;

  console.log({ removeItem });

  return {
    visible,
    setVisible,
    removeItem,
    theme,
  };
})(observer(DeleteFormDialog));
