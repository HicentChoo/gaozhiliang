import { initDatabase, createIndexes, initDefaultData } from './schema.js';

console.log('开始初始化数据库...');
initDatabase();
createIndexes();
initDefaultData();
console.log('数据库初始化完成！');




