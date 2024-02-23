import 'react-native';
import React from 'react';
import SignInScreen from '../src/screens/signin';
import { UserProvider } from '../src/screens/userContext';
import { NavigationContainer } from '@react-navigation/native';
import renderer from 'react-test-renderer';
import { render, fireEvent, act } from '@testing-library/react-native';

// (1) Snapshot Testing - ensure that changes to the UI are controlled and intentional
it('renders SignInScreen correctly', async () => {

  const mockNavigation = {
    navigate: jest.fn(),
  };

  let tree;
  await act(async () => {
    tree = renderer.create(
      <UserProvider>
        <NavigationContainer>
          <SignInScreen navigation={mockNavigation} />
        </NavigationContainer>
      </UserProvider>
    );
  });
  expect(tree.toJSON()).toMatchSnapshot()
});


// (2) Component interactive testing
describe('SignInScreen', () => {
  it('fills out the form and presses the sign-in button', async () => {
    // 创建一个模拟的navigate函数用于测试导航功能
    const mockNavigate = jest.fn();
    // 渲染SignInScreen组件
    const { getByPlaceholderText, getByText } = render(
      <UserProvider>
        <NavigationContainer>
          <SignInScreen navigation={{ navigate: mockNavigate }} />
        </NavigationContainer>
      </UserProvider>
    );

    // 查找邮箱和密码输入框, “SIGN IN”按钮
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('SIGN IN');

    // 使用act包裹异步操作
    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signInButton);
    });

    // expect(mockNavigate).toHaveBeenCalledWith('BottomTabs');

  });

  it('displays an error message for invalid email format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <UserProvider>
        <NavigationContainer>
          <SignInScreen navigation={{ navigate: jest.fn() }} />
        </NavigationContainer>
      </UserProvider>
    );

    const emailInput = getByPlaceholderText('Email');
    await act(async () => {
      fireEvent.changeText(emailInput, 'invalidemail');
    });

    expect(getByText('Invalid email format')).toBeTruthy();
  });

  it('navigates to forgot password screen', async () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(
      <UserProvider>
        <NavigationContainer>
          <SignInScreen navigation={{ navigate: mockNavigate }} />
        </NavigationContainer>
      </UserProvider>
    );

    const forgotPasswordButton = getByText('Forgot your password?');
    await act(async () => {
      fireEvent.press(forgotPasswordButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('Forgot Password');
  });

});