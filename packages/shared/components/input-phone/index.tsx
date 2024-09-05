// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

// import { useState, useEffect } from "react";
// import { useTheme } from "styled-components";
// // @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
// import { FixedSizeList as List } from "react-window";
// import PropTypes from "prop-types";

// import { options } from "./options";
// import { StyledBox } from "./styled-input-phone";

// // @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/phoneFlags/i... Remove this comment to see the full error message
// import InvalidSvgUrl from "PUBLIC_DIR/images/phoneFlags/invalid.svg?url";
// import CustomScrollbarsVirtualList from "../scrollbar/custom-scrollbars-virtual-list";
// import Box from "../box";
// import ComboBox from "../combobox";
// import Label from "../label";
// import TextInput from "../text-input";
// import SearchInput from "../search-input";
// import DropDown from "../drop-down";
// import DropDownItem from "../drop-down-item";
// import Text from "../text";

// const PLUS = "+";

// const InputPhone = ({
//   defaultCountry,
//   onChange,
//   scaled,
//   phonePlaceholderText,
//   searchPlaceholderText,
//   searchEmptyMessage,
//   errorMessage,
// // @ts-expect-error TS(2304): Cannot find name 'props'.
// } = props) => {
//   const [country, setCountry] = useState(defaultCountry);
//   const [phoneValue, setPhoneValue] = useState(country.dialCode);
//   const [searchValue, setSearchValue] = useState("");
//   const [filteredOptions, setFilteredOptions] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isValid, setIsValid] = useState(true);
//   const theme = useTheme();
//   // @ts-expect-error TS(2339): Property 'interfaceDirection' does not exist on ty... Remove this comment to see the full error message
//   const isRtl = theme.interfaceDirection === "rtl";

//   const onInputChange = (e: any) => {
//     const str = e.target.value.replace(/\D/g, "");
//     const el = options.find(
//       (option) => option.dialCode && str.startsWith(option.dialCode)
//     );
//     const singleCode = ["1", "7"];
//     const invalidCode = singleCode.find((code) => code === str);

//     if (e.target.value === "" || !e.target.value.includes(invalidCode)) {
//       setIsValid(false);
//       setCountry((prev: any) => ({
//         ...prev,
//         icon: InvalidSvgUrl
//       }));
//     }

//     setPhoneValue(e.target.value);

//     if (el) {
//       setIsValid(true);
//       setCountry({
//         locale: el.code,
//         mask: el.mask,
//         icon: el.flag,
//       });
//     }
//     onChange && onChange(e);
//   };

//   const onCountrySearch = (value: any) => {
//     setSearchValue(value);
//   };

//   const onClearSearch = () => {
//     setSearchValue("");
//   };

//   const getMask = (locale: any) => {
//     // @ts-expect-error TS(2532): Object is possibly 'undefined'.
//     return options.find((option) => option.code === locale).mask;
//   };

//   const handleClick = () => {
//     setIsOpen(!isOpen);
//   };

//   useEffect(() => {
//     if (isOpen) {
//       setFilteredOptions(
//         // @ts-expect-error TS(2345): Argument of type '{ name: string; dialCode: string... Remove this comment to see the full error message
//         options.filter(
//           (val) =>
//             val.name.toLowerCase().startsWith(searchValue.toLowerCase()) ||
//             val.dialCode.startsWith(searchValue.toLowerCase())
//         )
//       );
//     }
//   }, [isOpen, searchValue]);

//   const onCountryClick = (e: any) => {
//     const data = e.currentTarget.dataset.option;
//     const country = filteredOptions[data];

//     setIsOpen(!isOpen);
//     setCountry({
//       // @ts-expect-error TS(2339): Property 'code' does not exist on type 'never'.
//       locale: country.code,
//       // @ts-expect-error TS(2339): Property 'mask' does not exist on type 'never'.
//       mask: country.mask,
//       // @ts-expect-error TS(2339): Property 'flag' does not exist on type 'never'.
//       icon: country.flag,
//     });
//     setIsValid(true);
//     // @ts-expect-error TS(2339): Property 'dialCode' does not exist on type 'never'... Remove this comment to see the full error message
//     setPhoneValue(country.dialCode);
//   };

//   const Row = ({
//     data,
//     index,
//     style
//   }: any) => {
//     const country = data[index];
//     const prefix = "+";
//     const RtlRowComponent = () => (
//       <>
//         // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
//         <Text className="country-dialcode">{country.dialCode}</Text>
//         // @ts-expect-error TS(2322): Type '{ children: string; className: string; }' is... Remove this comment to see the full error message
//         <Text className="country-prefix">{prefix}</Text>
//         // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
//         <Text className="country-name">{country.name}</Text>
//       </>
//     );
//     const LtrRowComponent = () => (
//       <>
//         // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
//         <Text className="country-name">{country.name}</Text>
//         // @ts-expect-error TS(2322): Type '{ children: string; className: string; }' is... Remove this comment to see the full error message
//         <Text className="country-prefix">{prefix}</Text>
//         // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
//         <Text className="country-dialcode">{country.dialCode}</Text>
//       </>
//     );

//     return (
//       <DropDownItem
//         key={country.code}
//         style={style}
//         icon={country.flag}
//         fillIcon={false}
//         className="country-item"
//         data-option={index}
//         onClick={onCountryClick}
//       >
//         {isRtl ? <RtlRowComponent /> : <LtrRowComponent />}
//       </DropDownItem>
//     );
//   };

//   return (
//     <StyledBox
//       hasError={!isValid}
//       displayProp="flex"
//       alignItems="center"
//       scaled={scaled}
//     >
//       <ComboBox
//         // @ts-expect-error TS(2322): Type '{ options: never[]; noBorder: boolean; opene... Remove this comment to see the full error message
//         options={[]}
//         noBorder={true}
//         opened={isOpen}
//         data="country"
//         onToggle={handleClick}
//         displayType="toggle"
//         className="country-box"
//         fillIcon={true}
//         selectedOption={country}
//       />
//       {!isRtl && <Label text={PLUS} className="prefix" />}
//       <TextInput
//         type="tel"
//         className="input-phone"
//         placeholder={phonePlaceholderText}
//         mask={getMask(country.locale)}
//         withBorder={false}
//         tabIndex={1}
//         value={phoneValue}
//         onChange={onInputChange}
//       />
//       {isRtl && <Label text={PLUS} className="prefix" />}

//       // @ts-expect-error TS(2769): No overload matches this call.
//       <DropDown
//         open={isOpen}
//         clickOutsideAction={handleClick}
//         isDefaultMode={false}
//         className="drop-down"
//         manualWidth="100%"
//       >
//         <SearchInput
//           // @ts-expect-error TS(2322): Type '{ placeholder: any; value: string; className... Remove this comment to see the full error message
//           placeholder={searchPlaceholderText}
//           value={searchValue}
//           className="search-country_input"
//           scale={true}
//           onClearSearch={onClearSearch}
//           refreshTimeout={100}
//           onChange={onCountrySearch}
//         />
//         // @ts-expect-error TS(2322): Type '{ children: Element; marginProp: string; }' ... Remove this comment to see the full error message
//         <Box marginProp="6px 0 0">
//           {filteredOptions.length ? (
//             <List
//               itemData={filteredOptions}
//               height={108}
//               itemCount={filteredOptions.length}
//               itemSize={36}
//               outerElementType={CustomScrollbarsVirtualList}
//               width="auto"
//             >
//               {Row}
//             </List>
//           ) : (
//             // @ts-expect-error TS(2322): Type '{ children: any; textAlign: string; classNam... Remove this comment to see the full error message
//             <Text
//               textAlign="center"
//               className="phone-input_empty-text"
//               fontSize="14px"
//             >
//               {searchEmptyMessage}
//             </Text>
//           )}
//         </Box>
//       </DropDown>

//       {!isValid && (
//         // @ts-expect-error TS(2322): Type '{ children: any; className: string; color: s... Remove this comment to see the full error message
//         <Text
//           className="phone-input_error-text"
//           fontSize="11px"
//           lineHeight="14px"
//         >
//           {errorMessage}
//         </Text>
//       )}
//     </StyledBox>
//   );
// };

// InputPhone.propTypes = {
//   /** Default selected country */
//   defaultCountry: PropTypes.object.isRequired,
//   /** Text displayed on the Input placeholder */
//   phonePlaceholderText: PropTypes.string,
//   /** Text displayed on the SearchInput placeholder */
//   searchPlaceholderText: PropTypes.string,
//   /** Indicates that the input field has scaled */
//   scaled: PropTypes.bool,
//   /** The callback function that is called when the value is changed */
//   onChange: PropTypes.func,
//   /** Gets the country mask  */
//   searchEmptyMessage: PropTypes.string,
//   /** Text displayed in case of the invalid country dial code */
//   errorMessage: PropTypes.string,
// };

// InputPhone.defaultProps = {
//   defaultCountry: {
//     locale: options[182].code, // default locale RU
//     dialCode: options[182].dialCode, // default dialCode +7
//     mask: options[182].mask, // default Russia mask
//     icon: options[182].flag, // default Russia flag
//   },
//   phonePlaceholderText: "",
//   searchPlaceholderText: "",
//   scaled: false,
//   searchEmptyMessage: "",
//   errorMessage: "",
// };

// InputPhone.displayName = "InputPhone";

// export default InputPhone;
