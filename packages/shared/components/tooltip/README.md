# Tooltip

Custom tooltip

#### See documentation: https://github.com/wwayne/react-tooltip

### Usage with IconButton

```js
import { Tooltip, IconButton, Text } from "@docspace/shared/components";
import QuestionReactSvgUrl from "PUBLIC_DIR/images/question.react.svg?url";
```

```jsx
<div
  style={BodyStyle}
  data-for="tooltipContent"
  data-tip="Your tooltip content"
  data-event="click focus"
  data-place="top"
>
  <IconButton isClickable={true} size={20} iconName={QuestionReactSvgUrl} />
</div>
<Tooltip
  id="tooltipContent"
  getContent={dataTip => <Text fontSize="13px">{dataTip}</Text>}
  place="top"
  maxWidth="320px"
/>
```

### Usage with array

```js
import { Tooltip, Link, Text } from "@docspace/shared/components";

const arrayUsers = [
  { key: "user_1", name: "Bob", email: "Bob@gmail.com", position: "developer" },
  {
    key: "user_2",
    name: "John",
    email: "John@gmail.com",
    position: "developer",
  },
  {
    key: "user_3",
    name: "Kevin",
    email: "Kevin@gmail.com",
    position: "developer",
  },
];
```

```jsx
<div>
  <h5>Hover group</h5>
  <Link data-for="group" data-tip={0}>Bob</Link>
  <Link data-for="group" data-tip={1}>John</Link>
  <Link data-for="group" data-tip={2}>Kevin</Link>
</div>

<Tooltip
  id="group"
  getContent={(dataTip) =>
    dataTip ? (
      <div>
        <Text isBold={true} fontSize="16px">
          {arrayUsers[dataTip].name}
        </Text>
        <Text color="#A3A9AE" fontSize="13px">
          {arrayUsers[dataTip].email}
        </Text>
        <Text fontSize="13px">{arrayUsers[dataTip].position}</Text>
      </div>
    ) : null
  }
/>
```

### Properties

| Props                       |      Type      | Required |              Values              | Default | Description                                                  |
| --------------------------- | :------------: | :------: | :------------------------------: | :-----: | ------------------------------------------------------------ |
| `id`                        |    `string`    |    ✅    |                -                 |    -    | Used as HTML id property                                     |
| `place`                     |    `string`    |    -     | `top`, `right`, `bottom`, `left` |  `top`  | Global tooltip placement                                     |
| `getContent`                |     `func`     |    -     |                -                 |    -    | Generate the tip content dynamically                         |
| `afterHide`                 |     `func`     |    -     |                -                 |    -    | Called after tooltip is hidden                               |
| `afterShow`                 |     `func`     |    -     |                -                 |    -    | Called after tooltip is shown                                |
| `className`                 |    `string`    |    -     |                -                 |    -    | Additional CSS class                                         |
| `style`                     | `obj`, `array` |    -     |                -                 |    -    | Custom CSS styles                                            |
| `color`                     |    `string`    |    -     |                -                 |    -    | Background color of the tooltip                              |
| `maxWidth`                  |    `string`    |    -     |                -                 | `320px` | Maximum width of the tooltip                                 |
| `isOpen`                    |     `bool`     |    -     |                -                 | `false` | Control tooltip visibility                                   |
| `clickable`                 |     `bool`     |    -     |                -                 | `false` | Allow interaction with tooltip content                       |
| `openOnClick`               |     `bool`     |    -     |                -                 | `false` | Open on click instead of hover                               |
| `float`                     |     `bool`     |    -     |                -                 | `false` | Follow mouse position                                        |
| `noArrow`                   |     `bool`     |    -     |                -                 | `true`  | Hide tooltip arrow                                           |
| `opacity`                   |    `number`    |    -     |                -                 |   `1`   | Tooltip opacity                                              |
| `imperativeModeOnly`        |     `bool`     |    -     |                -                 | `false` | Disable default tooltip behavior                             |
| `fallbackAxisSideDirection` |    `string`    |    -     |      `none`, `start`, `end`      | `none`  | Fallback direction when preferred placement is not available |

### Anchor Element Properties

| Props        |   Type   | Required |              Values              | Default | Description                     |
| ------------ | :------: | :------: | :------------------------------: | :-----: | ------------------------------- |
| `data-for`   | `string` |    ✅    |                -                 |    -    | Corresponds to tooltip's id     |
| `data-tip`   | `string` |    ✅    |                -                 |    -    | Tooltip content                 |
| `data-event` | `string` |    -     |          `click, focus`          |    -    | Custom event to trigger tooltip |
| `data-place` | `string` |    -     | `top`, `right`, `bottom`, `left` |  `top`  | Tooltip placement               |
