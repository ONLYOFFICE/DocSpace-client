import { useEffect } from "react";
import Column from "@docspace/common/components/Column";

import BoardWrapper from "./BoardWrapper";
import { BoardContainer } from "./Board.styled";

import type BoardProps from "./Board.props";

function Board({
  roles,
  getModel,
  sectionWidth,
  clearSelectedFileByRoleMap,
}: BoardProps) {
  useEffect(() => {
    return () => clearSelectedFileByRoleMap();
  }, []);

  return (
    <BoardWrapper sectionWidth={sectionWidth}>
      <BoardContainer data-id="board">
        {roles.map((role) => (
          <Column key={role.id} role={role} getModel={getModel} />
        ))}
      </BoardContainer>
    </BoardWrapper>
  );
}

export default Board;
