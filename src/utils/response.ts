import { InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { Answer, Challenge, FullQuestion } from "./db";
import { shuffleArray } from "./shuffleArray";
import { DiscordEmbed } from "../types/DiscordEmbed";
import { DiscordButtonStyle, DiscordComponent } from "../types/DiscordComponents";

export function channelMessage(content: string) {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

export function channelMessageWithComponents(data: { content?: string, components: DiscordComponent[], embeds?: DiscordEmbed[] }) {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data,
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

export function channelMessageWithQuestion(question: FullQuestion, answers: Answer[], challenge: Challenge) {
	const answerChoices = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]; // max 12 answers (really only 5)

	const embedQuestion: DiscordEmbed = {
		color: 0x5865F2,
		title: `Question ${challenge.current_question ?? 0 + 1} of ${challenge.num_questions}`,
		fields: [
			{ name: 'Category', value: (question.category?.name ?? "General Knowledge"), inline: true },
			{ name: 'Difficulty', value: (question.difficulty ?? "medium") as string, inline: true },
		],
		description: `${question.question}\n\n${answers.map((a, i) => `\t${answerChoices[i]}. ${a.correct ? ':white_check_mark:' : ':x:'} ${a.answer}`).join('\n')}\n
:white_large_square: <@!${challenge.initiator_id}>\n:white_large_square: <@!${challenge.challenger_id}>`,
		footer: {
			text: `This challenge is for ${challenge.wager.toLocaleString()} coins.`,
		},
	}
		const components = answers.map((a, i) => ({
			type: MessageComponentTypes.BUTTON,
			label: answerChoices[i],
			style: DiscordButtonStyle.SECONDARY,
			custom_id: `challenge_answer-${challenge.id}-${challenge.current_question}-${a.question_id}-${a.id}`,
		}));

	return channelMessageWithComponents({
		embeds: [embedQuestion],
		components: [
			{
				type: MessageComponentTypes.ACTION_ROW,
				components,
			},
		]
	});
}

export function updateMessage(data: any) {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.UPDATE_MESSAGE,
			data,
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

export function componentACK() {
	return new Response(JSON.stringify({
		type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
	}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export function errorResponse(message: string, status: number) {
	return new Response(
		JSON.stringify({
			error: message,
		}),
		{
			status,
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}

export function ACK() {
	return new Response(
		JSON.stringify({
			type: InteractionResponseType.PONG,
		}),
		{
			status: 200,
		}
	);
}
