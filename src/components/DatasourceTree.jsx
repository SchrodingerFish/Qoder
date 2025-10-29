import { useEffect, useState } from 'react';
import { getDatasourceTree } from '../services/datasourceApi';
import '../styles/components/DatasourceTree.css';

const DatasourceTree = ({ selectedDatasources, onSelectionChange, apiMode }) => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    // 加载数据源树
    useEffect(() => {
        if (apiMode === 'real') {
            loadDatasourceTree();
        } else {
            // 模拟模式下清空树
            setTreeData([]);
            setError(null);
        }
    }, [apiMode]);

    const loadDatasourceTree = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getDatasourceTree();
            setTreeData(data);

            // 默认展开所有根节点
            const rootIds = data.map(node => node.id);
            setExpandedNodes(new Set(rootIds));
        } catch (err) {
            console.error('加载数据源树失败:', err);
            setError(err.message || '加载数据源树失败');
            setTreeData([]);
        } finally {
            setLoading(false);
        }
    };

    // 切换节点展开/折叠
    const toggleNode = nodeId => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    // 处理复选框变化
    const handleCheckboxChange = (node, checked) => {
        if (node.type !== 'datasource') {
            return; // 只允许选择数据源节点
        }

        const newSelected = new Set(selectedDatasources);
        if (checked) {
            newSelected.add(node.datasourceCode);
        } else {
            newSelected.delete(node.datasourceCode);
        }

        onSelectionChange(Array.from(newSelected));
    };

    // 渲染树节点
    const renderNode = (node, level = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isCategory = node.type === 'category';
        const isSelected = selectedDatasources.includes(node.datasourceCode);

        return (
            <div key={node.id} className="tree-node-container">
                <div className={`tree-node level-${level} ${isCategory ? 'category' : 'datasource'}`}>
                    <div className="node-content">
                        {/* 展开/折叠图标 */}
                        <span
                            className={`expand-icon ${hasChildren ? (isExpanded ? 'expanded' : 'collapsed') : 'empty'}`}
                            onClick={() => hasChildren && toggleNode(node.id)}
                        >
                            {hasChildren && (isExpanded ? '▼' : '▶')}
                        </span>

                        {/* 复选框（仅数据源节点显示） */}
                        {!isCategory && (
                            <input
                                type="checkbox"
                                className="node-checkbox"
                                checked={isSelected}
                                onChange={e => handleCheckboxChange(node, e.target.checked)}
                            />
                        )}

                        {/* 节点图标 */}
                        <span className="node-icon">{isCategory ? '📁' : '🗄️'}</span>

                        {/* 节点标签 */}
                        <span className="node-label" title={node.description || node.label}>
                            {node.label}
                        </span>
                    </div>
                </div>

                {/* 子节点 */}
                {hasChildren && isExpanded && (
                    <div className="tree-children">{node.children.map(child => renderNode(child, level + 1))}</div>
                )}
            </div>
        );
    };

    if (apiMode === 'mock') {
        return (
            <div className="datasource-tree">
                <div className="tree-header">
                    <h3>数据源</h3>
                </div>
                <div className="tree-content empty">
                    <div className="empty-state">
                        <div className="empty-icon">💡</div>
                        <p>请切换到真实API模式</p>
                        <p className="empty-hint">以查看和选择数据源</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="datasource-tree">
            <div className="tree-header">
                <h3>数据源</h3>
                <button className="refresh-btn" onClick={loadDatasourceTree} disabled={loading} title="刷新数据源列表">
                    {loading ? '⟳' : '↻'}
                </button>
            </div>

            <div className="tree-content">
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>加载中...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <p>加载失败</p>
                        <p className="error-message">{error}</p>
                        <button className="retry-btn" onClick={loadDatasourceTree}>
                            重试
                        </button>
                    </div>
                )}

                {!loading && !error && treeData.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <p>暂无数据源</p>
                    </div>
                )}

                {!loading && !error && treeData.length > 0 && (
                    <div className="tree-nodes">{treeData.map(node => renderNode(node))}</div>
                )}
            </div>

            {selectedDatasources.length > 0 && (
                <div className="tree-footer">
                    <span className="selected-count">已选择: {selectedDatasources.length} 个数据源</span>
                    <button className="clear-btn" onClick={() => onSelectionChange([])} title="清空选择">
                        清空
                    </button>
                </div>
            )}
        </div>
    );
};

export default DatasourceTree;
