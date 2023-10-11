import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex, index, blob } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('discord_users', {
	id: integer('id').primaryKey(),
	username: text('username').notNull(),
	discriminator: text('discriminator').notNull(),
	global_name: text('global_name'),
});

export const userRelations = relations(user, ({ many }) => ({
	balances: many(balance),
	guilds: many(guild),
	challenges: many(challenge),
	interactions: many(interaction),
}));

export const guild = sqliteTable('discord_guilds', {
	id: integer('id').primaryKey(),
	locale: text('locale'),
}, (guilds) => {
	return {
		guildsIdIndex: uniqueIndex('guilds_idx').on(guilds.id),
	}
});

export const guildRelations = relations(guild, ({ many }) => ({
	users: many(user),
	balances: many(balance),
	challenges: many(challenge),
	interactions: many(interaction),
}));

export const balance = sqliteTable('balances', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	guild_id: integer('guild_id').references(() => guild.id),
	user_id: integer('user_id').references(() => user.id),
	balance: integer('amount').notNull().default(0),
	last_monthly: integer('last_monthly', { mode: 'timestamp_ms'}),
	last_weekly: integer('last_weekly', { mode: 'timestamp_ms'}),
	last_daily: integer('last_daily', { mode: 'timestamp_ms'}),
	last_hourly: integer('last_hourly', { mode: 'timestamp_ms'}),
}, (balances) => {
	return {
		balancesGuildUserIndex: uniqueIndex('balances_user_idx').on(balances.guild_id, balances.user_id),
	}
});

export const balanceRelations = relations(balance, ({ one }) => ({
	guild: one(guild, {
		fields: [balance.guild_id],
		references: [guild.id]
	}),
	user: one(user, {
		fields: [balance.user_id],
		references: [user.id]
	}),
}));

export const interaction = sqliteTable('discord_interactions', {
	id: integer('id').primaryKey(),
	application_id: integer('application_id'),
	type: text('type'),
	version: text('version'),
	channel_id: integer('channel_id'),
	channel_name: text('channel_name'),
	nsfw: integer('nsfw', { mode: 'boolean' }).default(false),
	guild_id: integer('guild_id').references(() => guild.id),
	user_id: integer('user_id').references(() => user.id),
	data: blob('data', { mode: 'json' }),
	timestamp: integer("timestamp", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
}, (interactions) => {
	return {
		interactionsIdIndex: uniqueIndex('interactions_idx').on(interactions.id),
		interactionsGuildUserIndex: uniqueIndex('interactions_user_idx').on(interactions.guild_id, interactions.user_id),
	}
});

export const interactionRelations = relations(interaction, ({ one }) => ({
	guild: one(guild, {
		fields: [interaction.guild_id],
		references: [guild.id]
	}),
	user: one(user, {
		fields: [interaction.user_id],
		references: [user.id]
	}),
}));

export type ChallengeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';

export const challenge = sqliteTable('challenges', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	guild_id: integer('guild_id').references(() => guild.id),
	initiator_id: integer('initiator_id').references(() => user.id),
	challenger_id: integer('challenger_id').references(() => user.id),
	wager: integer('wager').notNull(),
	num_questions: integer('num_questions').notNull(),
	current_question: integer('current_question').default(0),
	category: integer('category').references(() => questionCategory.id),
	status: text('status').$type<ChallengeStatus>(),
	timestamp: integer("timestamp", { mode: "timestamp_ms" }).$defaultFn(() => new Date()),
}, (challenges) => {
	return {
		challengeStatusIndex: index('challenges_status_idx').on(challenges.status),
		challengeTimestampIndex: index('challenges_timestamp_idx').on(challenges.timestamp),
		challengesGuildInitiatorIndex: index('challenges_initiator_idx').on(challenges.guild_id, challenges.initiator_id),
		challengesGuildChallengerIndex: index('challenges_challenger_idx').on(challenges.guild_id, challenges.challenger_id),
		challengeGuildUsersIndex: index('challenges_user_idx').on(challenges.guild_id, challenges.initiator_id, challenges.challenger_id),
	}
});

export const challengeRelations = relations(challenge, ({ one }) => ({
	guild: one(guild, {
		fields: [challenge.guild_id],
		references: [guild.id]
	}),
	initiator: one(user, {
		fields: [challenge.initiator_id],
		references: [user.id]
	}),
	challenger: one(user, {
		fields: [challenge.challenger_id],
		references: [user.id]
	}),
}));

export const questionCategory = sqliteTable('question_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name'),
}, (categories) => {
	return {
		categoriesNameIndex: uniqueIndex('category_names_idx').on(categories.name),
	}
});

export const questionCategoryRelations = relations(questionCategory, ({ many }) => ({
	questions: many(question),
}));

export type QuestionType = 'multiple' | 'boolean';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export const question = sqliteTable('questions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	category_id: integer('category').references(() => questionCategory.id),
	type: text('type').$type<QuestionType>(),
	difficulty: text('difficulty').$type<QuestionDifficulty>(),
	question: text('question').notNull(),
}, (questions) => {
	return {
		categoryIndex: index('questions_category_idx').on(questions.category_id),
		questionIndex: uniqueIndex('questions_question_idx').on(questions.question),
	}
});

export const questionRelations = relations(question, ({ one, many }) => ({
	answers: many(answer),
	category: one(questionCategory, {
		fields: [question.category_id],
		references: [questionCategory.id]
	}),
}));

export const answer = sqliteTable('answers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	question_id: integer('question_id').references(() => question.id),
	answer: text('answer').notNull(),
	correct: integer('correct', { mode: 'boolean' }).default(false),
}, (answers) => {
	return {
		questionIdIndex: index('answers_question_idx').on(answers.question_id),
	}
});

export const answerRelations = relations(answer, ({ one }) => ({
	question: one(question, {
		fields: [answer.question_id],
		references: [question.id]
	}),
}));

export const question_log = sqliteTable('question_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	challenge_id: integer('challenge_id').references(() => challenge.id),
	guild_id: integer('guild_id').references(() => guild.id),
	user_id: integer('user_id').references(() => user.id),
	question_id: integer('question_id').references(() => question.id),
	answer_id: integer('answer_id').references(() => answer.id),
	correct: integer('correct', { mode: 'boolean' }).default(false),
	question_number: integer('question_number'),
}, (question_logs) => {
	return {
		questionLogsGuildUserIndex: uniqueIndex('question_logs_user_idx').on(question_logs.guild_id, question_logs.user_id),
	}
});

export const questionLogRelations = relations(question_log, ({ one }) => ({
	challenge: one(challenge, {
		fields: [question_log.challenge_id],
		references: [challenge.id]
	}),
	guild: one(guild, {
		fields: [question_log.guild_id],
		references: [guild.id]
	}),
	user: one(user, {
		fields: [question_log.user_id],
		references: [user.id]
	}),
	question: one(question, {
		fields: [question_log.question_id],
		references: [question.id]
	}),
	answer: one(answer_log, {
		fields: [question_log.answer_id],
		references: [answer_log.id]
	}),
}));

export const answer_log = sqliteTable('answer_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	challenge_id: integer('challenge_id').references(() => challenge.id),
	guild_id: integer('guild_id').references(() => guild.id),
	user_id: integer('user_id').references(() => user.id),
	question_id: integer('question_id').references(() => question.id),
	question_number: integer('question_number'),
	answer_id: integer('answer_id').references(() => answer.id),
	correct: integer('correct', { mode: 'boolean' }).default(false),
});

export const answerLogRelations = relations(answer_log, ({ one }) => ({
	challenge: one(challenge, {
		fields: [answer_log.challenge_id],
		references: [challenge.id]
	}),
	guild: one(guild, {
		fields: [answer_log.guild_id],
		references: [guild.id]
	}),
	user: one(user, {
		fields: [answer_log.user_id],
		references: [user.id]
	}),
	question: one(question, {
		fields: [answer_log.question_id],
		references: [question.id]
	}),
	answer: one(answer, {
		fields: [answer_log.answer_id],
		references: [answer.id]
	}),
}));
