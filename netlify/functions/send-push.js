const admin = require('firebase-admin');
const webpush = require('web-push');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const { fid, uid, title, body } = JSON.parse(event.body);
    if (!fid || !uid) return { statusCode: 400, body: 'Missing fields' };
    const snap = await admin.database().ref('families/' + fid + '/push/' + uid).get();
    const sub = snap.val();
    if (!sub) return { statusCode: 200, body: 'no subscription on file' };
    const payload = JSON.stringify({ title: title || 'Family Points', body: body || '' });
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await admin.database().ref('families/' + fid + '/push/' + uid).remove();
      }
      throw err;
    }
    return { statusCode: 200, body: 'sent' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
