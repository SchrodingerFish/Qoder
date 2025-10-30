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

/**
 * 导出多数据源查询结果为ZIP压缩包
 * @param {string} query - SQL查询语句
 * @param {Array<string>} datasourceCodes - 数据源编码列表
 * @param {string} filenamePrefix - 文件名前缀
 * @param {Object} options - 查询选项
 */
export const exportMultiDatasourcesToZip = async (query, datasourceCodes, filenamePrefix = 'multi_datasource_query', options = {}) => {
    if (!query || !query.trim()) {
        throw new Error('SQL查询语句不能为空');
    }

    if (!datasourceCodes || datasourceCodes.length === 0) {
        throw new Error('请选择至少一个数据源');
    }

    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.EXPORT_MULTI_DATASOURCE_EXCEL);

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
                query: query,
                datasourceCodes: datasourceCodes,
                filenamePrefix: filenamePrefix,
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
            // 检查是否返回JSON错误信息
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || '导出失败');
            }
            throw new Error(`导出失败: HTTP ${response.status}`);
        }

        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // 如果返回的是JSON，说明可能有错误
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || '导出失败');
        }

        // 获取文件blob
        const blob = await response.blob();

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // 从响应头中获取文件名，或使用默认文件名
        const contentDisposition = response.headers.get('content-disposition');
        let downloadFilename = `${filenamePrefix}_${new Date().getTime()}.zip`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*?)\1/);
            if (filenameMatch && filenameMatch[2]) {
                downloadFilename = decodeURIComponent(filenameMatch[2]);
            }
        }

        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 清理URL对象
        window.URL.revokeObjectURL(downloadUrl);

        return {
            success: true,
            message: `多数据源Excel导出成功: ${downloadFilename}`,
            filename: downloadFilename,
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('导出请求超时，请稍后重试');
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('无法连接到导出服务，请检查网络连接');
        }

        throw error;
    }
};