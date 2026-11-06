const { getConnection } = require('./config/db');

(async () => {
    try {
        await getConnection();
        console.log('✅ 连接成功！');
    } catch (err) {
        console.error('❌ 连接失败:', err.message);
    }
})();