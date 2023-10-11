interface Env {
	DISCORD_APP_ID: string;
	DISCORD_APP_PUBLIC_KEY: string;
	DISCOED_APP_SECRET: string;
	DISCORD_APP_TOKEN: string;

	USERS: KVNamespace;
	DB: D1Database;
}
