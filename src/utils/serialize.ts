import { CommandConfig } from "../types";
import { CommandOption } from "../types/command";

export function serializeInput(command: CommandConfig, options: CommandOption[]) {
	const input = options.reduce((acc, opt) => {
		const option = command.options?.find((cmdOpt) => cmdOpt.name === opt.name);
		if (!option) {
			return acc;
		}

		if (option.type === 3) {
			acc[opt.name] = opt.value;
		} else {
			acc[opt.name] = opt.value;
		}

		return acc;
	}, {} as Record<string, string | number | undefined>);

	return input;
}
