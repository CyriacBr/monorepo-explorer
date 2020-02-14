import { Uri, commands, ViewColumn } from "vscode";
import { SavedEditor } from "./savedEditor";
import { SourceFileTreeItem } from "../../tree/sourceFileTreeItem";

export class SolutionsStoreService {
  static editors: Record<string, SavedEditor[]> = {};
  static currentFiles: Uri[];
  static currentSolutionId!: string;

  static async onSolutionFileOpen(item: SourceFileTreeItem) {
    const { resourceUri: uri, solutionId: id } = item;
    if (!uri) return;
    if (item.isDir) return;
    try {
      const editor = new SavedEditor(uri.path, ViewColumn.Active);

      if (this.currentSolutionId === id) {
        editor.open({ preview: false });
        return;
      }
      this.currentSolutionId = id;
      
      await commands.executeCommand("workbench.action.closeAllEditors");
      for (const editor of this.editors[id] || []) {
        await editor.open({ preview: false });
      }

      const existingEditor = (this.editors[id] || []).find(
        val => val.uri.path === uri.path
      );
      if (!existingEditor) {
        this.editors[id] = [...(this.editors[id] || []), editor];
      }
      editor.open({ preview: false });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
