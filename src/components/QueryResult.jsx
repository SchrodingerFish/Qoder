import { useMemo, useState } from 'react';
import { exportToExcel } from '../services/sqlApi';
import '../styles/components/QueryResult.css';

const QueryResult = ({ result, isLoading, query, database = 'mine' }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [isExporting, setIsExporting] = useState(false); // 导出状态
    const [copyMessage, setCopyMessage] = useState(''); // 复制提示消息

    // 分页逻辑
    const paginatedData = useMemo(() => {
        if (!result?.data || !Array.isArray(result.data)) {
            return [];
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return result.data.slice(startIndex, endIndex);
    }, [result?.data, currentPage, pageSize]);

    const totalPages = useMemo(() => {
        if (!result?.data || !Array.isArray(result.data)) {
            return 0;
        }
        return Math.ceil(result.data.length / pageSize);
    }, [result?.data, pageSize]);

    const handlePageChange = newPage => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handlePageSizeChange = newPageSize => {
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    const handleExportToExcel = async () => {
        if (!query || !query.trim()) {
            alert('没有可导出的SQL查询语句');
            return;
        }

        setIsExporting(true);

        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `query_result_${timestamp}`;

            await exportToExcel(query, database, filename, {
                // 可以添加其他选项
            });
        } catch (error) {
            console.error('Excel导出失败:', error);
            alert(`Excel导出失败: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    // 复制所有字段名（用逗号分隔）
    const handleCopyColumns = async () => {
        if (!result?.data || !Array.isArray(result.data) || result.data.length === 0) {
            return;
        }

        const columns = Object.keys(result.data[0]);
        const columnsText = columns.join(',');

        try {
            await navigator.clipboard.writeText(columnsText);
            setCopyMessage('字段名复制成功！');
            setTimeout(() => setCopyMessage(''), 2000);
        } catch (error) {
            console.error('复制失败:', error);
            // 备用方案：使用传统的复制方法
            const textArea = document.createElement('textarea');
            textArea.value = columnsText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopyMessage('字段名复制成功！');
            setTimeout(() => setCopyMessage(''), 2000);
        }
    };

    // 复制单行数据（JSON格式）
    const handleCopyRow = async rowData => {
        const jsonText = JSON.stringify(rowData);

        try {
            await navigator.clipboard.writeText(jsonText);
            setCopyMessage('行数据复制成功！');
            setTimeout(() => setCopyMessage(''), 2000);
        } catch (error) {
            console.error('复制失败:', error);
            // 备用方案：使用传统的复制方法
            const textArea = document.createElement('textarea');
            textArea.value = jsonText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopyMessage('行数据复制成功！');
            setTimeout(() => setCopyMessage(''), 2000);
        }
    };

    // 复制单个单元格内容
    const handleCopyCell = async cellValue => {
        // 处理各种数据类型
        let copyText = '';
        if (cellValue === null) {
            copyText = 'NULL';
        } else if (cellValue === undefined) {
            copyText = 'UNDEFINED';
        } else {
            copyText = String(cellValue);
        }

        try {
            await navigator.clipboard.writeText(copyText);
            setCopyMessage('单元格内容复制成功！');
            setTimeout(() => setCopyMessage(''), 2000);
        } catch (error) {
            console.error('复制失败:', error);
            // 备用方案：使用传统的复制方法
            const textArea = document.createElement('textarea');
            textArea.value = copyText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopyMessage('单元格内容复制成功！');
            setTimeout(() => setCopyMessage(''), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="query-result loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>执行查询中...</span>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="query-result empty">
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>暂无查询结果</h3>
                    <p>请输入SQL查询语句并点击执行按钮</p>
                </div>
            </div>
        );
    }

    if (!result.success) {
        return (
            <div className="query-result error">
                <div className="error-content">
                    <div className="error-icon">⚠️</div>
                    <h3>查询执行失败</h3>
                    <div className="error-details">
                        {/* 主要错误信息 */}
                        <div className="error-message">
                            <h4>错误信息:</h4>
                            <pre>{result.error || result.message || '未知错误'}</pre>
                        </div>

                        {/* 显示服务器返回的完整响应信息 */}
                        {result.message && result.message !== result.error && (
                            <div className="server-message">
                                <h4>服务器消息:</h4>
                                <pre>{result.message}</pre>
                            </div>
                        )}

                        {/* 显示元数据信息（如果有） */}
                        {result.metadata && (
                            <div className="metadata-info">
                                <h4>详细信息:</h4>
                                <pre>
                                    {typeof result.metadata === 'string'
                                        ? result.metadata
                                        : JSON.stringify(result.metadata, null, 2)}
                                </pre>
                            </div>
                        )}

                        {/* 显示执行时间（如果有） */}
                        {result.executionTime !== undefined && result.executionTime > 0 && (
                            <div className="execution-info">
                                <span>执行时间: {result.executionTime}ms</span>
                            </div>
                        )}

                        {/* 显示行数信息（如果有） */}
                        {(result.rowCount !== undefined || result.rowsAffected !== undefined) && (
                            <div className="row-info">
                                {result.rowCount !== undefined && <span>查询行数: {result.rowCount}</span>}
                                {result.rowsAffected !== undefined && <span>影响行数: {result.rowsAffected}</span>}
                            </div>
                        )}

                        {/* 完整响应数据（调试用） */}
                        {/* <details className="debug-info">
                            <summary>完整响应数据 (调试信息)</summary>
                            <pre className="debug-content">{JSON.stringify(result, null, 2)}</pre>
                        </details> */}
                    </div>
                </div>
            </div>
        );
    }

    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        return (
            <div className="query-result success-empty">
                <div className="success-empty-content">
                    <div className="success-icon">✅</div>
                    <h3>查询执行成功</h3>
                    <p>查询返回了0行数据</p>
                    {result.rowsAffected !== undefined && (
                        <p className="affected-rows">影响行数: {result.rowsAffected}</p>
                    )}
                </div>
            </div>
        );
    }

    const columns = Object.keys(result.data[0]);

    return (
        <div className="query-result success">
            <div className="result-toolbar">
                <div className="result-info">
                    <span className="row-count">共 {result.data.length} 行数据</span>
                    {result.rowsAffected !== undefined && (
                        <span className="affected-rows">影响行数: {result.rowsAffected}</span>
                    )}
                </div>

                <div className="result-actions">
                    <select
                        className="page-size-select"
                        value={pageSize}
                        onChange={e => handlePageSizeChange(Number(e.target.value))}
                    >
                        <option value={10}>10/页</option>
                        <option value={25}>25/页</option>
                        <option value={50}>50/页</option>
                        <option value={100}>100/页</option>
                    </select>

                    <button
                        className="export-btn"
                        onClick={handleExportToExcel}
                        disabled={isExporting}
                        title="导出为Excel"
                    >
                        {isExporting ? '导出中...' : '导出Excel'}
                    </button>
                </div>
            </div>

            {/* 复制提示消息 */}
            {copyMessage && <div className="copy-message">{copyMessage}</div>}

            <div className="table-container">
                <div className="scroll-hint">
                    {columns.length > 5 && '💡 表格支持横向滚动查看更多列 | '}
                    点击数据单元格可复制内容
                </div>
                <table className="result-table">
                    <thead>
                        <tr>
                            <th className="copy-header">
                                <button className="copy-columns-btn" onClick={handleCopyColumns} title="复制所有字段名">
                                    复制字段
                                </button>
                            </th>
                            <th className="row-number-header">#</th>
                            {columns.map(column => (
                                <th key={column} className="column-header">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={index} className="table-row">
                                <td className="copy-cell">
                                    <button
                                        className="copy-row-btn"
                                        onClick={() => handleCopyRow(row)}
                                        title="复制本行数据JSON"
                                    >
                                        复制
                                    </button>
                                </td>
                                <td className="row-number">{(currentPage - 1) * pageSize + index + 1}</td>
                                {columns.map(column => (
                                    <td key={column} className="table-cell clickable-cell">
                                        <div
                                            className="cell-content"
                                            title={`点击复制: ${String(row[column])}`}
                                            onClick={() => handleCopyCell(row[column])}
                                        >
                                            {row[column] === null ? (
                                                <span className="null-value">NULL</span>
                                            ) : row[column] === undefined ? (
                                                <span className="undefined-value">UNDEFINED</span>
                                            ) : (
                                                String(row[column])
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="pagination-btn" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                        首页
                    </button>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        上一页
                    </button>

                    <span className="pagination-info">
                        第 {currentPage} 页，共 {totalPages} 页
                    </span>

                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        下一页
                    </button>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        末页
                    </button>
                </div>
            )}
        </div>
    );
};

export default QueryResult;
