import { API_CONFIG, getApiUrl, getAuthHeaders } from '../config/api.js';

/**
 * 获取数据源树形结构
 */
export const getDatasourceTree = async () => {
    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.DATASOURCE_TREE);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                ...getAuthHeaders(),
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`获取数据源树失败: HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取数据源树异常:', error);
        throw error;
    }
};

/**
 * 执行多数据源查询
 * @param {string} query - SQL查询语句
 * @param {Array<string>} datasourceCodes - 数据源编码列表
 * @param {Object} options - 查询选项
 */
export const executeMultiDatasourceQuery = async (query, datasourceCodes, options = {}) => {
    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.MULTI_DATASOURCE_QUERY);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                query,
                datasourceCodes,
                options: {
                    timeout: API_CONFIG.TIMEOUT,
                    format: 'json',
                    includeMetadata: true,
                    maxRows: 10000,
                    ...options,
                },
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `多数据源查询失败: HTTP ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接或稍后重试');
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查后端服务是否启动');
        }

        throw error;
    }
};
