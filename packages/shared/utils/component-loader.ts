export default function componentLoader(
  lazyComponent: Function,
  attemptsLeft: number = 3,
) {
  return new Promise((resolve, reject) => {
    lazyComponent()
      .then(resolve)
      .catch((error: unknown) => {
        // let us retry after 1500 ms
        setTimeout(() => {
          if (attemptsLeft === 1) {
            reject(error);
            return;
          }
          componentLoader(lazyComponent, attemptsLeft - 1).then(
            resolve,
            reject,
          );
        }, 1500);
      });
  });
}
