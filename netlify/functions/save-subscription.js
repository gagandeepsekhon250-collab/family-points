const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const { fid, uid, subscription } = JSON.parse(event.body);
    if (!fid || !uid || !subscription) return { statusCode: 400, body: 'Missing fields' };
    await admin.database().ref('families/' + fid + '/push/' + uid).set(subscription);
    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
