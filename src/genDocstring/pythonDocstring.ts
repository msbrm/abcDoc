import * as vscode from 'vscode';
import Parser from 'tree-sitter';

export function pythonGenerateClassDocstring(ws: string, indentation: string, clsNode: Parser.SyntaxNode): vscode.SnippetString {
    const wsIindentation = ws + indentation;
    const details = extractClassDetails(clsNode);

    let insertText = new vscode.SnippetString();
    insertText.appendText(`${wsIindentation}"""`);
    insertText.appendPlaceholder(details.name);
    insertText.appendText(`\n\n${wsIindentation}`);
    insertText.appendPlaceholder(`description`);
    insertText.appendText(`\n`);

    if (details.attributes.length > 0) {
        insertText.appendText(`\n${wsIindentation}Attributes\n${wsIindentation}----------\n`);
        details.attributes.forEach((attr: any) => {
            insertText.appendText(`${wsIindentation}${attr.name} : `);
            if (attr.type) {
                insertText.appendText(attr.type);
            } else {
                insertText.appendPlaceholder(`type of ${attr.name}`);
            }
            insertText.appendText(`\n${wsIindentation}${indentation}`);
            insertText.appendPlaceholder(`description of ${attr.name}`);
            insertText.appendText(`\n`);
        });
    }

    if (details.methods.length > 0) {
        for (const constructorMethod of details.methods) {
            if (constructorMethod.name === '__init__' && constructorMethod.parametersList.length > 0) {
                insertText.appendText(`\n${wsIindentation}Constructor Parameters\n${wsIindentation}----------------------\n`);
                constructorMethod.parametersList.forEach((element: any) => {
                    insertText.appendText(`${wsIindentation}${element.name} : `);
                    if (element.type) {
                        insertText.appendText(element.type);
                    } else {
                        insertText.appendPlaceholder(`type of ${element.name}`);
                    }
                    insertText.appendText(`\n${wsIindentation}${indentation}`);
                    insertText.appendPlaceholder(`description of ${element.name}`);
                    insertText.appendText(`\n`);
                });
                break;
            }
        }
    }

    insertText.appendText(`\n${wsIindentation}"""\n`);

    return insertText;
}

export function pythonGenerateDefDocstring(ws: string, indentation: string, funcNode: Parser.SyntaxNode): vscode.SnippetString {
    const wsIindentation = ws + indentation;
    const details = extractMethodDetails(funcNode);

    let insertText = new vscode.SnippetString();
    insertText.appendText(`${wsIindentation}"""`);
    insertText.appendPlaceholder(details.name);
    insertText.appendText(`\n\n${wsIindentation}`);
    insertText.appendPlaceholder('description');
    insertText.appendText(`\n`);

    if (details.parametersList.length > 0) {
        insertText.appendText(`\n${wsIindentation}Parameters\n${wsIindentation}----------\n`);
        details.parametersList.forEach((element: any) => {
            insertText.appendText(`${wsIindentation}${element.name} : `);
            if (element.type) {
                insertText.appendText(element.type);
            } else {
                insertText.appendPlaceholder(`type of ${element.name}`);
            }
            insertText.appendText(`\n${wsIindentation}${indentation}`);
            insertText.appendPlaceholder(`description of ${element.name}`);
            insertText.appendText(`\n`);
        });
    }

    insertText.appendText(`\n${wsIindentation}Returns\n${wsIindentation}-------\n`);
    if (details.returnType) {
        insertText.appendText(`${wsIindentation}${details.returnType}`);
    } else {
        insertText.appendText(`${wsIindentation}`);
        insertText.appendPlaceholder('None');
    }
    insertText.appendText(`\n${wsIindentation}${indentation}`);
    insertText.appendPlaceholder('description of return');

    insertText.appendText(`\n\n${wsIindentation}"""\n`);

    return insertText;
}

function extractClassDetails(clsNode: Parser.SyntaxNode): any {
    const details: any = {};

    const nameNode = clsNode.childForFieldName('name');
    details.name = nameNode ? nameNode.text : '';

    details.methods = [];
    details.attributes = [];
    const bodyNode = clsNode.childForFieldName('body');
    if (bodyNode) {
        bodyNode.namedChildren.forEach((child: Parser.SyntaxNode) => {
            if (child.type === 'function_definition') {
                details.methods.push(extractMethodDetails(child));
            } else if (child.type === 'expression_statement') {
                const exprNode = child.firstChild;
                if (exprNode && exprNode.type === 'assignment') {
                    const nameNode = exprNode.childForFieldName('left');
                    const typeNode = exprNode.childForFieldName('type');
                    details.attributes.push({
                        name: nameNode ? nameNode.text : '',
                        type: typeNode ? typeNode.text : ''
                    });
                }
            }
        });
    }

    return details;
}

function extractMethodDetails(funcNode: Parser.SyntaxNode): any {
    const details: any = {};

    const nameNode = funcNode.childForFieldName('name');
    details.name = nameNode ? nameNode.text : '';

    const paramsNode = funcNode.childForFieldName('parameters');
    details.parametersList = [];
    if (paramsNode) {
        paramsNode.namedChildren.forEach((paramNode: Parser.SyntaxNode) => {
            if (paramNode.text.trim() !== 'self') {
                let paramName;
                let paramType;
                if (paramNode.type === 'identifier') {
                    paramName = paramNode.text;
                } else if (paramNode.type === 'typed_parameter') {
                    paramName = paramNode.firstChild?.text;
                    paramType = paramNode.lastChild?.text;
                }
                details.parametersList.push({
                    name: paramName,
                    type: paramType
                });
            }
        });
    }

    const returnNode = funcNode.childForFieldName('return_type');
    details.returnType = returnNode ? returnNode.text : '';

    return details;
}
