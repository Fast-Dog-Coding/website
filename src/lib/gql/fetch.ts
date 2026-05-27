/**
 * GraphQL Fetch Helper
 *
 * Executes queries in-process against the app's schema and resolvers.
 * Server Components use this instead of HTTP so `next build` can prerender
 * without a running dev server or public site URL.
 */

import { graphql } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";

let schema: ReturnType<typeof makeExecutableSchema> | undefined;

function getSchema() {
  if (!schema) {
    schema = makeExecutableSchema({ typeDefs, resolvers });
  }
  return schema;
}

/**
 * Execute a GraphQL query from a Server Component.
 *
 * @param query  - GraphQL query string
 * @param variables - Optional query variables
 * @returns Typed response data
 * @throws Error if the query returns GraphQL errors
 */
export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const result = await graphql({
    schema: getSchema(),
    source: query,
    variableValues: variables,
  });

  if (result.errors?.length) {
    const messages = result.errors.map((e) => e.message).join("; ");
    throw new Error(`GraphQL errors: ${messages}`);
  }

  if (!result.data) {
    throw new Error("GraphQL response contained no data");
  }

  // Match JSON over HTTP: plain objects safe for Client Component props.
  return JSON.parse(JSON.stringify(result.data)) as T;
}
