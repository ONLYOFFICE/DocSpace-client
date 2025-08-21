# LinkWithDropdown

A versatile React component that combines a clickable link with a customizable dropdown menu. The component supports two display modes through `dropdownType`:
- `alwaysDashed`: Shows a dotted underline and dropdown arrow permanently
- `appearDashedAfterHover`: Reveals the dotted underline and dropdown arrow only on hover

The component is mobile-responsive and provides extensive styling options including custom colors, font sizes, and weights. It can be used for navigation menus, action menus, or any interface element requiring a combination of a link and dropdown functionality.

Key features:
- Customizable link appearance (color, weight, size)
- Mobile-friendly with orientation support
- Optional scrollable dropdown content
- Support for disabled state
- Controlled and uncontrolled dropdown states
- Custom width configuration
- Semi-transparent mode for overlay contexts

### Usage

```js
import { LinkWithDropdown } from "@docspace/shared/components";
```

```jsx
<LinkWithDropdown color="black" isBold={true} data={data}>
  Link with dropdown
</LinkWithDropdown>
```

### Properties

| Props               |       Type       | Required |                 Values                 | Default | Description                                                                                                                                               |
| ------------------- | :--------------: | :------: | :------------------------------------: | :-----: | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `color`             |     `oneOf`      |    -     |        `gray`, `black`, `blue`         | `black` | Color of link in all states - hover, active, visited                                                                                                      |
| `data`              |     `array`      |    -     |                   -                    |    -    | Array of objects, each can contain `<DropDownItem />` props                                                                                               |
| `dropdownType`      |     `oneOf`      |    ✅    | `alwaysDashed, appearDashedAfterHover` |    -    | Type of dropdown: alwaysDashed is always show dotted style and icon of arrow, appearDashedAfterHover is show dotted style and icon arrow only after hover |
| `fontSize`          |     `string`     |    -     |                   -                    | `13px`  | Font size of link                                                                                                                                         |
| `fontWeight`        | `number, string` |    -     |                   -                    |    -    | Font weight of link                                                                                                                                       |
| `id`                |     `string`     |    -     |                   -                    |    -    | Accepts id                                                                                                                                                |
| `isBold`            |      `bool`      |    -     |                   -                    | `false` | Set font weight                                                                                                                                           |
| `isSemitransparent` |      `bool`      |    -     |                   -                    | `false` | Set css-property 'opacity' to 0.5. Usually apply for users with "pending" status                                                                          |     |
| `isTextOverflow`    |      `bool`      |    -     |                   -                    | `true`  | Activate or deactivate _text-overflow_ CSS property with ellipsis (' … ') value                                                                           |
| `style`             |  `obj`, `array`  |    -     |                   -                    |    -    | Accepts css style                                                                                                                                         |
| `title`             |     `string`     |    -     |                   -                    |    -    | Title of link                                                                                                                                             |     |
