import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { useClickOutside } from "../utils/useClickOutside.js";

import {
  StyledContent,
  StyledChipGroup,
  StyledChipWithInput,
} from "./styled-emailchips";
import {
  MAX_EMAIL_LENGTH_WITH_DOTS,
  sliceEmail,
} from "./sub-components/helpers";
import InputGroup from "./sub-components/input-group";
import ChipsRender from "./sub-components/chips-render";
import { EmailSettings, parseAddresses } from "../utils/email";
import { Scrollbar } from "../index";

const calcMaxLengthInput = (exceededLimit: any) =>
  exceededLimit * MAX_EMAIL_LENGTH_WITH_DOTS;

const EmailChips = ({
  options,
  placeholder,
  onChange,
  clearButtonLabel,
  existEmailText,
  invalidEmailText,
  exceededLimit,
  exceededLimitText,
  exceededLimitInputText,
  chipOverLimitText,
  ...props
}: any) => {
  const [chips, setChips] = useState(options || []);
  const [currentChip, setCurrentChip] = useState(null);
  const [selectedChips, setSelectedChips] = useState([]);

  const [isExistedOn, setIsExistedOn] = useState(false);
  const [isExceededLimitChips, setIsExceededLimitChips] = useState(false);
  const [isExceededLimitInput, setIsExceededLimitInput] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const blockRef = useRef(null);
  const scrollbarRef = useRef(null);
  const chipsCount = useRef(options?.length);

  useEffect(() => {
    onChange(
      chips.map((it: any) => {
        if (it?.name === it?.email || it?.name === "") {
          return {
            email: it?.email,
            isValid: it?.isValid,
          };
        }
        return {
          name: it?.name,
          email: it?.email,
          isValid: it?.isValid,
        };
      })
    );
  }, [chips]);

  useEffect(() => {
    const isChipAdd = chips.length > chipsCount.current;
    if (scrollbarRef.current && isChipAdd) {
      // @ts-expect-error TS(2339): Property 'scrollTo' does not exist on type 'never'... Remove this comment to see the full error message
      scrollbarRef.current?.scrollTo(0, scrollbarRef.current?.scrollHeight);
    }
    chipsCount.current = chips.length;
  }, [chips.length]);

  useClickOutside(
    blockRef,
    () => {
      if (selectedChips.length > 0) {
        setSelectedChips([]);
      }
    },
    selectedChips
  );

  useClickOutside(inputRef, () => {
    onHideAllTooltips();
  });

  const onClick = (value: any, isShiftKey: any) => {
    if (isShiftKey) {
      // @ts-expect-error TS(2339): Property 'email' does not exist on type 'never'.
      const isExisted = !!selectedChips?.find((it) => it.email === value.email);
      return isExisted
        ? setSelectedChips(
            // @ts-expect-error TS(2339): Property 'email' does not exist on type 'never'.
            selectedChips.filter((it) => it.email != value.email)
          )
        : // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
          setSelectedChips([value, ...selectedChips]);
    } else {
      // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
      setSelectedChips([value]);
    }
  };

  const onDoubleClick = (value: any) => {
    setCurrentChip(value);
  };

  const onDelete = useCallback(
    (value: any) => {
      setChips(chips.filter((it: any) => it.email !== value.email));
    },
    [chips]
  );

  const checkSelected = (value: any) => {
    // @ts-expect-error TS(2339): Property 'email' does not exist on type 'never'.
    return !!selectedChips?.find((item) => item?.email === value?.email);
  };

  const onSaveNewChip = (value: any, newValue: any) => {
    const settings = new EmailSettings();
    settings.allowName = true;
    let parsed = parseAddresses(newValue, settings);
    parsed[0].isValid = parsed[0].isValid();
    if (newValue && newValue !== `"${value?.name}" <${value?.email}>`) {
      const newChips = chips.map((it: any) => {
        return it.email === value.email ? sliceEmail(parsed[0]) : it;
      });
      setChips(newChips);
      // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
      setSelectedChips([sliceEmail(parsed[0])]);
    }

    // @ts-expect-error TS(2531): Object is possibly 'null'.
    containerRef.current.setAttribute("tabindex", "-1");
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    containerRef.current.focus();

    setCurrentChip(null);
  };

  const copyToClipbord = () => {
    if (currentChip === null) {
      navigator.clipboard.writeText(
        selectedChips
          .map((it) => {
            // @ts-expect-error TS(2339): Property 'name' does not exist on type 'never'.
            if (it.name !== it.email) {
              // @ts-expect-error TS(2339): Property 'name' does not exist on type 'never'.
              let copyItem = `"${it.name}" <${it.email}>`;
              return copyItem;
            } else {
              // @ts-expect-error TS(2339): Property 'email' does not exist on type 'never'.
              return it.email;
            }
          })
          .join(", ")
      );
    }
  };

  const onKeyDown = (e: any) => {
    const whiteList = [
      "Enter",
      "Escape",
      "Backspace",
      "Delete",
      "ArrowRigth",
      "ArrowLeft",
      "ArrowLeft",
      "ArrowRight",
      "KeyC",
    ];

    const code = e.code;

    const isShiftDown = e.shiftKey;
    const isCtrlDown = e.ctrlKey;

    if (!whiteList.includes(code) && !isCtrlDown && !isShiftDown) {
      return;
    }
    if (code === "Enter" && selectedChips.length == 1 && !currentChip) {
      e.stopPropagation();
      setCurrentChip(selectedChips[0]);
      return;
    }

    if (code === "Escape") {
      setSelectedChips(currentChip ? [currentChip] : []);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      containerRef.current.setAttribute("tabindex", "0");
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      containerRef.current.focus();
      return;
    }

    if (
      selectedChips.length > 0 &&
      (code === "Backspace" || code === "Delete") &&
      !currentChip
    ) {
      // @ts-expect-error TS(2345): Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
      const filteredChips = chips.filter(
        (e: any) => !~selectedChips.indexOf(e)
      );
      setChips(filteredChips);
      setSelectedChips([]);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      inputRef.current.focus();
      return;
    }

    if (selectedChips.length > 0 && !currentChip) {
      let chip: any = null;

      if (isShiftDown && code === "ArrowRigth") {
        chip = selectedChips[selectedChips.length - 1];
      } else {
        chip = selectedChips[0];
      }

      const index = chips.findIndex((it: any) => it.email === chip?.email);

      switch (code) {
        case "ArrowLeft": {
          if (isShiftDown) {
            // @ts-expect-error TS(2345): Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
            selectedChips.includes(chips[index - 1])
              ? setSelectedChips(
                  selectedChips.filter((it) => it !== chips[index])
                )
              : chips[index - 1] &&
                // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
                setSelectedChips([chips[index - 1], ...selectedChips]);
          } else if (index != 0) {
            // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
            setSelectedChips([chips[index - 1]]);
          }
          break;
        }
        case "ArrowRight": {
          if (isShiftDown) {
            // @ts-expect-error TS(2345): Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
            selectedChips.includes(chips[index + 1])
              ? setSelectedChips(
                  selectedChips.filter((it) => it !== chips[index])
                )
              : chips[index + 1] &&
                // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
                setSelectedChips([chips[index + 1], ...selectedChips]);
          } else {
            if (index != chips.length - 1) {
              // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
              setSelectedChips([chips[index + 1]]);
            } else {
              setSelectedChips([]);
              if (inputRef) {
                // @ts-expect-error TS(2531): Object is possibly 'null'.
                inputRef.current.focus();
              }
            }
          }
          break;
        }
        case "KeyC": {
          if (isCtrlDown) {
            copyToClipbord();
          }
          break;
        }
      }
    }
  };

  const goFromInputToChips = () => {
    // @ts-expect-error TS(2322): Type 'any' is not assignable to type 'never'.
    setSelectedChips([chips[chips?.length - 1]]);
  };

  const onClearClick = () => {
    setChips([]);
  };

  const onHideAllTooltips = () => {
    setIsExceededLimitChips(false);
    setIsExistedOn(false);
    setIsExceededLimitInput(false);
  };

  const showTooltipOfLimit = () => {
    setIsExceededLimitInput(true);
  };

  const onAddChip = (chipsToAdd: any) => {
    setIsExceededLimitChips(chips.length >= exceededLimit);
    if (chips.length >= exceededLimit) return;
    const filterLimit = exceededLimit - chips.length;

    const filteredChips = chipsToAdd
      .map(sliceEmail)
      .filter((it: any, index: any) => {
        const isExisted = !!chips.find(
          (chip: any) => chip.email === it || chip.email === it?.email
        );
        if (chipsToAdd.length === 1) {
          setIsExistedOn(isExisted);
          if (isExisted) return false;
        }
        return !isExisted && index < filterLimit;
      });
    setChips([...chips, ...filteredChips]);
  };

  return (
    <StyledContent {...props}>
      // @ts-expect-error TS(2769): No overload matches this call.
      <StyledChipGroup onKeyDown={onKeyDown} ref={containerRef} tabindex="-1">
        // @ts-expect-error TS(2769): No overload matches this call.
        <StyledChipWithInput length={chips.length}>
          <Scrollbar scrollclass={"scroll"} ref={scrollbarRef}>
            <ChipsRender
              // @ts-expect-error TS(2322): Type '{ chips: any; checkSelected: (value: any) =>... Remove this comment to see the full error message
              chips={chips}
              checkSelected={checkSelected}
              currentChip={currentChip}
              blockRef={blockRef}
              onClick={onClick}
              invalidEmailText={invalidEmailText}
              chipOverLimitText={chipOverLimitText}
              onDelete={onDelete}
              onDoubleClick={onDoubleClick}
              onSaveNewChip={onSaveNewChip}
            />
          </Scrollbar>

          <InputGroup
            // @ts-expect-error TS(2322): Type '{ placeholder: any; exceededLimitText: any; ... Remove this comment to see the full error message
            placeholder={placeholder}
            exceededLimitText={exceededLimitText}
            existEmailText={existEmailText}
            exceededLimitInputText={exceededLimitInputText}
            clearButtonLabel={clearButtonLabel}
            inputRef={inputRef}
            containerRef={containerRef}
            maxLength={calcMaxLengthInput(exceededLimit)}
            goFromInputToChips={goFromInputToChips}
            onClearClick={onClearClick}
            isExistedOn={isExistedOn}
            isExceededLimitChips={isExceededLimitChips}
            isExceededLimitInput={isExceededLimitInput}
            onHideAllTooltips={onHideAllTooltips}
            showTooltipOfLimit={showTooltipOfLimit}
            onAddChip={onAddChip}
          />
        </StyledChipWithInput>
      </StyledChipGroup>
    </StyledContent>
  );
};

EmailChips.propTypes = {
  /** Array of objects with chips */
  options: PropTypes.arrayOf(PropTypes.object),
  /** Placeholder text for the input */
  placeholder: PropTypes.string,
  /** The text displayed in the button that triggers cleaning all chips */
  clearButtonLabel: PropTypes.string,
  /** Warning text when entering an existing email */
  existEmailText: PropTypes.string,
  /** Warning text when entering an invalid email */
  invalidEmailText: PropTypes.string,
  /** Limit of chips */
  exceededLimit: PropTypes.number,
  /** Warning text when entering the number of chips exceeding the limit */
  exceededLimitText: PropTypes.string,
  /** Warning text when the number of inputted characters exceeds the limit */
  exceededLimitInputText: PropTypes.string,
  /** Warning text when the number of the email address characters exceeds the limit */
  chipOverLimitText: PropTypes.string,
  /** Sets a callback function that will be called when the selected items are changed */
  onChange: PropTypes.func.isRequired,
};

EmailChips.defaultProps = {
  placeholder: "Invite people by name or email",
  clearButtonLabel: "Clear list",
  existEmailText: "This email address has already been entered",
  invalidEmailText: "Invalid email address",
  exceededLimitText:
    "The limit on the number of emails has reached the maximum",
  exceededLimitInputText:
    "The limit on the number of characters has reached the maximum value",
  exceededLimit: 50,
};

export default EmailChips;
