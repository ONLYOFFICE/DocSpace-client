import React from "react";
import { StyledTrashWarning } from "../Navigation.styled";

const TrashWarning = ({ title }: { title?: string }) => {
  return (
    <StyledTrashWarning className="trash-warning">{title}</StyledTrashWarning>
  );
};

export default TrashWarning;
