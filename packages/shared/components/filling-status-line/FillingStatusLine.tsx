import React from "react";
import { ReactSVG } from "react-svg";

import StatusDoneReactSvgUrl from "PUBLIC_DIR/images/done.react.svg?url";
import StatusInterruptedSvgUrl from "PUBLIC_DIR/images/interrupted.react.svg?url";

import { Text } from "../text";
import { Box } from "../box";

import { FillingStatusAccordion } from "./FillingStatusLine.accordion";
import { FillingStatusLineProps } from "./FillingStatusLine.types";
import { FillingStatusContainer } from "./FillingStatusLine.styled";

import { mockData } from "./mockData";

const FillingStatusLine = ({
  statusDoneText = "Done",
  statusInterruptedText = "Interrupted",
  statusDone = true,
  statusInterrupted = false,
}: FillingStatusLineProps) => {
  return (
    <FillingStatusContainer
      isDone={statusDone}
      isInterrupted={statusInterrupted}
    >
      {mockData.map((data) => {
        return (
          <FillingStatusAccordion
            key={data.id}
            displayName={data.displayName}
            avatar={data.avatar}
            role={data.role}
            startFilling={data.startFillingStatus}
            startFillingDate={data.startFillingDate}
            filledAndSigned={data.filledAndSignedStatus}
            filledAndSignedDate={data.filledAndSignedDate}
            returnedByUser={data.returnedByUser}
            returnedDate={data.returnedByUserDate}
            comment={data.comment}
            isDone={statusDone}
            isInterrupted={statusInterrupted}
          />
        );
      })}
      {statusInterrupted ? (
        <Box displayProp="flex" alignItems="center" marginProp="15px 0 0">
          <ReactSVG
            src={StatusInterruptedSvgUrl}
            className="status-interrupted-icon"
          />
          <Text
            fontSize="14px"
            lineHeight="16px"
            fontWeight="bold"
            className="status-interrupted-text"
          >
            {statusInterruptedText}
          </Text>
        </Box>
      ) : (
        <Box displayProp="flex" alignItems="center" marginProp="15px 0 0">
          <ReactSVG src={StatusDoneReactSvgUrl} className="status-done-icon" />
          <Text
            fontSize="14px"
            lineHeight="16px"
            fontWeight="bold"
            className="status-done-text"
          >
            {statusDoneText}
          </Text>
        </Box>
      )}
    </FillingStatusContainer>
  );
};

export { FillingStatusLine };
