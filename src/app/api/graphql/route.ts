/**
 * GraphQL API Route Handler
 *
 * Apollo Server 4 integrated as a Next.js 16 route handler.
 * Exports GET and POST for the /api/graphql endpoint.
 *
 * Note: @as-integrations/next's handler has a legacy NextApiRequest overload
 * that doesn't satisfy Next.js 16's strict route handler type. We wrap the
 * handler to match the expected (req: Request) => Promise<Response> signature.
 */

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Explicitly enable introspection for Apollo Sandbox in development only.
  // In production, this is disabled for security.
  introspection: process.env.NODE_ENV !== "production",
  formatError: (formattedError) => {
    // Log the full error server-side for debugging
    console.error("[GraphQL Error]", formattedError);

    // In production, strip internal details from client-facing errors
    if (process.env.NODE_ENV === "production") {
      return {
        message: formattedError.message,
        locations: formattedError.locations,
        path: formattedError.path,
      };
    }

    return formattedError;
  },
});

const handler = startServerAndCreateNextHandler(server);

// Wrap to satisfy Next.js 16 route handler signature:
//   (req: NextRequest, ctx: { params: Promise<{}> }) => Promise<Response>
export async function GET(req: NextRequest) {
  return handler(req) as Promise<Response>;
}

export async function POST(req: NextRequest) {
  return handler(req) as Promise<Response>;
}
