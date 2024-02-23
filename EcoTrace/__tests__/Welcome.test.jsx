import 'react-native';
import React from 'react';
import WelcomeScreen from '../src/screens/welcome';
import renderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { act } from '@testing-library/react-native';

// (1) Snapshot Testing - ensure that changes to the UI are controlled and intentional
it('renders SignInScreen correctly', async () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  let tree;
  await act(async () => {
    tree = renderer.create(
      <NavigationContainer>
        <WelcomeScreen navigation={mockNavigation} />
      </NavigationContainer>
    );
  });
  expect(tree.toJSON()).toMatchSnapshot()

});