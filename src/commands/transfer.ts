import { DiscordMessage } from "../types";
import { updateGuildUserBalance } from "../utils/balance";
import { channelMessage } from "../utils/response";
import { serializeInput } from "../utils/serialize";
import { getBalanceState } from "../utils/states";

export const TransferConfig = {
	name: 'transfer',
	description: 'Transfer coins to another user',
	type: 1,
	options: [
		{
			name: 'user',
			description: 'The user to transfer coins to',
			type: 6, // USER
			required: true,
		},
		{
			name: 'amount',
			description: 'The amount of coins to transfer',
			type: 4, // INTEGER
			required: true,
		},
	],
};

export async function transfer(msg: DiscordMessage, env: Env, ctx: ExecutionContext) {

	const commandInput = serializeInput(TransferConfig, msg.data.options!);

	if (commandInput.user === msg.member?.user.id) {
		return channelMessage(`You can't transfer coins to yourself!`);
	}

	const senderState = await getBalanceState(env, msg.member?.user.id, msg.guild_id);
	const receiverState = await getBalanceState(env, commandInput.user as string, msg.guild_id);

	if (!senderState.user || !senderState.guild || !senderState.balance) {
		return channelMessage(`You have 0 :coin:. Please use \`/redeem\` to redeem your first :coin:!`);
	}

	if (!receiverState.user || !receiverState.guild || !receiverState.balance) {
		return channelMessage(`The user you are trying to transfer to has 0 :coin:. Please use \`/redeem\` to redeem your first :coin:!`);
	}

	const transferAmount = Number(commandInput.amount);

	if (senderState.balance.balance < transferAmount) {
		return channelMessage(`You don't have enough coins to transfer ${transferAmount.toLocaleString(senderState.guild.locale ?? "en-US")} :coin:!`);
	}

	if (transferAmount < 1) {
		return channelMessage(`You can't transfer less than 1 :coin:!`);
	}

	const [senderBalance, receiverBalance] = await Promise.all([
		updateGuildUserBalance(env, senderState.guild.id, senderState.user.id, -transferAmount),
		updateGuildUserBalance(env, receiverState.guild.id, receiverState.user.id, transferAmount),
	]);

	let output = `You have transferred ${transferAmount.toLocaleString(senderState.guild.locale ?? "en-US")} :coin: to <@!${commandInput.user}>!\n\n`;
	output += `**You now have ${senderBalance.balance.toLocaleString()} :coin:!**\n`;
	output += `**<@!${commandInput.user}> now has ${receiverBalance.balance.toLocaleString()} :coin:!**`;

	return channelMessage(output);
}
