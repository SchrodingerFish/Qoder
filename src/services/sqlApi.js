import { API_CONFIG, getApiUrl, getAuthHeaders, HTTP_ERROR_MESSAGES } from '../config/api.js';

// 模拟数据库数据
const mockData = {
    users: [
        {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
            age: 28,
            department: '技术部',
            created_at: '2023-01-15 10:30:00',
        },
        {
            id: 2,
            name: '李四',
            email: 'lisi@example.com',
            age: 32,
            department: '产品部',
            created_at: '2023-02-20 14:20:00',
        },
        {
            id: 3,
            name: '王五',
            email: 'wangwu@example.com',
            age: 25,
            department: '设计部',
            created_at: '2023-03-10 09:15:00',
        },
        {
            id: 4,
            name: '赵六',
            email: 'zhaoliu@example.com',
            age: 30,
            department: '技术部',
            created_at: '2023-01-25 16:45:00',
        },
        {
            id: 5,
            name: '钱七',
            email: 'qianqi@example.com',
            age: 27,
            department: '市场部',
            created_at: '2023-04-05 11:30:00',
        },
        {
            id: 6,
            name: '孙八',
            email: 'sunba@example.com',
            age: 29,
            department: '人事部',
            created_at: '2023-02-15 13:20:00',
        },
        {
            id: 7,
            name: '周九',
            email: 'zhoujiu@example.com',
            age: 31,
            department: '财务部',
            created_at: '2023-03-20 08:45:00',
        },
        {
            id: 8,
            name: '吴十',
            email: 'wushi@example.com',
            age: 26,
            department: '技术部',
            created_at: '2023-04-12 15:10:00',
        },
        {
            id: 9,
            name: '郑十一',
            email: 'zhengshiyi@example.com',
            age: 33,
            department: '产品部',
            created_at: '2023-01-08 12:00:00',
        },
        {
            id: 10,
            name: '王十二',
            email: 'wangshier@example.com',
            age: 24,
            department: '设计部',
            created_at: '2023-05-01 10:30:00',
        },
    ],
    orders: [
        {
            id: 1,
            user_id: 1,
            product: 'MacBook Pro',
            price: 12999.0,
            quantity: 1,
            order_date: '2023-06-01',
            status: '已完成',
        },
        {
            id: 2,
            user_id: 2,
            product: 'iPhone 14',
            price: 5999.0,
            quantity: 2,
            order_date: '2023-06-02',
            status: '已发货',
        },
        {
            id: 3,
            user_id: 3,
            product: 'iPad Air',
            price: 4399.0,
            quantity: 1,
            order_date: '2023-06-03',
            status: '处理中',
        },
        {
            id: 4,
            user_id: 1,
            product: 'AirPods Pro',
            price: 1999.0,
            quantity: 1,
            order_date: '2023-06-04',
            status: '已完成',
        },
        {
            id: 5,
            user_id: 4,
            product: 'Mac Studio',
            price: 14999.0,
            quantity: 1,
            order_date: '2023-06-05',
            status: '已发货',
        },
        {
            id: 6,
            user_id: 5,
            product: 'Apple Watch',
            price: 2999.0,
            quantity: 1,
            order_date: '2023-06-06',
            status: '已完成',
        },
        {
            id: 7,
            user_id: 2,
            product: 'MacBook Air',
            price: 8999.0,
            quantity: 1,
            order_date: '2023-06-07',
            status: '处理中',
        },
        { id: 8, user_id: 6, product: 'iMac', price: 9999.0, quantity: 1, order_date: '2023-06-08', status: '已完成' },
    ],
    products: [
        { id: 1, name: 'MacBook Pro', category: '笔记本', price: 12999.0, stock: 50, description: '专业级笔记本电脑' },
        { id: 2, name: 'iPhone 14', category: '手机', price: 5999.0, stock: 100, description: '最新款智能手机' },
        { id: 3, name: 'iPad Air', category: '平板', price: 4399.0, stock: 75, description: '轻薄平板电脑' },
        { id: 4, name: 'AirPods Pro', category: '耳机', price: 1999.0, stock: 200, description: '降噪无线耳机' },
        { id: 5, name: 'Apple Watch', category: '手表', price: 2999.0, stock: 80, description: '智能穿戴设备' },
    ],
};

// 模拟SQL解析和执行
const executeMockQuery = sql => {
    const query = sql.trim().toLowerCase();

    // 模拟延迟
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                // 简单的SQL解析 - 这只是演示用，实际项目中需要更复杂的SQL解析器
                if (query.startsWith('select')) {
                    const result = parseMockSelectQuery(query);
                    resolve({
                        success: true,
                        data: result,
                        rowCount: result.length,
                        message: `查询成功，返回 ${result.length} 行数据`,
                    });
                } else if (query.startsWith('insert')) {
                    resolve({
                        success: true,
                        data: [],
                        rowsAffected: 1,
                        message: '插入操作成功',
                    });
                } else if (query.startsWith('update')) {
                    const affectedRows = Math.floor(Math.random() * 5) + 1;
                    resolve({
                        success: true,
                        data: [],
                        rowsAffected: affectedRows,
                        message: `更新操作成功，影响 ${affectedRows} 行`,
                    });
                } else if (query.startsWith('delete')) {
                    const affectedRows = Math.floor(Math.random() * 3) + 1;
                    resolve({
                        success: true,
                        data: [],
                        rowsAffected: affectedRows,
                        message: `删除操作成功，影响 ${affectedRows} 行`,
                    });
                } else if (query.startsWith('create')) {
                    resolve({
                        success: true,
                        data: [],
                        message: '创建操作成功',
                    });
                } else if (query.startsWith('drop')) {
                    resolve({
                        success: true,
                        data: [],
                        message: '删除操作成功',
                    });
                } else {
                    resolve({
                        success: false,
                        error: '不支持的SQL语句类型',
                    });
                }
            } catch (error) {
                resolve({
                    success: false,
                    error: error.message,
                });
            }
        }, Math.random() * 500 + 200); // 200-700ms 随机延迟
    });
};

// 简单的SELECT查询解析
const parseMockSelectQuery = query => {
    try {
        // 提取表名
        const fromMatch = query.match(/from\s+(\w+)/i);
        if (!fromMatch) {
            throw new Error('无法解析FROM子句');
        }

        const tableName = fromMatch[1].toLowerCase();

        if (!mockData[tableName]) {
            throw new Error(`表 '${tableName}' 不存在`);
        }

        let data = [...mockData[tableName]];

        // 处理WHERE子句
        const whereMatch = query.match(/where\s+(.+?)(?:\s+order|\s+group|\s+limit|\s+$)/i);
        if (whereMatch) {
            const whereClause = whereMatch[1].trim();
            data = filterMockData(data, whereClause);
        }

        // 处理ORDER BY
        const orderMatch = query.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
        if (orderMatch) {
            const column = orderMatch[1];
            const direction = (orderMatch[2] || 'asc').toLowerCase();
            data.sort((a, b) => {
                const aVal = a[column];
                const bVal = b[column];
                if (direction === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }

        // 处理LIMIT
        const limitMatch = query.match(/limit\s+(\d+)(?:\s+offset\s+(\d+))?/i);
        if (limitMatch) {
            const limit = parseInt(limitMatch[1]);
            const offset = parseInt(limitMatch[2] || '0');
            data = data.slice(offset, offset + limit);
        }

        return data;
    } catch (error) {
        throw new Error(`SQL解析错误: ${error.message}`);
    }
};

// 简单的WHERE条件过滤
const filterMockData = (data, whereClause) => {
    // 这是一个非常简化的WHERE解析，实际项目中需要更复杂的实现
    return data.filter(row => {
        // 处理简单的等值条件 如: name = '张三'
        const equalMatch = whereClause.match(/(\w+)\s*=\s*'([^']+)'/i);
        if (equalMatch) {
            const column = equalMatch[1];
            const value = equalMatch[2];
            return row[column] && row[column].toString() === value;
        }

        // 处理数值比较 如: age > 25
        const numMatch = whereClause.match(/(\w+)\s*([><=]+)\s*(\d+)/i);
        if (numMatch) {
            const column = numMatch[1];
            const operator = numMatch[2];
            const value = parseInt(numMatch[3]);
            const rowValue = parseInt(row[column]);

            switch (operator) {
                case '>':
                    return rowValue > value;
                case '<':
                    return rowValue < value;
                case '>=':
                    return rowValue >= value;
                case '<=':
                    return rowValue <= value;
                case '=':
                    return rowValue === value;
                default:
                    return true;
            }
        }

        // 处理LIKE操作 如: name LIKE '%张%'
        const likeMatch = whereClause.match(/(\w+)\s+like\s+'([^']+)'/i);
        if (likeMatch) {
            const column = likeMatch[1];
            const pattern = likeMatch[2].replace(/%/g, '.*');
            const regex = new RegExp(pattern, 'i');
            return row[column] && regex.test(row[column].toString());
        }

        return true;
    });
};

// 真实API调用（完善版）
const executeRealQuery = async (sql, options = {}) => {
    const { database = 'default', timeout = API_CONFIG.TIMEOUT, retryAttempts = API_CONFIG.RETRY_ATTEMPTS } = options;

    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.EXECUTE_SQL);

    // 重试逻辑
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.DEFAULT_HEADERS,
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    query: sql,
                    database,
                    options: {
                        timeout,
                        format: 'json', // 指定返回格式
                        includeMetadata: true, // 包含元数据
                        maxRows: 10000, // 最大返回行数
                    },
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorMessage = HTTP_ERROR_MESSAGES[response.status] || `HTTP错误: ${response.status}`;

                // 尝试获取详细错误信息
                try {
                    const errorData = await response.json();
                    // 如果服务器返回的是完整的错误响应对象，直接使用
                    if (errorData && typeof errorData === 'object') {
                        // 确保错误响应有success: false标记
                        errorData.success = false;
                        // 如果没有error字段但有message，将message赋值给error
                        if (!errorData.error && errorData.message) {
                            errorData.error = errorData.message;
                        }
                        return formatApiResponse(errorData);
                    } else {
                        // 如果只是简单的错误信息
                        const message = errorData.message || errorData.error || errorMessage;
                        throw new Error(message);
                    }
                } catch {
                    // 如果无法解析JSON，返回默认错误信息
                    throw new Error(errorMessage);
                }
            }

            const result = await response.json();

            // 验证并格式化响应数据
            return formatApiResponse(result);
        } catch (error) {
            // 如果是最后一次尝试，抛出错误
            if (attempt === retryAttempts) {
                throw handleApiError(error);
            }

            // 对于某些错误类型，不进行重试
            if (
                error.message.includes('语法错误') ||
                error.message.includes('认证失败') ||
                error.message.includes('权限不足')
            ) {
                throw handleApiError(error);
            }

            // 等待重试
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        }
    }
};

// 格式化API响应数据
const formatApiResponse = apiResult => {
    // 确保响应格式与模拟数据一致
    if (!apiResult) {
        throw new Error('服务器返回空数据');
    }

    // 如果是成功响应但没有success字段，视为成功
    const success = apiResult.success !== undefined ? apiResult.success : true;

    return {
        success: success,
        data: apiResult.data || [],
        rowCount: apiResult.rowCount || (apiResult.data ? apiResult.data.length : 0),
        rowsAffected: apiResult.rowsAffected || 0,
        message:
            apiResult.message ||
            (success ? `查询成功，返回 ${apiResult.data ? apiResult.data.length : 0} 行数据` : '查询失败'),
        error: apiResult.error || (success ? null : apiResult.message),
        metadata: apiResult.metadata, // 可能包含列信息等
        executionTime: apiResult.executionTime || 0, // 服务器端执行时间
    };
};

// 统一错误处理
const handleApiError = error => {
    if (error.name === 'AbortError') {
        return new Error('请求超时，请检查网络连接或稍后重试');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return new Error('网络连接失败，请检查后端服务是否启动');
    }

    // 网络错误
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return new Error('网络连接失败，请检查网络状态或后端服务');
    }

    return error;
};

// 主要的SQL执行函数
export const executeSqlQuery = async (sql, mode = 'mock', options = {}) => {
    if (!sql || !sql.trim()) {
        throw new Error('SQL查询语句不能为空');
    }

    if (mode === 'mock') {
        return await executeMockQuery(sql);
    } else {
        return await executeRealQuery(sql, options);
    }
};

// 检查API连接状态
export const checkApiConnection = async () => {
    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.HEALTH_CHECK);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                ...getAuthHeaders(),
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return {
            connected: response.ok,
            status: response.status,
            message: response.ok
                ? '连接正常'
                : `HTTP ${response.status}: ${HTTP_ERROR_MESSAGES[response.status] || '未知错误'}`,
            url: apiUrl,
        };
    } catch (error) {
        let errorMessage = '连接失败';

        if (error.name === 'AbortError') {
            errorMessage = '请求超时 (5秒)，请检查网络连接';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = `无法连接到 ${apiUrl}，请检查后端服务是否启动`;
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = `网络连接失败，目标地址: ${apiUrl}`;
        } else {
            errorMessage = `连接错误: ${error.message}`;
        }

        return {
            connected: false,
            status: 0,
            message: errorMessage,
            url: apiUrl,
            error: error.name,
        };
    }
};

/**
 * 导出Excel文件
 * @param {string} query - SQL查询语句
 * @param {string} database - 数据库名称
 * @param {string} filename - 文件名（不包含扩展名）
 * @param {Object} options - 额外选项
 * @returns {Promise} - 导出结果
 */
export const exportToExcel = async (query, database = 'mine', filename = 'query_result', options = {}) => {
    if (!query || !query.trim()) {
        throw new Error('SQL查询语句不能为空');
    }

    const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.EXPORT_EXCEL);

    // 生成时间戳
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');

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
                timestamp: timestamp,
                query: query,
                database: database,
                filename: filename,
                options: {
                    ...options,
                },
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorMessage = HTTP_ERROR_MESSAGES[response.status] || `HTTP错误: ${response.status}`;
            throw new Error(errorMessage);
        }

        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // 如果返回的是JSON，说明可能有错误
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || '导出Excel失败');
        }

        // 获取文件blob
        const blob = await response.blob();

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // 从响应头中获取文件名，或使用默认文件名
        const contentDisposition = response.headers.get('content-disposition');
        let downloadFilename = `${filename}_${new Date().getTime()}.xlsx`;

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
            message: `Excel文件导出成功: ${downloadFilename}`,
            filename: downloadFilename,
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('导出Excel请求超时，请稍后重试');
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('无法连接到导出服务，请检查网络连接');
        }

        throw error;
    }
};

// 获取模拟数据库的表结构信息
export const getMockTableSchema = () => {
    return {
        users: {
            columns: ['id', 'name', 'email', 'age', 'department', 'created_at'],
            description: '用户表',
        },
        orders: {
            columns: ['id', 'user_id', 'product', 'price', 'quantity', 'order_date', 'status'],
            description: '订单表',
        },
        products: {
            columns: ['id', 'name', 'category', 'price', 'stock', 'description'],
            description: '产品表',
        },
    };
};

// 获取示例SQL查询
export const getSampleQueries = () => {
    return [
        {
            title: '查询所有用户',
            sql: 'SELECT * FROM users;',
        },
        {
            title: '查询技术部员工',
            sql: "SELECT name, email, age FROM users WHERE department = '技术部';",
        },
        {
            title: '查询年龄大于30的用户',
            sql: 'SELECT name, age FROM users WHERE age > 30 ORDER BY age DESC;',
        },
        {
            title: '查询订单信息',
            sql: "SELECT * FROM orders WHERE status = '已完成' LIMIT 5;",
        },
        {
            title: '查询产品库存',
            sql: 'SELECT name, price, stock FROM products WHERE stock > 50;',
        },
        {
            title: '用户名模糊查询',
            sql: "SELECT * FROM users WHERE name LIKE '%张%';",
        },
    ];
};
