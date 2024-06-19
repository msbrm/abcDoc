import * as vscode from 'vscode';
import Parser from 'tree-sitter';

export function pythonGenerateClassDocstring(ws: string, indentation: string, clsNode: Parser.SyntaxNode): vscode.SnippetString {
    const wsIindentation = ws + indentation;
    console.log(`ws: |${ws}|, indentation: |${indentation}|, wsIindentation: |${wsIindentation}|`);
    const details = extractClassDetails(clsNode);

    let insertText = new vscode.SnippetString();
    insertText.appendText(`${ws}"""`);
    insertText.appendPlaceholder(details.name);
    insertText.appendText(`\n\n`);
    insertText.appendPlaceholder(`${ws}description`);
    insertText.appendText(`\n`);

    if (details.attributes.length > 0) {
        insertText.appendText(`\n${ws}Attributes\n----------\n`);
        details.attributes.forEach((attr: any) => {
            insertText.appendText(`${ws}${attr.name} : `);
            if (attr.type) {
                insertText.appendText(attr.type);
            } else {
                insertText.appendPlaceholder(`type of ${attr.name}`);
            }
            insertText.appendText(`\n${indentation}`);
            insertText.appendPlaceholder(`description of ${attr.name}`);
            insertText.appendText(`\n`);
        });
    }

    if (details.methods.length > 0) {
        for (const constructorMethod of details.methods) {
            if (constructorMethod.name === '__init__' && constructorMethod.parametersList.length > 0) {
                insertText.appendText(`\n${ws}Constructor Parameters\n----------------------\n`);
                constructorMethod.parametersList.forEach((element: any) => {
                    insertText.appendText(`${ws}${element.name} : `);
                    if (element.type) {
                        insertText.appendText(element.type);
                    } else {
                        insertText.appendPlaceholder(`type of ${element.name}`);
                    }
                    insertText.appendText(`\n${indentation}`);
                    insertText.appendPlaceholder(`description of ${element.name}`);
                    insertText.appendText(`\n`);
                });
                break;
            }
        }
    }

    insertText.appendText(`${ws}"""\n`);

    return insertText;
}

function extractClassDetails(clsNode: Parser.SyntaxNode): any {
    console.log('--------------------------------------------------------');
    console.log(clsNode);
    console.log('--------------------------------------------------------');

    const details: any = {};

    const nameNode = clsNode.childForFieldName('name');
    details.name = nameNode ? nameNode.text : '';


    // details.superclasses = [];
    // const superClassesNode = clsNode.childForFieldName('superclasses');
    // if (superClassesNode) {
    //     superClassesNode.namedChildren.forEach((child: Parser.SyntaxNode) => {
    //         details.superclasses.push(child.text);
    //     });
    // }

    // details.decorators = [];
    // const decoratorsNode = clsNode.childForFieldName('decorators');
    // if (decoratorsNode) {
    //     decoratorsNode.namedChildren.forEach((child: Parser.SyntaxNode) => {
    //         details.decorators.push(child.text);
    //     });
    // }

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
    details.returnType = returnNode ? returnNode.text : 'None';

    return details;
}
