import React, { memo } from "react";
import PropTypes from "prop-types";

import { EmailSettings, parseAddress } from "../../utils/email";
import Chip from "./chip";

import { StyledAllChips } from "../styled-emailchips";

const ChipsRender = memo(
  ({
    // @ts-expect-error TS(2339): Property 'chips' does not exist on type '{}'.
    chips,
    // @ts-expect-error TS(2339): Property 'currentChip' does not exist on type '{}'... Remove this comment to see the full error message
    currentChip,
    // @ts-expect-error TS(2339): Property 'blockRef' does not exist on type '{}'.
    blockRef,
    // @ts-expect-error TS(2339): Property 'checkSelected' does not exist on type '{... Remove this comment to see the full error message
    checkSelected,
    // @ts-expect-error TS(2339): Property 'invalidEmailText' does not exist on type... Remove this comment to see the full error message
    invalidEmailText,
    // @ts-expect-error TS(2339): Property 'chipOverLimitText' does not exist on typ... Remove this comment to see the full error message
    chipOverLimitText,
    // @ts-expect-error TS(2339): Property 'onDelete' does not exist on type '{}'.
    onDelete,
    // @ts-expect-error TS(2339): Property 'onDoubleClick' does not exist on type '{... Remove this comment to see the full error message
    onDoubleClick,
    // @ts-expect-error TS(2339): Property 'onSaveNewChip' does not exist on type '{... Remove this comment to see the full error message
    onSaveNewChip,
    // @ts-expect-error TS(2339): Property 'onClick' does not exist on type '{}'.
    onClick,
    ...props
  }) => {
    const emailSettings = new EmailSettings();

    const checkEmail = (email: any) => {
      const emailObj = parseAddress(email, emailSettings);
      return emailObj.isValid();
    };

    const checkIsSelected = (value: any) => {
      return checkSelected(value);
    };

    return (
      <StyledAllChips ref={blockRef}>
        {chips?.map((it: any) => {
          return (
            <Chip
              key={it?.email}
              value={it}
              currentChip={currentChip}
              isSelected={checkIsSelected(it)}
              isValid={checkEmail(it?.email)}
              invalidEmailText={invalidEmailText}
              chipOverLimitText={chipOverLimitText}
              onDelete={onDelete}
              onDoubleClick={onDoubleClick}
              onSaveNewChip={onSaveNewChip}
              onClick={onClick}
            />
          );
        })}
      </StyledAllChips>
    );
  }
);

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'Named... Remove this comment to see the full error message
ChipsRender.propTypes = {
  chips: PropTypes.arrayOf(PropTypes.object),
  currentChip: PropTypes.object,

  invalidEmailText: PropTypes.string,
  chipOverLimitText: PropTypes.string,

  blockRef: PropTypes.shape({ current: PropTypes.any }),

  checkSelected: PropTypes.func,
  onDelete: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onSaveNewChip: PropTypes.func,
  onClick: PropTypes.func,
};

ChipsRender.displayName = "ChipsRender";

export default ChipsRender;
