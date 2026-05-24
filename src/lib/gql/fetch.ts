/**
 * GraphQL Fetch Helper
 *
 * Typed helper for Server Component data fetching.
 * POSTs to the local GraphQL endpoint and returns typed data.
 */

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`
    : "http://localhost:3000/api/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against the local API.
 *
 * @param query  - GraphQL query string
 * @param variables - Optional query variables
 * @returns Typed response data
 * @throws Error if the query returns GraphQL errors or the fetch fails
 */
export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // Next.js fetch cache: opt out of deduplication for ISR compatibility
    next: { revalidate: false },
  });

  if (!res.ok) {
    throw new Error(
      `GraphQL fetch failed: ${res.status} ${res.statusText}`
    );
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors?.length) {
    const messages = json.errors.map((e) => e.message).join("; ");
    throw new Error(`GraphQL errors: ${messages}`);
  }

  if (!json.data) {
    throw new Error("GraphQL response contained no data");
  }

  return json.data;
}
