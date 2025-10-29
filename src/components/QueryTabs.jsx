import { useState } from 'react';
import '../styles/components/QueryTabs.css';
import QueryResult from './QueryResult';

const QueryTabs = ({ queryResults, onCloseTab, onCloseAll }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!queryResults || queryResults.length === 0) {
        return (
            <div className="query-tabs empty">
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>暂无查询结果</h3>
                    <p>请选择数据源并执行SQL查询</p>
                </div>
            </div>
        );
    }

    const handleCloseTab = (index, event) => {
        event.stopPropagation();

        if (queryResults.length === 1) {
            // 最后一个标签页，关闭所有
            onCloseAll();
            setActiveTab(0);
        } else {
            // 如果关闭的是当前激活的标签页
            if (index === activeTab) {
                // 如果关闭的是最后一个标签页，激活前一个
                if (index === queryResults.length - 1) {
                    setActiveTab(index - 1);
                }
                // 否则保持当前索引（因为后面的标签会前移）
            } else if (index < activeTab) {
                // 如果关闭的标签在当前激活标签之前，需要调整激活索引
                setActiveTab(activeTab - 1);
            }

            onCloseTab(index);
        }
    };

    const currentResult = queryResults[activeTab];

    return (
        <div className="query-tabs">
            <div className="tabs-header">
                <div className="tabs-list">
                    {queryResults.map((result, index) => (
                        <div
                            key={index}
                            className={`tab-item ${index === activeTab ? 'active' : ''} ${
                                result.success ? 'success' : 'error'
                            }`}
                            onClick={() => setActiveTab(index)}
                            title={result.datasourceName}
                        >
                            <span className="tab-icon">{result.success ? '✓' : '✗'}</span>
                            <span className="tab-label">{result.datasourceName}</span>
                            <span className="tab-badge">{result.success ? result.rowCount || 0 : 'Error'}</span>
                            <button className="tab-close" onClick={e => handleCloseTab(index, e)} title="关闭标签页">
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {queryResults.length > 1 && (
                    <button className="close-all-btn" onClick={onCloseAll} title="关闭所有标签页">
                        关闭所有
                    </button>
                )}
            </div>

            <div className="tabs-content">
                {currentResult && (
                    <div className="tab-panel">
                        <div className="tab-panel-header">
                            <div className="datasource-info">
                                <span className="info-label">数据源:</span>
                                <span className="info-value">{currentResult.datasourceName}</span>
                                <span className="info-separator">|</span>
                                <span className="info-label">编码:</span>
                                <span className="info-value">{currentResult.datasourceCode}</span>
                                {currentResult.executionTime !== undefined && (
                                    <>
                                        <span className="info-separator">|</span>
                                        <span className="info-label">执行时间:</span>
                                        <span className="info-value">{currentResult.executionTime}ms</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="tab-panel-body">
                            <QueryResult
                                result={{
                                    success: currentResult.success,
                                    data: currentResult.data,
                                    rowCount: currentResult.rowCount,
                                    rowsAffected: currentResult.rowsAffected,
                                    message: currentResult.message,
                                    error: currentResult.error,
                                    executionTime: currentResult.executionTime,
                                    metadata: currentResult.metadata,
                                }}
                                isLoading={false}
                                query=""
                                database={currentResult.datasourceCode}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueryTabs;
