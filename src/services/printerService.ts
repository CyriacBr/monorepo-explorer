import * as ts from "typescript";

// TODO: use executeCommand vscode.executeFormatDocumentProvider
export class PrinterService {
  static print(content: string) {
    const printer: ts.Printer = ts.createPrinter();
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      "foo.ts",
      content,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.JSON
    );
    return printer.printFile(sourceFile);
  }
}
