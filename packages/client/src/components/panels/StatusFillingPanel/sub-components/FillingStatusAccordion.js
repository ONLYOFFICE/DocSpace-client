import { useState, useEffect } from "react";
import { ReactSVG } from "react-svg";

import { AccordionItem } from "./StyledFillingStatusLine";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Avatar from "@docspace/components/avatar";

const FillingStatusAccordion = ({
  avatar,
  displayName,
  role,
  formFillingSteps,
  locale,
  getStatusIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);

  const onClickHandler = () => {
    setIsOpen((prev) => !prev);
  };

  const convertTime = (date) => {
    return new Date(date).toLocaleString(locale);
  };

  const convertStep = (step) => {
    if (step === 1) return "Start Filling";
    if (step === 2) return "Filled and signed";
    if (step === 3) return "Interrupted filling";
  };

  const lastStatusType = formFillingSteps.at(-1);

  useEffect(() => {
    switch (lastStatusType?.formFilingStatusType) {
      case 1:
        setIsStarted(true);
        getStatusIcon(true);
        break;
      case 2:
        setIsFilled(true);
        getStatusIcon(true);
        break;
      case 3:
        setIsInterrupted(true);
        getStatusIcon(true);
        break;
      default:
        getStatusIcon(false);
        break;
    }
  }, []);

  return (
    <AccordionItem
      isOpen={isOpen}
      isStarted={isStarted}
      isFilled={isFilled}
      isInterrupted={isInterrupted}
    >
      <div className="accordion-item-info" onClick={onClickHandler}>
        <Box displayProp="flex" alignItems="center">
          <Avatar
            className="user-avatar"
            size="min"
            role="user"
            source={avatar}
            userName={displayName}
          />

          <Box displayProp="flex" flexDirection="column">
            <Text className="accordion-displayname">{displayName}</Text>
            <Text className="accordion-role">{role}</Text>
          </Box>
        </Box>

        {formFillingSteps.length > 1 && (
          <ReactSVG src={ArrowReactSvgUrl} className="arrow-icon" />
        )}
      </div>

      {isOpen &&
        formFillingSteps.map((step) => (
          <>
            <div className="accordion-item-history">
              <div className="accordion-item-wrapper">
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  className={isFilled ? "filled-status-text" : "status-text"}
                >
                  {convertStep(step.formFilingStatusType)}
                </Text>
                <Text fontSize="12px" lineHeight="16px" className="status-date">
                  {convertTime(step.date)}
                </Text>
              </div>
            </div>

            {step.comment && (
              <div className="accordion-item-history">
                <div className="accordion-item-wrapper">
                  <Text
                    fontSize="12px"
                    lineHeight="16px"
                    className="status-text"
                  >
                    {step.comment}
                  </Text>
                </div>
              </div>
            )}
          </>
        ))}

      {!isOpen && lastStatusType && (
        <div className="accordion-item-history">
          <div className="accordion-item-wrapper">
            <Text
              fontSize="12px"
              lineHeight="16px"
              className={isFilled ? "filled-status-text" : "status-text"}
            >
              {convertStep(lastStatusType?.formFilingStatusType)}
            </Text>
            <Text fontSize="12px" lineHeight="16px" className="status-date">
              {convertTime(lastStatusType?.date)}
            </Text>
          </div>
        </div>
      )}
    </AccordionItem>
  );
};
export default FillingStatusAccordion;
