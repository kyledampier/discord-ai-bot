import { MessageComponentTypes } from "discord-interactions"

export enum DiscordButtonStyle {
	PRIMARY = 1, // Blurple
	SECONDARY = 2, // Gray
	SUCCESS = 3, // Green
	DANGER = 4, // Red
	LINK = 5,
};

export type DiscordButtonComponent = {
	type: number,
	style: DiscordButtonStyle,
	label?: string,
	custom_id?: string,
	emoji?: any,
	url?: string,
	disabled?: boolean,
};

export type DiscordComponent = {
	type: MessageComponentTypes,
	components: DiscordButtonComponent[],
};
