export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function adminApi<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok)
    throw new AdminApiError(
      [
        data.error,
        ...(data.details || []).map(
          (d: { field: string; message: string }) => `${d.field}: ${d.message}`,
        ),
      ].join(". "),
      response.status,
    );
  return data as T;
}
