import styled from "styled-components";

export const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 294px;
  padding: 16px 15px;
`;

export const ColumnHeader = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr auto;
  grid-template-rows: 1fr 1fr;

  width: 264px;
  height: 40px;

  grid-template-areas:
    "circles title tools"
    ". users tools";

  gap: 6px;

  margin-bottom: 16px;
`;

export const ColumnCircle = styled.div`
  width: 10px;
  height: 10px;
  margin: 2px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  background: ${(props) => props.color};

  grid-area: circles;
`;

export const ColumnIconWrapper = styled(ColumnCircle)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 12px;
  height: 12px;

  border: none;

  .column__cross-icon {
    width: 6px;
    height: 6px;

    path {
      stroke: white;
    }
  }
`;

export const ColumnTitle = styled.h5`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;

  color: ${(props) => props.theme.column.titleColor};

  margin: 0;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  grid-area: title;
`;

export const ColumnUsers = styled.p`
  font-weight: 600;
  font-size: 13px;
  line-height: 15px;

  /* Light/gray/dark */
  color: ${(props) => props.theme.column.userColor};

  margin: 0;
  grid-area: users;

  text-decoration: underline dotted ${(props) => props.theme.column.userColor};
  text-underline-offset: 2px;
`;

export const ColumnActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  padding-left: 2px;

  grid-area: tools;

  .column__location-btn {
    cursor: pointer;
    width: 16px;
  }
`;

export const ColumnBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;
