package com.yupi.yuoj.service;

import com.yupi.yuoj.common.ErrorCode;
import com.yupi.yuoj.exception.BusinessException;
import com.yupi.yuoj.model.entity.User;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.util.DigestUtils;
import javax.annotation.Resource;
import java.util.UUID;

@SpringBootTest
public class UserServiceTest {

    @Resource
    private UserService userService;

    // 密码加密盐值（与实现类中保持一致）
    private static final String SALT = "yuoj_salt";

    @Test
    void userRegister_ValidInput_Success() {
        // 生成唯一账号名
        String userAccount = "testuser_" + UUID.randomUUID().toString().substring(0, 8);
        String userPassword = "ValidPass123";
        String checkPassword = "ValidPass123";

        // 执行注册
        long userId = userService.userRegister(userAccount, userPassword, checkPassword);

        // 验证结果
        Assertions.assertTrue(userId > 0, "应返回有效的用户ID");
    }

    @Test
    void userRegister_EmptyPassword_ThrowsException() {
        // 准备测试数据（空密码）
        String userAccount = "testuser_" + UUID.randomUUID().toString().substring(0, 8);
        String userPassword = "";
        String checkPassword = "";

        // 验证异常
        BusinessException exception = Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister(userAccount, userPassword, checkPassword);
        });

        // 验证错误信息
        Assertions.assertEquals(ErrorCode.PARAMS_ERROR.getCode(), exception.getCode());
        Assertions.assertTrue(exception.getMessage().contains("不能为空"), "错误信息应包含'不能为空'");
    }

    @Test
    void userRegister_ShortPassword_ThrowsException() {
        // 准备测试数据（短密码）
        String userAccount = "testuser_" + UUID.randomUUID().toString().substring(0, 8);
        String userPassword = "short";
        String checkPassword = "short";

        // 验证异常
        BusinessException exception = Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister(userAccount, userPassword, checkPassword);
        });

        // 验证错误信息
        Assertions.assertEquals(ErrorCode.PARAMS_ERROR.getCode(), exception.getCode());
        Assertions.assertTrue(exception.getMessage().contains("密码长度不能少于8位"), "错误信息应包含'密码长度不能少于8位'");
    }

    @Test
    void userRegister_PasswordMismatch_ThrowsException() {
        // 准备测试数据（密码不匹配）
        String userAccount = "testuser_" + UUID.randomUUID().toString().substring(0, 8);
        String userPassword = "Password123";
        String checkPassword = "Different123";

        // 验证异常
        BusinessException exception = Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister(userAccount, userPassword, checkPassword);
        });

        // 验证错误信息
        Assertions.assertEquals(ErrorCode.PARAMS_ERROR.getCode(), exception.getCode());
        Assertions.assertTrue(exception.getMessage().contains("两次输入的密码不一致"), "错误信息应包含'两次输入的密码不一致'");
    }

    @Test
    void userRegister_DuplicateAccount_ThrowsException() {
        // 创建唯一账号名
        String uniqueAccount = "duplicate_test_" + UUID.randomUUID().toString().substring(0, 8);
        String password = "TestPassword123";

        // 第一次注册（应成功）
        long userId = userService.userRegister(uniqueAccount, password, password);
        Assertions.assertTrue(userId > 0, "第一次注册应成功");

        // 第二次注册相同账号（应失败）
        BusinessException exception = Assertions.assertThrows(BusinessException.class, () -> {
            userService.userRegister(uniqueAccount, password, password);
        });

        // 验证错误信息
        Assertions.assertEquals(ErrorCode.PARAMS_ERROR.getCode(), exception.getCode());
        Assertions.assertTrue(exception.getMessage().contains("账号已存在"), "错误信息应包含'账号已存在'");
    }

    @Test
    void userRegister_PasswordEncryption_Correct() {
        // 准备测试数据
        String userAccount = "encryption_test_" + UUID.randomUUID().toString().substring(0, 8);
        String rawPassword = "TestEncrypt123";
        String checkPassword = "TestEncrypt123";

        // 执行注册
        long userId = userService.userRegister(userAccount, rawPassword, checkPassword);
        Assertions.assertTrue(userId > 0, "注册应成功");

        // 获取数据库中的用户
        User user = userService.getUserByAccount(userAccount);
        Assertions.assertNotNull(user, "用户应存在于数据库中");

        // 计算预期的加密密码
        String expectedEncryptedPassword = DigestUtils.md5DigestAsHex((SALT + rawPassword).getBytes());

        // 验证密码加密
        Assertions.assertEquals(
                expectedEncryptedPassword,
                user.getUserPassword(),
                "密码加密结果不符合预期"
        );
    }
}