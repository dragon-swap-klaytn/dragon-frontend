export default async function fetcher<T = any>(url: string): Promise<T & { fetchedAt: number }> {
  return fetch(url, { credentials: 'include' }).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).message);

    const json = await res.json();

    if (Array.isArray(json)) {
      return json;
    }

    return {
      fetchedAt: Date.now(),
      ...json,
    };
  });
}
