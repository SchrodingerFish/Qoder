// API配置管理
export const API_CONFIG = {
    // 基础配置
    // BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30秒超时

    // API端点
    ENDPOINTS: {
        EXECUTE_SQL: '/api/execute-sql',
        HEALTH_CHECK: '/api/health',
        GET_DATABASES: '/api/databases',
        GET_TABLES: '/api/tables',
        GET_SCHEMA: '/api/schema',
        EXPORT_EXCEL: '/api/export-excel', // Excel导出端点
        EXPORT_MULTI_DATASOURCE_EXCEL: '/api/export-multi-datasource-excel', // 多数据源Excel导出端点
        DATASOURCE_TREE: '/api/datasource/tree', // 数据源树形结构
        MULTI_DATASOURCE_QUERY: '/api/datasource/multi-query', // 多数据源查询
    },

    // 请求配置
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
    },

    // 重试配置
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1秒

    // 认证配置
    AUTH_ENABLED: import.meta.env.VITE_ENABLE_AUTH === 'true',
    AUTH_TOKEN_KEY: 'authToken',
};

/**
 * 获取认证头信息
 * @returns {Object} 认证头对象
 */
export const getAuthHeaders = () => {
    if (!API_CONFIG.AUTH_ENABLED) {
        return {};
    }

    const token = localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * HTTP状态码错误映射
 */
export const HTTP_ERROR_MESSAGES = {
    400: 'SQL语法错误或请求参数无效',
    401: '认证失败，请检查登录状态',
    403: '权限不足，无法执行此查询',
    404: 'API接口不存在，请检查服务器配置',
    408: '请求超时，请稍后重试',
    429: '请求过于频繁，请稍后重试',
    500: '服务器内部错误，请稍后重试',
    502: '网关错误，请检查服务器状态',
    503: '服务暂时不可用，请稍后重试',
    504: '网关超时，请稍后重试',
};

/**
 * 获取完整的API URL
 * @param {string} endpoint - API端点
 * @returns {string} 完整的API URL
 */
export const getApiUrl = endpoint => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * 检查API健康状态
 * @returns {Promise<boolean>} API是否健康
 */
export const checkApiHealth = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH_CHECK), {
            method: 'GET',
            headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                ...getAuthHeaders(),
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.warn('API健康检查失败:', error.message);
        return false;
    }
};
