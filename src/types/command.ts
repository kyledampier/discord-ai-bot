export enum CommandType {
	CHAT_INPUT = 1,
	USER = 2,
	MESSAGE = 3,
}

export type CommandOption = {
	name: string;
	description: string;
	type: number;
	required?: boolean;
	choices?: {
		name: string;
		value?: string | number;
	}[];
	value?: string | number;
};

export type CommandConfig = {
	name: string;
	description: string;
	type: CommandType;
	options?: CommandOption[];
	component_type?: number;
	custom_id?: string;
};
