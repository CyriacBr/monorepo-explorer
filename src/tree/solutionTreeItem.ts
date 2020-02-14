import { TreeItem } from "./treeItem";

export class SolutionTreeItem extends TreeItem {
  solutionPath!: string;
  solutionId!: string;
  contextValue = "solution";
}
