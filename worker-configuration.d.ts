interface Env {
	DISCORD_APP_ID: string;
	DISCORD_APP_PUBLIC_KEY: string;
	DISCOED_APP_SECRET: string;
	DISCORD_APP_TOKEN: string;
	OPENAI_API_SECRET: string;

	STATES: KVNamespace;
	DB: D1Database;
	FILES: R2Bucket;
}
