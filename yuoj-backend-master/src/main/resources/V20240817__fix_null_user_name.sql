-- 修复现有数据：将user_name为null的记录设置为user_account
USE yuoj;
UPDATE `user`
SET user.userName = userAccount
WHERE userName IS NULL OR userName = '';