import { registerUser } from "../src/screens/firestore";
import { createUserWithEmailAndPassword } from 'firebase/auth';

// 单元测试
describe('Firebase Authentication', () => {
    // Testing the user registration function
    describe('registerUser', () => {
        it('successfully registers a user', async () => {
            // Mock a successful call to createUserWithEmailAndPassword and check if the function returns the correct userID
            createUserWithEmailAndPassword.mockResolvedValue({
                user: { uid: 'testUserId' }
            });

            const response = await registerUser('test@example.com', 'password123');
            expect(response).toEqual({ success: true, userId: 'testUserId' });
        });

        it('handles registration errors', async () => {
            // Mock a failed registration: email already exists
            createUserWithEmailAndPassword.mockImplementation(() => Promise.reject({
                code: 'auth/email-already-in-use'
            }));

            const response = await registerUser('test@example.com', 'password123');
            expect(response).toEqual({ success: false, error: 'This email is already in use.' });
        });
    });



});
