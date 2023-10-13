import { DiscordMessage } from "../types";
import { componentACK } from "../utils/response";

type AnswerChoice = {
	challenge_id: number;
	current_question: number;
	question_id: number;
	answer_id: number;
}

function serializeAnswerChoice(custom_id?: string): AnswerChoice {
	if (!custom_id) {
		throw new Error('Invalid custom_id');
	}

	const [_, challenge_id, current_question, question_id, answer_id] = custom_id.split('-');
	return {
		challenge_id: Number.parseInt(challenge_id),
		current_question: Number.parseInt(current_question),
		question_id: Number.parseInt(question_id),
		answer_id: Number.parseInt(answer_id),
	};
}

export async function challengeAnswer(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {
	console.log(msg);

	return componentACK();
}
