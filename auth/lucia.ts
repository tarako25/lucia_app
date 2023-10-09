import { lucia } from "lucia";
import { nextjs } from "lucia/middleware";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const auth = lucia({
	adapter: prisma(client, {
		user: "user",// model User {}
		key: "key", // model Key {}
		session: "session" // model Session {}
	}),
	env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
	middleware: nextjs(),
	sessionCookie: {
		expires: false
	},
	getUserAttributes: (data) => {
		return {
			//よく分からん
			username: data.username,
			delete_flg: data.delete_flg
		};
	}
});


export type Auth = typeof auth;

export const getPageSession = cache(() => {
	const authRequest = auth.handleRequest({
		request: null,
		cookies
	});
	return authRequest.validate();
});
