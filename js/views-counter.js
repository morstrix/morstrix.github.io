(function() {
    const counterEl = document.getElementById('viewsCount');
    if (!counterEl) return;

    const firebaseConfig = {
        apiKey: 'AIzaSyD7HW4Ec9n3vl5l_WgTSwiK5NpyQYE6tlU',
        authDomain: 'helper-e10b2.firebaseapp.com',
        databaseURL: 'https://helper-e10b2-default-rtdb.europe-west1.firebasedatabase.app/',
        projectId: 'helper-e10b2',
        storageBucket: 'helper-e10b2.firebasestorage.app',
        messagingSenderId: '131536876451',
        appId: '1:131536876451:web:eeaef494c83dfc4849e016'
    };

    async function initViewsCounter() {
        try {
            const [{ initializeApp, getApps, getApp }, { getDatabase, ref, onValue, runTransaction }] = await Promise.all([
                import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js')
            ]);

            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const db = getDatabase(app);
            const visitsRef = ref(db, 'visits');

            onValue(visitsRef, (snapshot) => {
                const value = snapshot.val();
                counterEl.textContent = Number.isFinite(value) ? String(value) : String(value || 0);
            }, () => {
                counterEl.textContent = '0';
            });

            await runTransaction(visitsRef, (currentValue) => {
                const safeValue = typeof currentValue === 'number' ? currentValue : 0;
                return safeValue + 1;
            });
        } catch (error) {
            console.warn('Views counter failed', error);
            counterEl.textContent = '--';
        }
    }

    initViewsCounter();
})();
