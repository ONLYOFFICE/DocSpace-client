import React, { useState } from "react";

import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { RadioButtonGroup } from "../../components/radio-button-group";
import { Button, ButtonSize } from "../../components/button";
import { Text } from "../../components/text";
import { ConflictResolveType } from "../../enums";

import StyledModalDialog from "./ConflictResolve.styled";
import { ConflictResolveProps } from "./ConflictResolve.types";

const ConflictResolve = (props: ConflictResolveProps) => {
  const {
    isLoading,
    visible,
    onClose,
    onSubmit,
    messageText,
    selectActionText,
    submitButtonLabel,
    cancelButtonLabel,
    overwriteDescription,
    overwriteTitle,
    duplicateDescription,
    duplicateTitle,
    skipDescription,
    skipTitle,
    headerLabel,
  } = props;

  const [resolveType, setResolveType] = useState<ConflictResolveType>(
    ConflictResolveType.Overwrite,
  );

  const onSelectResolveType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    const type = Number(target.value) as ConflictResolveType;
    setResolveType(type);
  };

  const onSubmitAction = () => {
    onSubmit(resolveType);
  };

  const radioOptions = [
    {
      label: (
        <div>
          <Text className="radio-option-title">{overwriteTitle}</Text>
          <Text className="radio-option-description">
            {overwriteDescription}
          </Text>
        </div>
      ),
      value: ConflictResolveType.Overwrite as unknown as string,
    },
    {
      label: (
        <div>
          <Text className="radio-option-title">{duplicateTitle}</Text>
          <Text className="radio-option-description">
            {duplicateDescription}
          </Text>
        </div>
      ),

      value: ConflictResolveType.Duplicate as unknown as string,
    },
    {
      label: (
        <div>
          <Text className="radio-option-title">{skipTitle}</Text>
          <Text className="radio-option-description">{skipDescription}</Text>
        </div>
      ),
      value: ConflictResolveType.Skip as unknown as string,
    },
  ];

  return (
    <StyledModalDialog
      isLoading={isLoading}
      visible={visible}
      onClose={onClose}
      isLarge
      zIndex={312}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{headerLabel}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text className="message">{messageText}</Text>
        <Text className="select-action">{selectActionText}</Text>
        <RadioButtonGroup
          className="conflict-resolve-radio-button"
          orientation="vertical"
          fontSize="13px"
          fontWeight={400}
          name="group"
          onClick={onSelectResolveType}
          options={radioOptions}
          selected={ConflictResolveType.Overwrite as unknown as string}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={submitButtonLabel}
          size={ButtonSize.normal}
          primary
          onClick={onSubmitAction}
        />
        <Button
          key="CancelButton"
          label={cancelButtonLabel}
          size={ButtonSize.normal}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default ConflictResolve;
