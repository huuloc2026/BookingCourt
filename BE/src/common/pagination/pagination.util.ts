// common/pagination/pagination.util.ts
export async function paginate<T>(
  queryFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  page: number = 1,
  limit: number = 10,
) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    queryFn(skip, limit),
    countFn(),
  ]);

  return {
    data,
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}
