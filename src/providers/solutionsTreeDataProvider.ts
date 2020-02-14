import * as vscode from "vscode";
import { posix } from "path";
import { SettingsService } from "../services/settingsService";
import { capitalize } from "../utils";
import { TreeItem } from "../tree/treeItem";
import { GroupSolutionTreeItem } from "../tree/groupSolutionTreeItem";
import { SolutionTreeItem } from "../tree/solutionTreeItem";
import { SourceFileTreeItem } from "../tree/sourceFileTreeItem";

export class SolutionsTreeDataProvider
  implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined
  > = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this
    ._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(element?: TreeItem | undefined): Promise<TreeItem[]> {
    // GroupSolutionTreeItem = 'Solutions' or 'Artifacts' for example
    if (element && element instanceof GroupSolutionTreeItem) {
      const items: SolutionTreeItem[] = [];
      for (const [key, path] of Object.entries(element.data)) {
        const item = new SolutionTreeItem(
          key,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        item.solutionPath = path;
        item.solutionId = key;
        items.push(item);
      }
      return items;
    }

    // SolutionTreeItem = folder at the root of packages (or used defined value)
    if (element && element instanceof SolutionTreeItem) {
      const path = element.solutionPath;
      const root = vscode.workspace?.workspaceFolders?.[0];
      if (!root) return [];
      const filePath = posix.join(root.uri.path as string, path);
      const fileUri = root.uri.with({ path: filePath });
      return this.makeSourceFileItems(element.solutionId, fileUri)
    }

    // source file instead a solution
    if (element && element instanceof SourceFileTreeItem) {
      if (!element.isDir) return [];
      return this.makeSourceFileItems(element.solutionId, element.resourceUri as vscode.Uri);
    }

    if (!element) {
      const groups: GroupSolutionTreeItem[] = [];

      const settings = await SettingsService.get();
      for (const [key, data] of Object.entries(settings)) {
        const command: vscode.Command = {
          command: "monorepoman.groupsolution.toggle",
          title: "Toggle"
        };
        let group: GroupSolutionTreeItem;
        if (key === "default") {
          group = new GroupSolutionTreeItem(
            "Solutions",
            vscode.TreeItemCollapsibleState.Expanded
          );
        } else {
          group = new GroupSolutionTreeItem(
            capitalize(key),
            vscode.TreeItemCollapsibleState.Expanded
          );
        }
        group.data = data;
        groups.push(group);
      }

      return groups;
    }

    return [];
  }

  async makeSourceFileItems(solutionId: string, folderUri: vscode.Uri) {
    try {
      const metadata = await vscode.workspace.fs.stat(folderUri);
      if (metadata.type !== vscode.FileType.Directory) throw new Error();
    } catch (error) {
      vscode.window.showErrorMessage(
        `"${folderUri.path}" doesn't exist or is not a directory`
      );
      throw vscode.FileSystemError.FileNotFound(folderUri);
    }

    const root = vscode.workspace?.workspaceFolders?.[0];
    const files = await vscode.workspace.fs.readDirectory(folderUri);
    const items: SourceFileTreeItem[] = [];
    for (const [name, file] of files) {
      const isDir = file === vscode.FileType.Directory;
      const item = new SourceFileTreeItem(name, isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
      item.resourceUri = root?.uri.with({ path: posix.join(folderUri.path, name) });
      item.isDir = isDir;
      item.solutionId = solutionId;
      item.command = {
        command: 'monorepoman.sourcefile.open',
        title: 'Open',
        arguments: [item]
      };
      items.push(item);
    }
    return items;
  }
}
