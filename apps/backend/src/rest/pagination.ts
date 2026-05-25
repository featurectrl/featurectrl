export type Paginated<T> = {
  items: T[];
  meta: { total: number };
};

export function paginated<T>(items: T[]): Paginated<T> {
  return { items, meta: { total: items.length } };
}
