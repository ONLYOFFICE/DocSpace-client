import React from "react";
import { Meta, StoryObj } from "@storybook/react";

// import NavLogoIcon from "PUBLIC_DIR/images/nav.logo.opened.react.svg";
// import CatalogEmployeeReactSvgUrl from "PUBLIC_DIR/images/catalog.employee.react.svg?url";
// import CatalogGuestReactSvgUrl from "PUBLIC_DIR/images/catalog.guest.react.svg?url";
// import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

// import { IconSizeType } from "../../utils";
// import { DropDownItem } from "../drop-down-item";
import { ComboBox } from "./ComboBox";
// import RadioButton from "../radio-button";

// import ComboBoxDocs from "./Combobox.docs.mdx";
import { ComboboxProps, TOption } from "./Combobox.types";

const meta = {
  title: "Components/ComboBox",
  component: ComboBox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      // page: ComboBoxDocs,
    },
  },
} satisfies Meta<typeof ComboBox>;
type Story = StoryObj<typeof meta>;

export default meta;

// const comboOptions = [
//   {
//     key: 1,
//     icon: CatalogEmployeeReactSvgUrl,
//     label: "Option 1",
//   },
//   {
//     key: 2,
//     icon: CatalogGuestReactSvgUrl,
//     label: "Option 2",
//   },
//   {
//     key: 3,
//     disabled: true,
//     label: "Option 3",
//   },
//   {
//     key: 4,
//     label: "Option 4",
//   },
//   {
//     key: 5,
//     icon: CopyReactSvgUrl,
//     label: "Option 5",
//   },
//   {
//     key: 6,
//     label: "Option 6",
//   },
//   {
//     key: 7,
//     label: "Option 7",
//   },
// ];

// const childrenArr = [];

// const advancedOptions = (
//   <>
//     <DropDownItem key="1" noHover>
//       {/* <RadioButton value="asc" name="first" label="A-Z" isChecked /> */}
//     </DropDownItem>
//     <DropDownItem key="2" noHover>
//       {/* <RadioButton value="desc" name="first" label="Z-A" /> */}
//     </DropDownItem>
//     <DropDownItem key="3" isSeparator />
//     <DropDownItem key="4" noHover>
//       {/* <RadioButton value="first" name="second" label="First name" /> */}
//     </DropDownItem>
//     <DropDownItem key="5" noHover>
//       {/* <RadioButton
//         value="last"
//         name="second"
//         label="Last name"
//         isChecked
//       /> */}
//     </DropDownItem>
//   </>
// );

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: "220px" }}>{children}</div>;
};

// const childrenItems = childrenArr.length > 0 ? childrenArr : null;

// const BadgeTypeTemplate = (args: ComboboxProps) => (
//   <Wrapper>
//     <ComboBox
//       {...args}
//       fixedDirection
//       isDefaultMode={false}
//       options={[
//         { key: 1, label: "Open", backgroundColor: "#4781D1", color: "#FFFFFF" },
//         { key: 2, label: "Done", backgroundColor: "#444", color: "#FFFFFF" },
//         {
//           key: 3,
//           label: "2nd turn",
//           backgroundColor: "#FFFFFF",
//           color: "#555F65",
//           border: "#4781D1",
//         },
//         {
//           key: 4,
//           label: "3rd turn",
//           backgroundColor: "#FFFFFF",
//           color: "#555F65",
//           border: "#4781D1",
//         },
//       ]}
//       selectedOption={{
//         key: 0,
//         label: "Select",
//       }}
//     />
//   </Wrapper>
// );
const Template = (args: ComboboxProps<TOption>) => (
  <Wrapper>
    <ComboBox
      {...args}
      isDefaultMode={false}
      fixedDirection
      directionY="both"
      options={[
        { key: 1, label: "Option 1" },
        { key: 2, label: "Option 2" },
      ]}
      selectedOption={{
        key: 0,
        label: "Select",
      }}
    />
  </Wrapper>
);

// const BaseOptionsTemplate = (args: ComboboxProps) => (
//   <Wrapper>
//     <ComboBox
//       {...args}
//       isDefaultMode={false}
//       directionY="both"
//       fixedDirection
//       options={comboOptions}
//       onSelect={(option: any) => args.onSelect(option)}
//       selectedOption={{
//         key: 0,
//         label: "Select",
//         default: true,
//       }}
//     >
//       {childrenItems}
//     </ComboBox>
//   </Wrapper>
// );

// const AdvancedOptionsTemplate = (args: ComboboxProps) => {
//   const { onSelect } = args;
//   return (
//     <Wrapper>
//       <ComboBox
//         {...args}
//         isDefaultMode={false}
//         fixedDirection
//         directionY="both"
//         options={[]}
//         advancedOptions={advancedOptions}
//         onSelect={(option?: TOption) => onSelect(option)}
//         selectedOption={{
//           key: 0,
//           label: "Select",
//           default: true,
//         }}
//       >
//         <NavLogoIcon size={IconSizeType.medium} key="comboIcon" />
//       </ComboBox>
//     </Wrapper>
//   );
// };

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    scaled: false,
    options: [
      { key: 1, label: "Open", backgroundColor: "#4781D1", color: "#FFFFFF" },
      { key: 2, label: "Done", backgroundColor: "#444", color: "#FFFFFF" },
      {
        key: 3,
        label: "2nd turn",
        backgroundColor: "#FFFFFF",
        color: "#555F65",
        border: "#4781D1",
      },
      {
        key: 4,
        label: "3rd turn",
        backgroundColor: "#FFFFFF",
        color: "#555F65",
        border: "#4781D1",
      },
    ],
    selectedOption: {
      key: 0,
      label: "Select",
    },
  },
};

// export const BaseOption: Story = {
//   render: (args) => <BaseOptionsTemplate {...args} />,
//   args: {
//     options: [
//       { key: 1, label: "Open", backgroundColor: "#4781D1", color: "#FFFFFF" },
//       { key: 2, label: "Done", backgroundColor: "#444", color: "#FFFFFF" },
//       {
//         key: 3,
//         label: "2nd turn",
//         backgroundColor: "#FFFFFF",
//         color: "#555F65",
//         border: "#4781D1",
//       },
//       {
//         key: 4,
//         label: "3rd turn",
//         backgroundColor: "#FFFFFF",
//         color: "#555F65",
//         border: "#4781D1",
//       },
//     ],
//     selectedOption: {
//       key: 0,
//       label: "Select",
//     },
//     scaledOptions: false,
//     scaled: false,
//     noBorder: false,
//     isDisabled: false,
//   },
// };

// export const advancedOption = AdvancedOptionsTemplate.bind({});

// advancedOption.args = {
//   isDisabled: false,
//   scaled: false,
//   size: "content",
//   directionX: "right",
//   directionY: "bottom",
// };

// export const badgeType = BadgeTypeTemplate.bind({});

// badgeType.args = {
//   scaled: false,
//   type: "badge",
//   size: "content",
//   scaledOptions: true,
// };
