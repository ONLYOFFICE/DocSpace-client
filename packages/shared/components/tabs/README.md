# Tabs

### Usage

```js
import { Tabs } from "@docspace/shared/components/tabs";
```

```js
const array_items = [
  {
    id: "0",
    name: "Title1",
    content: (
      <div>
        <div>
          <button>BUTTON</button>
        </div>
        <div>
          <button>BUTTON</button>
        </div>
        <div>
          <button>BUTTON</button>
        </div>
      </div>
    ),
  },
  {
    id: "1",
    name: "Title2",
    content: (
      <div>
        <div>
          <label>LABEL</label>
        </div>
        <div>
          <label>LABEL</label>
        </div>
        <div>
          <label>LABEL</label>
        </div>
      </div>
    ),
  },
  {
    id: "2",
    name: "Title3",
    isDisabled: true;
    content: (
      <div>
        <div>
          <input></input>
        </div>
        <div>
          <input></input>
        </div>
        <div>
          <input></input>
        </div>
      </div>
    ),
  },
];
```

```jsx
<Tabs items={array_items} />
```

### Tabs Properties

| Props            |          Type          | Required | Values |  Default  | Description                                                         |
| ---------------- | :--------------------: | :------: | :----: | :-------: | ------------------------------------------------------------------- |
| `items`          |        `array`         |    ✅    |   -    |     -     | Child elements                                                      |
| `selectedItemId` |   `number`, `string`   |    -     |   -    |     -     | Selected item id of tabs                                            |
| `theme`          | `primary`, `secondary` |    -     |   -    | `primary` | Theme for displaying tabs                                           |
| `stickyTop`      |        `string`        |    -     |   -    |     -     | Tab indentation for sticky positioning                              |
| `onSelect`       |         `func`         |    -     |   -    |     -     | Sets a callback function that is triggered when the tab is selected |

### Array Items Properties

| Props        |   Type    | Required | Values | Default | Description                                                              |
| ------------ | :-------: | :------: | :----: | :-----: | ------------------------------------------------------------------------ |
| `id`         | `string`  |    ✅    |   -    |    -    | Index of object array                                                    |
| `name`       | `string`  |    ✅    |   -    |    -    | Tab text                                                                 |
| `content`    |  `node`   |    ✅    |   -    |    -    | Content in Tab                                                           |
| `isDisabled` | `boolean` |    -     |   -    |    -    | State of tab inclusion. State only works for tabs with a secondary theme |
| `onClick`    |  `func`   |    -     |   -    |    -    | Triggered when a title is selected                                       |
