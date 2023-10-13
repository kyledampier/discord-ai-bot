export type DiscordEmbed = {
	color?: number,
	title: string,
	url?: string,
	description?: string,
	author?: {
		name: string,
		url?: string,
		icon_url?: string,
	},
	thumbnail?: {
		url?: string,
	},
	fields?: {
		name: string,
		value: string,
		inline?: boolean,
	}[],
	image?: {
		url?: string,
	},
	footer?: {
		text: string,
		icon_url?: string,
	},
}
