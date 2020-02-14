import * as vscode from "vscode";
import * as ts from "typescript";
import { posix } from "path";
import { PrinterService } from "./printerService";

export type Settings = {
  default: Record<string, string>;
  [key: string]: Record<string, string>;
};

export class SettingsService {
  static async init() {
    const { workspaceFolders } = vscode.workspace;
    if (!workspaceFolders || workspaceFolders?.length === 0) {
      vscode.window.showErrorMessage("You need to open a worspace (folder)");
      throw new Error("No workspace found");
    }
    const rootUri = workspaceFolders[0].uri;
    const dotVscodeUri = rootUri.with({
      path: posix.join(rootUri.path, "/.vscode")
    });
    const configUri = rootUri.with({
      path: posix.join(rootUri.path, "/.vscode/solutions.json")
    });

    try {
      // Check if the .vscode folder exists
      await vscode.workspace.fs.stat(dotVscodeUri);
    } catch (error) {
      // If not, create it
      await vscode.workspace.fs.createDirectory(dotVscodeUri);
    }
    try {
      // Check if config file exists
      await vscode.workspace.fs.stat(configUri);
      vscode.window.showInformationMessage("config file already exist");
    } catch (error) {
      // If not, initialize it with default config
      const config = await this.defaultSettings();
      const writeData = Buffer.from(
        PrinterService.print(JSON.stringify(config)),
        "utf8"
      );
      await vscode.workspace.fs.writeFile(configUri, writeData);
    }
    const doc = await vscode.workspace.openTextDocument(configUri);
    vscode.window.showTextDocument(doc, {
      viewColumn: vscode.ViewColumn.Beside
    });
  }

  static async get(): Promise<Settings> {
    const { workspaceFolders } = vscode.workspace;
    if (!workspaceFolders || workspaceFolders?.length === 0) {
      vscode.window.showErrorMessage("You need to open a worspace (folder)");
      throw new Error("No workspace found");
    }
    const rootUri = workspaceFolders[0].uri;
    const configUri = rootUri.with({
      path: posix.join(rootUri.path, "/.vscode/solutions.json")
    });

    try {
      await vscode.workspace.fs.stat(configUri);
      const readData = await vscode.workspace.fs.readFile(configUri);
      const readStr = Buffer.from(readData).toString("utf8");
      return JSON.parse(readStr);
    } catch (error) {
      console.error(error);
      throw vscode.FileSystemError.FileNotFound(configUri);
    }
  }

  static async defaultSettings(): Promise<Settings> {
    const packages: Record<string, string> = {};
    const { workspaceFolders } = vscode.workspace;
    if (workspaceFolders) {
      const root = workspaceFolders[0];
      const packagesUri = vscode.Uri.file(
        posix.join(root.uri.path, "/packages")
      );
      try {
        await vscode.workspace.fs.stat(packagesUri);
        const files = await vscode.workspace.fs.readDirectory(packagesUri);
        for (const [name, file] of files) {
          if (file === vscode.FileType.Directory) {
            packages[name] = "./packages/" + name;
          }
        }
      } catch (error) {
        // <root>/packages doesn't exist
      }
    }
    return {
      default: packages
    };
  }
}
