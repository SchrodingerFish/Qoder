import { useEffect, useState } from 'react';
import QueryResult from './components/QueryResult';
import SqlEditor from './components/SqlEditor';
import { checkApiConnection, executeSqlQuery } from './services/sqlApi';
import './styles/global/App.css';

function App() {
    const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
    const [selectedText, setSelectedText] = useState(''); // 当前选中的文本
    const [queryResult, setQueryResult] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionTime, setExecutionTime] = useState(null);
    const [apiMode, setApiMode] = useState('mock'); // 'mock' 或 'real'

    // 添加API连接状态检查
    const [apiStatus, setApiStatus] = useState('unknown'); // 'connected', 'disconnected', 'checking', 'unknown'
    const [apiMessage, setApiMessage] = useState('');

    // 检查API连接状态
    const handleCheckApiConnection = async () => {
        if (apiMode === 'mock') return;

        setApiStatus('checking');
        try {
            const result = await checkApiConnection();
            setApiStatus(result.connected ? 'connected' : 'disconnected');

            // 显示更详细的错误信息
            if (result.connected) {
                setApiMessage('连接正常');
            } else {
                setApiMessage(result.message + (result.url ? ` (${result.url})` : ''));
                console.warn('API连接检查失败:', result);
            }
        } catch (error) {
            setApiStatus('disconnected');
            setApiMessage(`检查失败: ${error.message}`);
            console.error('API连接检查异常:', error);
        }
    };

    const handleExecuteQuery = async (selectedTextFromEditor = '') => {
        console.log('🚀 执行查询调试:', {
            selectedTextFromEditor,
            selectedTextState: selectedText,
            sqlQuery: sqlQuery,
        });

        // 确定要执行的SQL语句：优先使用传入的选中文本，其次是状态中的选中文本，最后是完整查询
        const queryToExecute = selectedTextFromEditor || selectedText || sqlQuery;

        console.log('📝 将执行的查询:', queryToExecute);

        if (!queryToExecute.trim()) {
            alert('请输入SQL查询语句或选中要执行的代码');
            return;
        }

        setIsExecuting(true);
        const startTime = performance.now();

        try {
            // 如果是真实API模式，传递额外选项
            const options =
                apiMode === 'real'
                    ? {
                          database: 'mine',
                          timeout: 30000,
                      }
                    : {};

            const result = await executeSqlQuery(queryToExecute, apiMode, options);
            const endTime = performance.now();
            const duration = endTime - startTime;

            setQueryResult(result);
            setExecutionTime(duration);

            // 如果是真实API模式，更新连接状态
            if (apiMode === 'real') {
                setApiStatus('connected');
                setApiMessage('连接正常');
            }
        } catch (error) {
            console.error('查询执行失败:', error);

            // 如果错误对象包含完整的响应数据，直接使用
            if (error.response && typeof error.response === 'object') {
                setQueryResult(error.response);
            } else {
                // 否则构造错误响应对象
                setQueryResult({
                    success: false,
                    error: error.message,
                    message: error.message,
                    data: null,
                    rowCount: 0,
                    rowsAffected: 0,
                    executionTime: 0,
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;
            setExecutionTime(duration);

            // 如果是真实API模式且是连接错误，更新状态
            if (
                apiMode === 'real' &&
                (error.message.includes('网络连接失败') ||
                    error.message.includes('后端服务') ||
                    error.message.includes('请求超时'))
            ) {
                setApiStatus('disconnected');
                setApiMessage(error.message);
            }
        } finally {
            setIsExecuting(false);
        }
    };

    // 处理编辑器中选中文本的变化
    const handleSelectionChange = selected => {
        // 仅在有实际内容时才设置选中文本
        const trimmedSelected = selected.trim();
        setSelectedText(trimmedSelected);

        // 调试信息
        console.log('🔍 选中文本变化:', {
            original: selected,
            trimmed: trimmedSelected,
            length: trimmedSelected.length,
        });
    };

    const toggleApiMode = () => {
        const newMode = apiMode === 'mock' ? 'real' : 'mock';
        setApiMode(newMode);
        setQueryResult(null);
        setExecutionTime(null);

        // 如果切换到真实API模式，检查连接状态
        if (newMode === 'real') {
            handleCheckApiConnection();
        } else {
            setApiStatus('unknown');
            setApiMessage('');
        }
    };

    // 组件挂载时检查API状态
    useEffect(() => {
        if (apiMode === 'real') {
            handleCheckApiConnection();
        }
    }, []); // 空依赖数组，仅在组件挂载时执行一次

    return (
        <div className="app">
            <header className="app-header">
                <h1>简单SQL编辑器</h1>
                <div className="header-controls">
                    <button className={`mode-toggle ${apiMode}`} onClick={toggleApiMode} title="切换API模式">
                        {apiMode === 'mock' ? '模拟数据' : '真实API'}
                    </button>

                    {/* API状态指示器 */}
                    {apiMode === 'real' && (
                        <div className={`api-status ${apiStatus}`} title={`API状态: ${apiMessage}`}>
                            <span className="status-dot"></span>
                            <span className="status-text">
                                {apiStatus === 'connected' && '已连接'}
                                {apiStatus === 'disconnected' && '未连接'}
                                {apiStatus === 'checking' && '检查中...'}
                                {apiStatus === 'unknown' && '未知'}
                            </span>
                            <button
                                className="refresh-btn"
                                onClick={handleCheckApiConnection}
                                title="重新检查API连接"
                                disabled={apiStatus === 'checking'}
                            >
                                ↻
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="app-main">
                <div className="editor-section">
                    <div className="editor-header">
                        <div className="editor-title">
                            <h3>SQL 查询</h3>
                            {selectedText && <span className="selected-info">已选中 {selectedText.length} 个字符</span>}
                        </div>
                        <div className="editor-actions">
                            <button
                                className="execute-btn"
                                onClick={() => handleExecuteQuery(selectedText)}
                                disabled={isExecuting}
                            >
                                {isExecuting ? '执行中...' : selectedText ? '执行选中代码' : '执行查询'}
                            </button>
                        </div>
                    </div>
                    <SqlEditor
                        value={sqlQuery}
                        onChange={setSqlQuery}
                        onExecute={handleExecuteQuery}
                        onSelectionChange={handleSelectionChange}
                    />
                </div>

                <div className="result-section">
                    <div className="result-header">
                        <div className="result-title">
                            <h3>查询结果</h3>
                            {queryResult && (
                                <span className="query-info">
                                    {selectedText
                                        ? `执行选中代码 (${selectedText.split('\n').length}行)`
                                        : '执行完整查询'}
                                </span>
                            )}
                        </div>
                        <div className="result-actions">
                            {executionTime !== null && (
                                <span className="execution-time">执行时间: {executionTime.toFixed(2)}ms</span>
                            )}
                        </div>
                    </div>
                    <QueryResult
                        result={queryResult}
                        isLoading={isExecuting}
                        query={selectedText || sqlQuery}
                        database="mine"
                    />
                </div>
            </main>
        </div>
    );
}

export default App;
