import { useState } from 'react';
import { exportMultiDatasourcesToZip } from '../services/datasourceApi';
import '../styles/components/QueryTabs.css';
import QueryResult from './QueryResult';

const QueryTabs = ({ queryResults, onCloseTab, onCloseAll, query }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isExporting, setIsExporting] = useState(false);

    // 导出所有数据源为ZIP
    const handleExportAllToZip = async () => {
        if (!query || !query.trim()) {
            alert('没有可导出的SQL查询语句');
            return;
        }

        if (!queryResults || queryResults.length === 0) {
            alert('没有可导出的查询结果');
            return;
        }

        setIsExporting(true);

        try {
            // 提取所有数据源编码
            const datasourceCodes = queryResults.map(result => result.datasourceCode);

            // 生成文件名前缀
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filenamePrefix = `multi_datasource_query_${timestamp}`;

            await exportMultiDatasourcesToZip(query, datasourceCodes, filenamePrefix);
        } catch (error) {
            console.error('导出多数据源Excel失败:', error);
            alert(`导出失败: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

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

                <div className="tabs-actions">
                    <button
                        className="export-all-btn"
                        onClick={handleExportAllToZip}
                        disabled={isExporting}
                        title="导出所有数据源为ZIP压缩包"
                    >
                        📦 {isExporting ? '导出中...' : '导出为ZIP'}
                    </button>
                    {queryResults.length > 1 && (
                        <button className="close-all-btn" onClick={onCloseAll} title="关闭所有标签页">
                            关闭所有
                        </button>
                    )}
                </div>
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
                                showExportButton={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueryTabs;
