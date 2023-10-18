import deleteCommand from './deleteCommand';
import { getQuestion, addQuestion, deleteQuestion } from './question';
import { getCategories } from './category';
import registerCommands from './registerCommands';
import { search } from './search';

export {
	// question
	getQuestion,
	addQuestion,
	deleteQuestion,
	search,
	getCategories,
	// commands
	registerCommands,
	deleteCommand,
};
