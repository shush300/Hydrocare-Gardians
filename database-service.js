// Database Service
import { firestore, realTimeDb } from './firebase-config.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { 
    ref, 
    set, 
    get, 
    onValue 
} from 'firebase/database';

class DatabaseService {
    constructor() {
        this.usersCollection = 'users';
        this.systemStatusRef = 'system_status';
    }

    // User Profile Methods
    async getUserProfile(userId) {
        try {
            const userDoc = await getDoc(doc(firestore, this.usersCollection, userId));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(userId, data) {
        try {
            await updateDoc(doc(firestore, this.usersCollection, userId), {
                ...data,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    async createUserProfile(userId, data) {
        try {
            await setDoc(doc(firestore, this.usersCollection, userId), {
                ...data,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                isActive: true,
                filterStatus: {
                    moringa: {
                        lastChanged: serverTimestamp(),
                        soakStartTime: null,
                        isActive: false
                    },
                    carbonate: {
                        lastChanged: serverTimestamp(),
                        cycleCount: 0
                    },
                    physical: {
                        lastChecked: serverTimestamp()
                    }
                }
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    // System Status Methods
    async updateSystemStatus(status) {
        try {
            await set(ref(realTimeDb, this.systemStatusRef), {
                ...status,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating system status:', error);
            throw error;
        }
    }

    async getSystemStatus() {
        try {
            const snapshot = await get(ref(realTimeDb, this.systemStatusRef));
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('Error getting system status:', error);
            throw error;
        }
    }

    // Real-time System Status Updates
    onSystemStatusChange(callback) {
        const statusRef = ref(realTimeDb, this.systemStatusRef);
        return onValue(statusRef, (snapshot) => {
            callback(snapshot.val());
        });
    }

    // Filter Status Methods
    async updateFilterStatus(userId, filterType, status) {
        try {
            const userRef = doc(firestore, this.usersCollection, userId);
            await updateDoc(userRef, {
                [`filterStatus.${filterType}`]: {
                    ...status,
                    lastUpdated: serverTimestamp()
                }
            });
        } catch (error) {
            console.error('Error updating filter status:', error);
            throw error;
        }
    }

    async getFilterStatus(userId, filterType) {
        try {
            const userDoc = await getDoc(doc(firestore, this.usersCollection, userId));
            return userDoc.exists() ? userDoc.data().filterStatus[filterType] : null;
        } catch (error) {
            console.error('Error getting filter status:', error);
            throw error;
        }
    }
}

// Create and export a single instance
const databaseService = new DatabaseService();
export default databaseService; 