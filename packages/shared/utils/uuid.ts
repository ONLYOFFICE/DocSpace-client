/**
 * @description Return unique UUID v4
 */
export const uuid = () => {
  let uuid = "";

  for (let i = 0; i < 32; i++) {
    switch (i) {
      case 8:
      case 20: {
        uuid += `-${Math.trunc(Math.random() * 16).toString(16)}`;

        break;
      }
      case 12: {
        uuid += "-4";

        break;
      }
      case 16: {
        uuid += `-${((Math.random() * 16) | (0 & 3) | 8).toString(16)}`;

        break;
      }
      default: {
        uuid += Math.trunc(Math.random() * 16).toString(16);
      }
    }
  }

  return uuid;
};
