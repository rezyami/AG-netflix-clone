import NextAuth, { NextAuthOptions } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }

    interface JWT {
        accessToken?: string;
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        {
            id: "trakt",
            name: "Trakt",
            type: "oauth",
            authorization: {
                url: "https://trakt.tv/oauth/authorize",
                params: {
                    scope: "",
                },
            },
            token: "https://api.trakt.tv/oauth/token",
            userinfo: {
                url: "https://api.trakt.tv/users/settings",
                async request(context) {
                    const response = await fetch("https://api.trakt.tv/users/settings", {
                        headers: {
                            Authorization: `Bearer ${context.tokens.access_token}`,
                            "Content-Type": "application/json",
                            "trakt-api-version": "2",
                            "trakt-api-key": process.env.TRAKT_ID || "",
                        },
                    });
                    return await response.json();
                },
            },
            clientId: process.env.TRAKT_ID,
            clientSecret: process.env.TRAKT_SECRET,
            profile(profile) {
                return {
                    id: profile.user.ids.slug,
                    name: profile.user.username,
                    email: null,
                    image: profile.user.images?.avatar?.full || null,
                };
            },
        },
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Persist the OAuth access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            session.accessToken = token.accessToken as string;
            if (token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
