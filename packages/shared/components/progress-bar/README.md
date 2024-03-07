# ProgressBar

A container that displays a process or operation as a progress bar

### Usage

```js
import { ProgressBar } from "@docspace/shared/components";
```

```jsx
<ProgressBar percent={25} />
```

### Properties

|        Props         |   Type    | Required | Values | Default | Description                                                    |
| :------------------: | :-------: | :------: | :----: | :-----: | -------------------------------------------------------------- |
|      `percent`       | `number`  |    ✅    |   -    |    -    | Progress value in %. Max value 100%                            |
|       `label`        | `string`  |    -     |   -    |    -    | Text in progress-bar.                                          |
| `isInfiniteProgress` | `boolean` |    -     |   -    |  false  | Whether the progress bar should display as an infinite loader. |
