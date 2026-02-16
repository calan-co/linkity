import * as vscode from 'vscode';
import { ConfigManager } from './utils/ConfigManager';
import { WorkspaceScanner } from './services/WorkspaceScanner';
import { FilenameResolver } from './services/FilenameResolver';
import { BacklinksIndex } from './services/BacklinksIndex';
import { ReferenceGenerator } from './services/ReferenceGenerator';
import { GraphBuilder } from './services/GraphBuilder';
import { WikilinkDocumentLinkProvider } from './providers/LinkProvider';
import { WikilinkHoverProvider } from './providers/HoverProvider';
import { WikilinkDefinitionProvider } from './providers/DefinitionProvider';
import { WikilinkCompletionProvider } from './providers/CompletionProvider';
import { BacklinksTreeDataProvider } from './providers/BacklinksProvider';
import { GraphPanel } from './webviews/GraphPanel';

let scanner: WorkspaceScanner;
let resolver: FilenameResolver;
let backlinksIndex: BacklinksIndex;
let referenceGenerator: ReferenceGenerator;
let graphBuilder: GraphBuilder;

export async function activate(context: vscode.ExtensionContext) {
  console.log('Activating Wikilinks extension...');
  
  const startTime = Date.now();
  
  // Initialize configuration
  const config = new ConfigManager();
  
  if (!config.isEnabled()) {
    console.log('Wikilinks extension is disabled in settings');
    return;
  }
  
  // Initialize core services
  scanner = new WorkspaceScanner(config);
  resolver = new FilenameResolver(scanner, config);
  backlinksIndex = new BacklinksIndex(scanner, resolver);
  referenceGenerator = new ReferenceGenerator(resolver);
  graphBuilder = new GraphBuilder(backlinksIndex, scanner);
  
  // Scan workspace on activation
  await scanner.scanWorkspace();
  await backlinksIndex.buildIndex();
  
  // Register providers
  const selector: vscode.DocumentSelector = { scheme: 'file', language: 'markdown' };
  
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      selector,
      new WikilinkDocumentLinkProvider(resolver, config)
    )
  );
  
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      selector,
      new WikilinkHoverProvider(resolver, config)
    )
  );
  
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      selector,
      new WikilinkDefinitionProvider(resolver, config)
    )
  );
  
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new WikilinkCompletionProvider(scanner, config),
      '[' // Trigger character
    )
  );
  
  // Register backlinks tree view
  if (config.get<boolean>('enableBacklinks', true)) {
    const backlinksProvider = new BacklinksTreeDataProvider(backlinksIndex);
    const treeView = vscode.window.createTreeView('wikilinks.backlinks', {
      treeDataProvider: backlinksProvider
    });
    context.subscriptions.push(treeView);
    
    // Refresh backlinks when active editor changes
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(() => {
        backlinksProvider.refresh();
      })
    );
  }
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('wikilinks.generateReferences', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'markdown') {
        await referenceGenerator.generateForDocument(editor.document);
      }
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('wikilinks.rebuildIndex', async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Rebuilding wikilinks index...',
          cancellable: false
        },
        async () => {
          await scanner.scanWorkspace();
          await backlinksIndex.buildIndex();
        }
      );
      vscode.window.showInformationMessage('Wikilinks index rebuilt successfully');
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('wikilinks.showBacklinks', () => {
      vscode.commands.executeCommand('wikilinks.backlinks.focus');
    })
  );

  // Register graph visualization command
  if (config.get<boolean>('enableGraph', true)) {
    context.subscriptions.push(
      vscode.commands.registerCommand('wikilinks.showGraph', () => {
        GraphPanel.createOrShow(context.extensionUri, backlinksIndex, scanner);
      })
    );
  }
  
  // Auto-generate references on save if enabled
  if (config.get<boolean>('autoGenerateReferences', false)) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.languageId === 'markdown') {
          await referenceGenerator.generateForDocument(document);
        }
      })
    );
  }
  
  const activationTime = Date.now() - startTime;
  console.log(`Wikilinks extension activated in ${activationTime}ms`);
  
  // Show activation message (optional, can be disabled)
  if (config.get<boolean>('showActivationMessage', false)) {
    vscode.window.showInformationMessage('Wikilinks extension activated');
  }
}

export function deactivate() {
  console.log('Deactivating Wikilinks extension');
}
