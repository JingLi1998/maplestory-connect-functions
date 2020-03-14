const functions = require('firebase-functions');
const { db } = require('./util/admin');
const app = require('express')();
const {
  getAllSmegas,
  postOneSmega,
  getSmega,
  deleteSmega,
  commentOnSmega,
  fameSmega,
  defameSmega
} = require('./handlers/smegas');
const {
  signup,
  login,
  addUserDetails,
  uploadImage,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

// Smega Routes
app.get('/smegas', getAllSmegas);
app.post('/smegas', FBAuth, postOneSmega);
app.get('/smegas/:smegaId', getSmega);
app.delete('/smegas/:smegaId', FBAuth, deleteSmega);
app.post('/smegas/:smegaId/comment', FBAuth, commentOnSmega);
app.get('/smegas/:smegaId/fame', FBAuth, fameSmega);
app.get('/smegas/:smegaId/defame', FBAuth, defameSmega);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/user', FBAuth, getAuthenticatedUser);
app.post('/user', FBAuth, addUserDetails);
app.post('/user/image', FBAuth, uploadImage);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnfame = functions.firestore
  .document('fame/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/smegas/${snapshot.data().smegaId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'fame',
            read: false,
            smegaId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

exports.deleteNotificationOndefame = functions.firestore
  .document('fame/{id}')
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document('comments/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/smegas/${snapshot.data().smegaId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            smegaId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

exports.onUserImageChange = functions.firestore
  .document('/users/{userId}')
  .onUpdate(change => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      let batch = db.batch();
      return db
        .collection('smegas')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const smega = db.doc(`/smegas/${doc.id}`);
            batch.update(smega, { userImage: change.after.data().imageUrl });
          });
          return db
            .collection('comments')
            .where('userHandle', '==', change.before.data().handle)
            .get();
        })
        .then(data => {
          data.forEach(doc => {
            const comment = db.doc(`/comments/${doc.id}`);
            batch.update(comment, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      return true;
    }
  });

exports.onSmegaDelete = functions.firestore
  .document('/smegas/{smegaId}')
  .onDelete((snapshot, context) => {
    const smegaId = context.params.smegaId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('smegaId', '==', smegaId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('fame')
          .where('smegaId', '==', smegaId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/fame/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('smegaId', '==', smegaId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => {
        console.error(err);
      });
  });
