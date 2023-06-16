import ListProps from "./List.props";
import { RoleRowContainer } from "./List.styled";
import ListRow from "./ListRow";

function List({ roles, sectionWidth }: ListProps) {
  return (
    <RoleRowContainer
      useReactWindow
      className="roles-row-container"
      hasMoreFiles={false}
      filesLength={roles.length}
      itemCount={roles.length}
      itemHeight={58}
      fetchMoreFiles={() => {}}
    >
      {roles.map((role) => (
        <ListRow
          key={role.id}
          isActive={false}
          isChecked={false}
          sectionWidth={sectionWidth}
          role={role}
        />
      ))}
    </RoleRowContainer>
  );
}

export default List;
