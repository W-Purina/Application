import {
    saveOrUpdateUserName,
    fetchUsername,
    fetchYearlyCarbonEmissionGoal,
    updateYearlyCarbonEmissionGoal,
    saveVehicleInfo,
    updateVehicleInfo,
    fetchVehicleInfo,
    fetchSpecificVehicleInfo,
    deleteVehicleInfo,
    saveDailyCarbonEmission,
    updateDailyCarbonEmission,
    getDailyCarbonEmission,
    getWeeklyCarbonEmission,
    getMonthlyCarbonEmission,
    getYearlyCarbonEmission,
    fetchUsertotalCarbonEmission,
    updateUserTotalCarbonEmission,
    saveToUserHistory,
    deleteRecordFromHistory,
    updateRecordInHistory,
    fetchHistory,
    fetchUserRewardPoints,
    updateRewardPoints,
    fetchAllHelpInfo,
    fetchHelpInfoById,
    fetchAllQuiz,
    createAndStoreUserQuiz,
    fetchUserQuizData,
    updateQuizStatus,
    fetchAllCoupon,
    saveSelectedProductToUserCoupon,
    fetchUserCoupon,
    saveOrUpdateUserCoupon,
    fetchReadHelpInfoIds,
    addHelpInfoIdToReadIds,
} from "../src/screens/firestore";
import { setDoc, getDoc, doc, collection, getDocs, query, deleteDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { firestore } from '@react-native-firebase/firestore';


const mockUserData = {
    name: 'Test User',
    yearlyCarbonEmissionGoal: 1000,

};

const mockCouponData = [
    {
        id: '1',
        name: 'New World Toys Coupon',
        intro: 'Thank you for choosing New World Toys! We have prepared an exclusive coupon for you to make your toy shopping journey more affordable...',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/project-id.appspot.com/o/coupon4.png?alt=media&token=token-value',
        price: 20
    },

];



// 单元测试
describe('Firestore Operations with firebase/firestore', () => {

    describe('fetchUsername', () => {
        beforeEach(() => {
            getDoc.mockResolvedValue({
                exists: jest.fn(() => true),
                data: jest.fn(() => mockUserData)
            });

        });

        it('fetches and returns user name', async () => {
            const userId = 'testUserId';
            const username = await fetchUsername(userId);
            expect(username).toEqual(mockUserData.name);
        });

        it('returns "KeepReal" when no name is found', async () => {
            getDoc.mockResolvedValueOnce({
                exists: jest.fn(() => true), 
                data: jest.fn(() => ({}))
            });
            const userId = 'testUserId';
            const username = await fetchUsername(userId);
            expect(username).toEqual('KeepReal');
        });
    });


    describe('fetchAllCoupon', () => {
        beforeEach(() => {
            getDocs.mockResolvedValue({
                docs: mockCouponData.map(data => ({
                    id: data.id,
                    data: () => data
                }))
            });
        });

        it('fetches and returns Coupon data', async () => {
            const Couponlist = await fetchAllCoupon();
            expect(Couponlist).toEqual(mockCouponData);
        });

        it('handles errors and returns empty array', async () => {
            getDocs.mockImplementationOnce(() => Promise.reject(new Error('Error fetching Coupon list')));
            const Couponlist = await fetchAllCoupon();
            expect(Couponlist).toEqual([]);
        });
    });

});