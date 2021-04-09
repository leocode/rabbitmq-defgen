import * as fs from 'fs';
import * as ts from 'typescript';

const sourceFile = ts.createSourceFile('', fs.readFileSync('/home/leocode/Advisero/advisero-saas-api/src/connectors/connectors-modules/gmail/model/events/GmailOutgoingMessageAdded.ts', 'utf-8'), ts.ScriptTarget.ES2020);

ts.forEachChild(sourceFile, node => {
  if (ts.isClassDeclaration(node)) {
    console.log((node.heritageClauses?.[0].types?.[0].expression as any).escapedText); // 'DomainEvent'
    console.log((node.members[0].name as any)?.escapedText); // 'type'
    console.log((node.members[0] as any).initializer.text); // 'contact-center.GmailOutgoingMessageAdded'
    }
});