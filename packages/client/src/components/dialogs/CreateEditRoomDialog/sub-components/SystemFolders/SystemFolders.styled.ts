import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";

export const SystemFoldersTitle = styled(Text)`
  font-weight: 600;
  line-height: 20px;
`;

export const SystemFoldersDescription = styled(Text)`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${(props) =>
    props.theme.createEditRoomDialog.roomType.dropdownItem.descriptionText};
`;

export const SystemFoldersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 2px;
`;

export const SystemFoldersToggleButton = styled(ToggleButton)`
  width: 30px;
  height: 16px;
`;
