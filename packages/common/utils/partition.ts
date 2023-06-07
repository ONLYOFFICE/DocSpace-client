export default function partition<T>(
  array: T[],
  predicate: (arg: T, index: number, arr: T[]) => boolean
): [T[], T[]] {
  return array.reduce<[T[], T[]]>(
    ([pass, fail], elem, currentIndex, array) => {
      return predicate(elem, currentIndex, array)
        ? [[...pass, elem], fail]
        : [pass, [...fail, elem]];
    },
    [[], []]
  );
}
