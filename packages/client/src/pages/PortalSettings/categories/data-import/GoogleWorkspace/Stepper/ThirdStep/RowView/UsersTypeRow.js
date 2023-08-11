import Row from "@docspace/components/row";
import UsersTypeRowContent from "./UsersTypeRowContent";

const UsersTypeRow = (props) => {
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
        <UsersTypeRowContent
          sectionWidth={sectionWidth}
          displayName={data.displayName}
          email={data.email}
          type={data.type}
        />
      </Row>
    </>
  );
};

export default UsersTypeRow;
