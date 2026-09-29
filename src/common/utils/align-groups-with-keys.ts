export function alignGroupsWithKeys<Item>(
  keys: string[],
  items: Item[],
  keyOf: (item: Item) => string,
): Item[][] {
  const itemsByKey = Map.groupBy(items, keyOf);
  return keys.map((key) => itemsByKey.get(key) ?? []);
}
