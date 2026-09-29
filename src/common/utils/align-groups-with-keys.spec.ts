import { alignGroupsWithKeys } from './align-groups-with-keys.js';

interface Item {
  ownerId: string;
  value: number;
}

const ownerIdOf = (item: Item): string => item.ownerId;

describe('alignGroupsWithKeys', () => {
  it('puts the group of keys[i] at index i, whatever the order of the items', () => {
    const items: Item[] = [
      { ownerId: 'b', value: 1 },
      { ownerId: 'a', value: 2 },
    ];

    const groups = alignGroupsWithKeys(['a', 'b'], items, ownerIdOf);

    expect(groups).toEqual([
      [{ ownerId: 'a', value: 2 }],
      [{ ownerId: 'b', value: 1 }],
    ]);
  });

  it('keeps the original order of the items inside a group', () => {
    const items: Item[] = [
      { ownerId: 'a', value: 3 },
      { ownerId: 'b', value: 0 },
      { ownerId: 'a', value: 1 },
      { ownerId: 'a', value: 2 },
    ];

    const [groupOfA] = alignGroupsWithKeys(['a'], items, ownerIdOf);

    expect(groupOfA.map((item) => item.value)).toEqual([3, 1, 2]);
  });

  it('gives a key without items an empty group', () => {
    const items: Item[] = [{ ownerId: 'a', value: 1 }];

    const groups = alignGroupsWithKeys(['missing', 'a'], items, ownerIdOf);

    expect(groups).toEqual([[], [{ ownerId: 'a', value: 1 }]]);
  });

  it('drops the items whose key was not requested', () => {
    const items: Item[] = [{ ownerId: 'other', value: 1 }];

    const groups = alignGroupsWithKeys(['a'], items, ownerIdOf);

    expect(groups).toEqual([[]]);
  });

  it('returns one empty group per key when there are no items', () => {
    const groups = alignGroupsWithKeys(['a', 'b'], [], ownerIdOf);

    expect(groups).toEqual([[], []]);
  });
});
