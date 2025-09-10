const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

admin.initializeApp();

const db = admin.firestore();

// Function to generate a random string for public link IDs
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.createLink = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { type, title, redirectUrl, tasks, password, hint } = data;
    const ownerId = context.auth.uid;

    if (!title || !redirectUrl) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    const newLink = {
        ownerId,
        type,
        title,
        redirectUrl,
        stats: { clicks: 0, completions: 0 },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        publicId: makeid(6)
    };

    if (type === 'task') {
        if (!tasks || tasks.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Task links must have at least one task.');
        }
        newLink.tasks = tasks;
    } else if (type === 'password') {
        if (!password) {
            throw new functions.https.HttpsError('invalid-argument', 'Password links must have a password.');
        }
        const salt = await bcrypt.genSalt(10);
        newLink.passwordHash = await bcrypt.hash(password, salt);
        if (hint) {
            newLink.hint = hint;
        }
    } else {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid link type.');
    }

    try {
        await db.collection('links').add(newLink);
        return { success: true };
    } catch (error) {
        console.error("Error creating link:", error);
        throw new functions.https.HttpsError('internal', 'Could not create link.');
    }
});

exports.startSession = functions.https.onCall(async (data, context) => {
    const { linkId } = data;
    if (!linkId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing linkId.');
    }

    const linkRef = db.collection('links').doc(linkId);
    const sessionRef = db.collection('linkSessions').doc();

    const batch = db.batch();
    batch.update(linkRef, { 'stats.clicks': admin.firestore.FieldValue.increment(1) });
    batch.set(sessionRef, {
        linkId,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        tasksCompleted: []
    });

    await batch.commit();

    return { sessionId: sessionRef.id };
});

exports.reportTaskCompleted = functions.https.onCall(async (data, context) => {
    const { sessionId, taskIndex } = data;
    if (!sessionId || taskIndex === undefined) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing sessionId or taskIndex.');
    }

    const sessionRef = db.collection('linkSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Session not found.');
    }

    const sessionData = sessionDoc.data();
    const linkRef = db.collection('links').doc(sessionData.linkId);
    const linkDoc = await linkRef.get();
    const linkData = linkDoc.data();

    // Enforce 10-second delay
    const startedAt = sessionData.startedAt.toDate();
    const now = new Date();
    if (now - startedAt < 10000) {
        throw new functions.https.HttpsError('failed-precondition', 'Task completed too quickly.');
    }

    if (!sessionData.tasksCompleted.includes(taskIndex)) {
        await sessionRef.update({
            tasksCompleted: admin.firestore.FieldValue.arrayUnion(taskIndex)
        });

        // If all tasks are completed, increment completions count
        if (sessionData.tasksCompleted.length + 1 === linkData.tasks.length) {
            await linkRef.update({ 'stats.completions': admin.firestore.FieldValue.increment(1) });
        }
    }

    return { success: true };
});

exports.verifyPassword = functions.https.onCall(async (data, context) => {
    const { linkId, password } = data;
    if (!linkId || !password) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing linkId or password.');
    }

    const linkRef = db.collection('links').doc(linkId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Link not found.');
    }

    const linkData = linkDoc.data();
    const isValid = await bcrypt.compare(password, linkData.passwordHash);

    if (isValid) {
        await linkRef.update({ 'stats.completions': admin.firestore.FieldValue.increment(1) });
        return { success: true, redirectUrl: linkData.redirectUrl };
    } else {
        return { success: false };
    }
});
