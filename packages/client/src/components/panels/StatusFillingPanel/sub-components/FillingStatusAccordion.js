import { useState, useEffect } from "react";
import { ReactSVG } from "react-svg";
import { observer, inject } from "mobx-react";

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
  isInterrupted,
  locale,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const onClickHandler = () => {
    setIsOpen((prev) => !prev);
  };

  const convertTime = (date) => {
    return new Date(date).toLocaleString(locale);
  };

  const statusType = {
    1: "Start filling",
    2: "Filled and signed",
    3: "Interrupted",
  };

  const lastStatusType = formFillingSteps.at(-1);

  useEffect(() => {
    if (lastStatusType?.formFilingStatusType === 1) setIsStarted(true);
    if (lastStatusType?.formFilingStatusType === 2) setIsFilled(true);
  }, []);

  return (
    <AccordionItem
      isOpen={isOpen}
      isStarted={isStarted}
      isDone={isFilled}
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
                  {statusType[step.formFilingStatusType]}
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
              {statusType[lastStatusType?.formFilingStatusType]}
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
export default inject(({ auth }) => {
  const { culture } = auth.settingsStore;
  const { user } = auth.userStore;
  const locale = (user && user.cultureName) || culture || "en";
  return {
    locale,
  };
})(observer(FillingStatusAccordion));
