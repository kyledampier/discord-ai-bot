import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex, blob } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('discord_users', {
	id: integer('id').primaryKey(),
	username: text('username'),
	global_name: text('global_name'),
	public_flags: text('public_flags'),
	avatar: text('avatar'),
	discriminator: text('discriminator'),
}, (users) => {
	return {
		usersIdIndex: uniqueIndex('users_idx').on(users.id),
	}
});

export const guild = sqliteTable('discord_guilds', {
	id: integer('id').primaryKey(),
	locale: text('locale'),
}, (guilds) => {
	return {
		guildsIdIndex: uniqueIndex('guilds_idx').on(guilds.id),
	}
});

export const balance = sqliteTable('user_balances', {
	id: integer('id').primaryKey(),
	user_id: text('user_id').references(() => user.id),
	guild_id: text('guild_id').references(() => guild.id),
	balance: integer('balance').notNull().default(0),
}, (balances) => {
	return {
		balancesIdIndex: uniqueIndex('balances_idx').on(balances.id),
	}
});

export const channel = sqliteTable('discord_channels', {
	id: integer('id').primaryKey(),
	name: text('name'),
	type: text('type'),
	nsfw: integer('nsfw', { mode: 'boolean' }).default(false),
	guild_id: text('guild_id').references(() => guild.id),
}, (channels) => {
	return {
		channelsIdIndex: uniqueIndex('channels_idx').on(channels.id),
	}
});

export const interaction = sqliteTable('discord_interactions', {
	id: text('id').primaryKey(),
	application_id: text('application_id'),
	type: text('type'),
	version: text('version'),
	channel_id: text('channel_id').references(() => channel.id),
	guild_id: text('guild_id').references(() => guild.id),
	user_id: text('user_id').references(() => user.id),
	data: blob('data', { mode: 'json' }),
}, (interactions) => {
	return {
		interactionsIdIndex: uniqueIndex('interactions_idx').on(interactions.id),
	}
});

export const challenge = sqliteTable('challenges', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	initiator_id: text('initiator_id').references(() => user.id),
	challenger_id: text('challenger_id').references(() => user.id),
	wager: integer('wager').notNull(),
	num_questions: integer('num_questions').notNull(),
	category: text('category'),
	created_at: integer('created_at', { mode: 'timestamp' }).default(sql`datetime('now')`),
}, (challenges) => {
	return {
		challengesIdIndex: uniqueIndex('challenges_idx').on(challenges.id),
	}
});

export const question = sqliteTable('questions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	category: text('category'),
	type: text('type'),
	difficulty: text('difficulty'),
	question: text('question'),
	correct_answer: text('correct_answer'),
	incorrect_answers: text('incorrect_answers', { mode: 'json' }),
}, (questions) => {
	return {
		questionsIdIndex: uniqueIndex('questions_idx').on(questions.id),
	}
});
