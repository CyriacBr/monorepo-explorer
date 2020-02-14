import * as vscode from "vscode";

export class TreeItem extends vscode.TreeItem {
  public info?: string;

  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string | undefined {
    return this.info;
  }
}
