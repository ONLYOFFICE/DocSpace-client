import Row from "@docspace/components/row";
import UsersRowContent from "./UsersRowContent";

const UsersRow = (props) => {
  const { isChecked, onChangeCheckbox, checkbox, data, sectionWidth, id } =
    props;

  const onChange = (checked) => {
    onChangeCheckbox(id, checked);
  };

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        key={data.id}
        data={data}
        checked={checkbox.includes(id)}
        checkbox={isChecked}
        onSelect={onChange}
        contextButtonSpacerWidth="0"
      >
        <UsersRowContent
          sectionWidth={sectionWidth}
          displayName={data.displayName}
          email={data.email}
          dublicate={data.dublicate}
        />
      </Row>
    </>
  );
};

export default UsersRow;
