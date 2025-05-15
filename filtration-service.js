// Filtration Service

class FiltrationService {
    constructor() {
        this.db = firebase.firestore();
        this.rtdb = firebase.database();
        this.auth = firebase.auth();
    }

    // Start filtration cycle
    async startFiltration() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            // Create new filtration cycle record
            const cycleRef = await this.db.collection('filtrationCycles').add({
                userId: user.uid,
                startTime: firebase.firestore.FieldValue.serverTimestamp(),
                endTime: null,
                status: 'running',
                type: 'manual'
            });

            // Update real-time status
            await this.rtdb.ref(`systemStatus/${user.uid}/filtration`).set({
                isRunning: true,
                cycleId: cycleRef.id,
                startTime: firebase.database.ServerValue.TIMESTAMP
            });

            // Update carbonate filter cycle count
            const userRef = this.db.collection('users').doc(user.uid);
            await userRef.update({
                'filterStatus.carbonate.cycleCount': firebase.firestore.FieldValue.increment(1)
            });

            return cycleRef.id;
        } catch (error) {
            console.error('Error starting filtration:', error);
            throw error;
        }
    }

    // Stop filtration cycle
    async stopFiltration() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            // Get current cycle
            const statusRef = this.rtdb.ref(`systemStatus/${user.uid}/filtration`);
            const status = await statusRef.get();
            const cycleId = status.val()?.cycleId;

            if (cycleId) {
                // Update cycle record
                await this.db.collection('filtrationCycles').doc(cycleId).update({
                    endTime: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'completed'
                });

                // Update real-time status
                await statusRef.update({
                    isRunning: false,
                    cycleId: null
                });
            }
        } catch (error) {
            console.error('Error stopping filtration:', error);
            throw error;
        }
    }

    // Start irrigation
    async startIrrigation() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            // Create new irrigation cycle record
            const cycleRef = await this.db.collection('irrigationCycles').add({
                userId: user.uid,
                startTime: firebase.firestore.FieldValue.serverTimestamp(),
                endTime: null,
                status: 'running',
                type: 'manual'
            });

            // Update real-time status
            await this.rtdb.ref(`systemStatus/${user.uid}/irrigation`).set({
                isRunning: true,
                cycleId: cycleRef.id,
                startTime: firebase.database.ServerValue.TIMESTAMP
            });

            return cycleRef.id;
        } catch (error) {
            console.error('Error starting irrigation:', error);
            throw error;
        }
    }

    // Stop irrigation
    async stopIrrigation() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            // Get current cycle
            const statusRef = this.rtdb.ref(`systemStatus/${user.uid}/irrigation`);
            const status = await statusRef.get();
            const cycleId = status.val()?.cycleId;

            if (cycleId) {
                // Update cycle record
                await this.db.collection('irrigationCycles').doc(cycleId).update({
                    endTime: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'completed'
                });

                // Update real-time status
                await statusRef.update({
                    isRunning: false,
                    cycleId: null
                });
            }
        } catch (error) {
            console.error('Error stopping irrigation:', error);
            throw error;
        }
    }

    // Schedule filtration
    async scheduleFiltration(startTime) {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            await this.db.collection('schedules').add({
                userId: user.uid,
                type: 'filtration',
                startTime: startTime,
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error scheduling filtration:', error);
            throw error;
        }
    }

    // Schedule irrigation
    async scheduleIrrigation(startTime) {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            await this.db.collection('schedules').add({
                userId: user.uid,
                type: 'irrigation',
                startTime: startTime,
                isActive: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error scheduling irrigation:', error);
            throw error;
        }
    }

    // Start Moringa soaking timer
    async startMoringaSoak() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            await this.db.collection('users').doc(user.uid).update({
                'filterStatus.moringa.soakStartTime': firebase.firestore.FieldValue.serverTimestamp(),
                'filterStatus.moringa.isActive': true
            });
        } catch (error) {
            console.error('Error starting moringa soak:', error);
            throw error;
        }
    }

    // Reset filter status
    async resetFilter(filterType) {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            const update = {};
            switch (filterType) {
                case 'moringa':
                    update['filterStatus.moringa'] = {
                        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                        soakStartTime: null,
                        isActive: false
                    };
                    break;
                case 'carbonate':
                    update['filterStatus.carbonate'] = {
                        lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                        cycleCount: 0
                    };
                    break;
                case 'physical':
                    update['filterStatus.physical.lastChecked'] = firebase.firestore.FieldValue.serverTimestamp();
                    break;
            }

            await this.db.collection('users').doc(user.uid).update(update);
        } catch (error) {
            console.error('Error resetting filter:', error);
            throw error;
        }
    }

    // Get filter status
    async getFilterStatus() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            const doc = await this.db.collection('users').doc(user.uid).get();
            return doc.data()?.filterStatus;
        } catch (error) {
            console.error('Error getting filter status:', error);
            throw error;
        }
    }

    // Get annual report data
    async getAnnualReport() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('No user logged in');

        try {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            const [filtrationCycles, irrigationCycles] = await Promise.all([
                this.db.collection('filtrationCycles')
                    .where('userId', '==', user.uid)
                    .where('startTime', '>=', oneYearAgo)
                    .orderBy('startTime', 'desc')
                    .get(),
                this.db.collection('irrigationCycles')
                    .where('userId', '==', user.uid)
                    .where('startTime', '>=', oneYearAgo)
                    .orderBy('startTime', 'desc')
                    .get()
            ]);

            return {
                filtrationCycles: filtrationCycles.docs.map(doc => ({id: doc.id, ...doc.data()})),
                irrigationCycles: irrigationCycles.docs.map(doc => ({id: doc.id, ...doc.data()}))
            };
        } catch (error) {
            console.error('Error getting annual report:', error);
            throw error;
        }
    }
} 