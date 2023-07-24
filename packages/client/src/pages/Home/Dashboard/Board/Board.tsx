import Column from "@docspace/common/components/Column";

import BoardWrapper from "./BoardWrapper";
import { BoardContainer } from "./Board.styled";

import type BoardProps from "./Board.props";

function Board({ roles, getModel, sectionWidth }: BoardProps) {
  return (
    <BoardWrapper sectionWidth={sectionWidth}>
      <BoardContainer>
        {roles.map((role) => (
          <Column key={role.id} role={role} getModel={getModel} />
        ))}
      </BoardContainer>
    </BoardWrapper>
  );
}

export default Board;
