import { useEffect, useState, useCallback, useRef } from 'react';
import DatasourceTree from './components/DatasourceTree';
import QueryResult from './components/QueryResult';
import QueryTabs from './components/QueryTabs';
import SqlEditor from './components/SqlEditor';
import { executeMultiDatasourceQuery } from './services/datasourceApi';
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

    // 多数据源相关状态
    const [selectedDatasources, setSelectedDatasources] = useState([]); // 选中的数据源列表
    const [multiQueryResults, setMultiQueryResults] = useState([]); // 多数据源查询结果

    // 布局相关状态
    const [editorHeight, setEditorHeight] = useState(() => {
        const saved = localStorage.getItem('editorHeight');
        return saved ? parseInt(saved) : 50; // 默认50%
    });
    const [layoutMode, setLayoutMode] = useState('split'); // 'split', 'editor-only', 'result-only'
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

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
            selectedDatasources,
        });

        // 确定要执行的SQL语句：优先使用传入的选中文本，其次是状态中的选中文本，最后是完整查询
        const queryToExecute = selectedTextFromEditor || selectedText || sqlQuery;

        console.log('📝 将执行的查询:', queryToExecute);

        if (!queryToExecute.trim()) {
            alert('请输入SQL查询语句或选中要执行的代码');
            return;
        }

        // 如果是真实API模式且选择了多个数据源，执行多数据源查询
        if (apiMode === 'real' && selectedDatasources.length > 0) {
            await handleMultiDatasourceQuery(queryToExecute);
            return;
        }

        // 否则执行单数据源查询（兼容原有逻辑）
        await handleSingleQuery(queryToExecute);
    };

    // 单数据源查询（原有逻辑）
    const handleSingleQuery = async queryToExecute => {
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

            // 清空多数据源查询结果
            setMultiQueryResults([]);

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

    // 多数据源查询
    const handleMultiDatasourceQuery = async queryToExecute => {
        setIsExecuting(true);
        const startTime = performance.now();

        try {
            const response = await executeMultiDatasourceQuery(queryToExecute, selectedDatasources);

            const endTime = performance.now();
            const duration = endTime - startTime;
            setExecutionTime(duration);

            console.log('多数据源查询响应:', response);

            // 设置多数据源查询结果
            if (response.results && response.results.length > 0) {
                setMultiQueryResults(response.results);
                // 清空单数据源查询结果
                setQueryResult(null);
            }

            // 更新连接状态
            setApiStatus('connected');
            setApiMessage('连接正常');
        } catch (error) {
            console.error('多数据源查询失败:', error);

            // 构造错误结果
            setQueryResult({
                success: false,
                error: error.message,
                message: error.message,
                data: null,
                rowCount: 0,
                rowsAffected: 0,
                executionTime: 0,
            });

            const endTime = performance.now();
            const duration = endTime - startTime;
            setExecutionTime(duration);

            // 更新连接状态
            if (
                error.message.includes('网络连接失败') ||
                error.message.includes('后端服务') ||
                error.message.includes('请求超时')
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
        setMultiQueryResults([]);
        setSelectedDatasources([]);

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

    // 处理数据源选择变化
    const handleDatasourceSelectionChange = datasources => {
        setSelectedDatasources(datasources);
        console.log('选中的数据源:', datasources);
    };

    // 关闭单个标签页
    const handleCloseTab = index => {
        const newResults = [...multiQueryResults];
        newResults.splice(index, 1);
        setMultiQueryResults(newResults);
    };

    // 关闭所有标签页
    const handleCloseAllTabs = () => {
        setMultiQueryResults([]);
    };

    // 处理拖拽分隔条
    const handleMouseDown = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging || !containerRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const containerHeight = containerRect.height;
            const mouseY = e.clientY - containerRect.top;
            
            // 计算百分比，限制在20%-80%之间
            let percentage = (mouseY / containerHeight) * 100;
            percentage = Math.max(20, Math.min(80, percentage));
            
            setEditorHeight(percentage);
        },
        [isDragging]
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            localStorage.setItem('editorHeight', editorHeight.toString());
        }
    }, [isDragging, editorHeight]);

    // 监听鼠标事件
    useEffect(() => {
        if (isDragging) {
            document.body.classList.add('dragging');
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.body.classList.remove('dragging');
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // 快速切换布局模式
    const toggleLayoutMode = (mode) => {
        // 如果点击的是当前已激活的模式，则返回分屏模式
        if (layoutMode === mode && mode !== 'split') {
            setLayoutMode('split');
        } else {
            setLayoutMode(mode);
        }
    };

    // 在最开头新增 LayoutToggle 组件
    const LayoutToggle = ({ layoutMode, toggleLayoutMode }) => (
        <div className="layout-toggle-buttons">
            <button
                className={`layout-btn ${layoutMode === 'editor-only' ? 'active' : ''}`}
                onClick={() => toggleLayoutMode('editor-only')}
                title="专注编辑"
            >
                📝
            </button>
            <button
                className={`layout-btn ${layoutMode === 'split' ? 'active' : ''}`}
                onClick={() => toggleLayoutMode('split')}
                title="分屏模式"
            >
                ⬍
            </button>
            <button
                className={`layout-btn ${layoutMode === 'result-only' ? 'active' : ''}`}
                onClick={() => toggleLayoutMode('result-only')}
                title="专注结果"
            >
                📊
            </button>
        </div>
    );

    return (
        <div className="app">
            <header className="app-header">
                <h1>多功能SQL查询工具</h1>
                <div className="header-controls">
                    <button className={`mode-toggle ${apiMode}`} onClick={toggleApiMode} title="切换API模式">
                        {apiMode === 'mock' ? '当前为模拟数据模式' : '当前为真实API模式'}
                    </button>

                    {/* API状态指示器 */}
                    {apiMode === 'real' && (
                        <div className={`api-status ${apiStatus}`} title={`API状态: ${apiMessage}`}>
                            <span className="status-dot"></span>
                            <span className="status-text">API状态:</span>
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
                <div className="app-layout">
                    {/* 左侧数据源树 */}
                    {apiMode === 'real' && (
                        <div className="sidebar">
                            <DatasourceTree
                                selectedDatasources={selectedDatasources}
                                onSelectionChange={handleDatasourceSelectionChange}
                                apiMode={apiMode}
                            />
                        </div>
                    )}

                    {/* 中间和右侧内容区 */}
                    <div className="content-area" ref={containerRef}>
                        {/* 编辑器区域 */}
                        <div 
                            className={`editor-section ${layoutMode === 'result-only' ? 'hidden' : ''}`}
                            style={{ 
                                height: layoutMode === 'split' ? `${editorHeight}%` : 
                                        layoutMode === 'editor-only' ? '100%' : '0%'
                            }}
                        >
                            <div className="editor-header">
                                <div className="editor-title">
                                    <h3>SQL 查询</h3>
                                    {selectedText && (
                                        <span className="selected-info">已选中 {selectedText.length} 个字符</span>
                                    )}
                                    {selectedDatasources.length > 0 && (
                                        <span className="datasource-info">{selectedDatasources.length} 个数据源</span>
                                    )}
                                </div>
                                <div className="editor-actions">
                                    {/* 只在分屏和editor-only时显示布局切换 */}
                                    {(layoutMode === 'split' || layoutMode === 'editor-only') && (
                                        <LayoutToggle layoutMode={layoutMode} toggleLayoutMode={toggleLayoutMode} />
                                    )}
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

                        {/* 可拖拽的分隔条 */}
                        {layoutMode === 'split' && (
                            <div 
                                className={`resizer ${isDragging ? 'dragging' : ''}`}
                                onMouseDown={handleMouseDown}
                            >
                                <div className="resizer-handle">
                                    <div className="resizer-line"></div>
                                </div>
                            </div>
                        )}

                        {/* 结果区域 */}
                        <div 
                            className={`result-section ${layoutMode === 'editor-only' ? 'hidden' : ''}`}
                            style={{ 
                                height: layoutMode === 'split' ? `${100 - editorHeight}%` : 
                                        layoutMode === 'result-only' ? '100%' : '0%'
                            }}
                        >
                            <div className="result-header">
                                <div className="result-title">
                                    <h3>查询结果</h3>
                                    {(queryResult || multiQueryResults.length > 0) && (
                                        <span className="query-info">
                                            {selectedText
                                                ? `执行选中代码 (${selectedText.split('\n').length}行)`
                                                : '执行完整查询'}
                                        </span>
                                    )}
                                </div>
                                <div className="result-actions">
                                    {/* 只在 result-only 时显示布局切换 */}
                                    {layoutMode === 'result-only' && (
                                        <LayoutToggle layoutMode={layoutMode} toggleLayoutMode={toggleLayoutMode} />
                                    )}
                                    {executionTime !== null && (
                                        <span className="execution-time">执行时间: {executionTime.toFixed(2)}ms</span>
                                    )}
                                </div>
                            </div>

                            {/* 多数据源查询结果使用标签页展示 */}
                            {multiQueryResults.length > 0 ? (
                                <QueryTabs
                                    queryResults={multiQueryResults}
                                    onCloseTab={handleCloseTab}
                                    onCloseAll={handleCloseAllTabs}
                                    query={selectedText || sqlQuery}
                                />
                            ) : (
                                // 单数据源查询结果
                                <QueryResult
                                    result={queryResult}
                                    isLoading={isExecuting}
                                    query={selectedText || sqlQuery}
                                    database="mine"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
