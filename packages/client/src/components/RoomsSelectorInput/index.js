import { useState } from "react";
import { observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { FileInput } from "@docspace/shared/components/file-input";

import RoomSelector from "@docspace/shared/selectors/Room";
import { StyledBodyWrapper } from "./StyledComponents";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";

const RoomsSelectorInput = (props) => {
  const {
    t,
    isDisabled,
    isError,
    maxWidth,

    id,
    className,
    style,
    isDocumentIcon,
    isLoading,

    roomType,
    onCancel,
    withCancelButton,
    cancelButtonLabel,

    excludeItems,

    withSearch,

    isMultiSelect,

    submitButtonLabel,
    onSubmit,

    withHeader,
    headerProps,

    setIsDataReady,
  } = props;

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const BasePath = `DocSpace / ${t("Common:Rooms")} `;
  const [path, setPath] = useState(BasePath);

  const handleOnSubmit = (rooms) => {
    setPath(BasePath + "/ " + rooms[0].label);
    onSubmit && onSubmit(rooms);
    setIsPanelVisible(false);
  };

  const handleOnCancel = (e) => {
    onCancel && onCancel(e);
    setIsPanelVisible(false);
  };

  const onClick = () => {
    setIsPanelVisible(true);
  };

  const onClose = () => {
    setIsPanelVisible(false);
  };

  const SelectorBody = (
    <RoomSelector
      id={id}
      style={style}
      onCancel={handleOnCancel}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel}
      excludeItems={excludeItems}
      withSearch={withSearch}
      isMultiSelect={isMultiSelect}
      submitButtonLabel={submitButtonLabel}
      onSubmit={handleOnSubmit}
      withHeader={withHeader}
      headerProps={headerProps}
      setIsDataReady={setIsDataReady}
      roomType={roomType}
    />
  );

  return (
    <StyledBodyWrapper maxWidth={maxWidth} className={className}>
      <FileInput
        onClick={onClick}
        fromStorage
        path={path}
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        hasError={isError}
        scale
        isDocumentIcon={isDocumentIcon}
      />

      <Backdrop
        visible={isPanelVisible}
        isAside
        withBackground
        zIndex={309}
        onClick={onClose}
      />
      <Aside
        visible={isPanelVisible}
        withoutBodyScroll
        zIndex={310}
        onClose={onClose}
      >
        {SelectorBody}
      </Aside>
    </StyledBodyWrapper>
  );
};

export default withTranslation(["Common"])(observer(RoomsSelectorInput));
