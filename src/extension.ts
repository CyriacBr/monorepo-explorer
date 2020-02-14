
import * as vscode from 'vscode';
import { posix } from 'path';
import { SettingsService } from './services/settingsService';
import { SolutionsTreeDataProvider } from './providers/solutionsTreeDataProvider';
import { SourceFileTreeItem } from './tree/sourceFileTreeItem';
import { SolutionsStoreService } from './services/SolutionsStoreService/SolutionsStoreService';

export function activate(context: vscode.ExtensionContext) {
	const provider = new SolutionsTreeDataProvider();
	vscode.window.registerTreeDataProvider('monorepo-explorer-nodes2', provider);
	
	vscode.commands.registerCommand('monorepoman.sourcefile.open', (item: SourceFileTreeItem) => {
		console.log('SOURCE FILE OPEN');
		return SolutionsStoreService.onSolutionFileOpen(item);
	});
	
	vscode.commands.registerCommand('monorepoman.sourcefile.delete', (item: SourceFileTreeItem) => {
		console.log('SOURCE FILE DELETE');
		console.log('item :', item);
	});

	let disposable = vscode.commands.registerCommand('extension.monorepoman.init', () => {
		SettingsService.init()
		.catch((err) => {
			throw err;
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
