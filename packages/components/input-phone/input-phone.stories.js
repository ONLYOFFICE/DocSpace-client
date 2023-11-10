import { useState } from "react";
import { options } from "./options";
import InputPhone from "./index";

export default {
  title: "Components/InputPhone",
  component: InputPhone,
  argTypes: {
    onChange: { control: "onChange" },
  },
};

const Template = ({ onChange, value, ...args }) => {
  const [val, setValue] = useState(value);

  return (
    <div style={{ height: "300px" }}>
      <InputPhone
        {...args}
        value={val}
        onChange={(e) => {
          setValue(e.target.value), onChange(e.target.value);
        }}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultCountry: {
    locale: options[236].code, // default locale US
    dialCode: options[236].dialCode, // default dialCode +1
    mask: options[236].mask, // default US mask
    icon: options[236].flag, // default US flag
  },
  phonePlaceholderText: "1 XXX XXX-XXXX",
  searchPlaceholderText: "Search",
  scaled: false,
  searchEmptyMessage: "Nothing found",
  errorMessage: "Сountry code is invalid",
};
