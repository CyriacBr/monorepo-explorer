import { TreeItem } from "./treeItem";

export class SourceFileTreeItem extends TreeItem {
  isDir!: boolean;
  filePath!: string;
  solutionId!: string;
  contextValue = 'sourcefile';
}
