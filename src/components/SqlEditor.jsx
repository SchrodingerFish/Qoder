import Editor from '@monaco-editor/react';
import { useRef } from 'react';
import '../styles/components/SqlEditor.css';

const SqlEditor = ({ value, onChange, onExecute, onSelectionChange }) => {
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // 监听选中文本变化
        editor.onDidChangeCursorSelection(e => {
            const selectedText = editor.getModel().getValueInRange(e.selection);
            if (onSelectionChange) {
                // 传递原始选中文本，不要trim，让父组件处理
                onSelectionChange(selectedText);
            }
        });

        // 配置SQL语法高亮
        monaco.languages.setMonarchTokensProvider('sql', {
            tokenizer: {
                root: [
                    [
                        /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DATABASE|SCHEMA|UNION|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END|IF|EXISTS|NOT|NULL|AND|OR|IN|BETWEEN|LIKE|IS)\b/i,
                        'keyword',
                    ],
                    [
                        /\b(INT|INTEGER|VARCHAR|CHAR|TEXT|DATE|DATETIME|TIMESTAMP|FLOAT|DOUBLE|DECIMAL|BOOLEAN|BOOL|BINARY|VARBINARY|BLOB|LONGBLOB|MEDIUMBLOB|TINYBLOB|ENUM|SET)\b/i,
                        'type',
                    ],
                    [/'[^']*'/, 'string'],
                    [/"[^"]*"/, 'string'],
                    [/`[^`]*`/, 'identifier'],
                    [/\d+/, 'number'],
                    [/--.*$/, 'comment'],
                    [/\/\*[\s\S]*?\*\//, 'comment'],
                ],
            },
        });

        // 设置主题
        monaco.editor.defineTheme('sqlTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
                { token: 'type', foreground: '4ec9b0' },
                { token: 'string', foreground: 'ce9178' },
                { token: 'identifier', foreground: '9cdcfe' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
            },
        });

        monaco.editor.setTheme('sqlTheme');

        // 添加快捷键
        editor.addAction({
            id: 'execute-query',
            label: '执行查询',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, monaco.KeyCode.F5],
            run: () => {
                if (onExecute) {
                    const selectedText = editor.getModel().getValueInRange(editor.getSelection()).trim();
                    onExecute(selectedText);
                }
            },
        });

        // 添加SQL自动完成
        monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: () => {
                const suggestions = [
                    {
                        label: 'SELECT',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'SELECT ',
                        documentation: 'SELECT语句',
                    },
                    {
                        label: 'FROM',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'FROM ',
                        documentation: 'FROM子句',
                    },
                    {
                        label: 'WHERE',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'WHERE ',
                        documentation: 'WHERE子句',
                    },
                    {
                        label: 'INSERT INTO',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'INSERT INTO ${1:table_name} (${2:columns}) VALUES (${3:values});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'INSERT语句模板',
                    },
                    {
                        label: 'UPDATE',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'UPDATE ${1:table_name} SET ${2:column} = ${3:value} WHERE ${4:condition};',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'UPDATE语句模板',
                    },
                    {
                        label: 'DELETE FROM',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'DELETE FROM ${1:table_name} WHERE ${2:condition};',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'DELETE语句模板',
                    },
                ];
                return { suggestions };
            },
        });

        // 设置编辑器配置
        editor.updateOptions({
            fontSize: 14,
            lineHeight: 21,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
        });
    };

    const handleChange = newValue => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="sql-editor">
            <Editor
                height="100%"
                language="sql"
                value={value}
                onChange={handleChange}
                onMount={handleEditorDidMount}
                options={{
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    theme: 'vs-dark',
                }}
            />
            <div className="editor-shortcuts">
                <span>快捷键: Ctrl+Enter 或 F5 执行查询 | 选中代码后执行仅运行选中部分</span>
            </div>
        </div>
    );
};

export default SqlEditor;
