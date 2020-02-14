import { TreeItem } from "./treeItem";

export class GroupSolutionTreeItem extends TreeItem {
  data!: Record<string, string>;
  contextValue = "groupsolution";
}
