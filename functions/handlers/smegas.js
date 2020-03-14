const { db } = require('../util/admin');

exports.getAllSmegas = (req, res) => {
  db.collection('smegas')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let smegas = [];
      data.forEach(doc => {
        smegas.push({
          smegaId: doc.id,
          ...doc.data()
        });
      });
      return res.json(smegas);
    })
    .catch(err => console.log(err));
};

exports.postOneSmega = (req, res) => {
  const newSmega = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
    userImage: req.user.imageUrl,
    fameCount: 0,
    commentCount: 0
  };

  db.collection('smegas')
    .add(newSmega)
    .then(doc => {
      const resSmega = newSmega;
      resSmega.smegaId = doc.id;
      res.json({ resSmega });
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
};

exports.getSmega = (req, res) => {
  let smegaData = {};
  db.doc(`/smegas/${req.params.smegaId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Smega not found' });
      }
      smegaData = doc.data();
      smegaData.smegaId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('smegaId', '==', req.params.smegaId)
        .get();
    })
    .then(data => {
      smegaData.comments = [];
      data.forEach(doc => {
        smegaData.comments.push(doc.data());
      });
      return res.json(smegaData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.deleteSmega = (req, res) => {
  const document = db.doc(`/smegas/${req.params.smegaId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Smega not found' });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Smega deleted successfully' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.commentOnSmega = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    smegaId: req.params.smegaId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/smegas/${req.params.smegaId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Smega not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};

exports.fameSmega = (req, res) => {
  const fameDocument = db
    .collection('fame')
    .where('userHandle', '==', req.user.handle)
    .where('smegaId', '==', req.params.smegaId)
    .limit(1);

  const smegaDocument = db.doc(`/smegas/${req.params.smegaId}`);

  let smegaData;

  smegaDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        smegaData = doc.data();
        smegaData.smegaId = doc.id;
        return fameDocument.get();
      } else {
        return res.status(404).json({ error: 'Smega not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection('fame')
          .add({
            smegaId: req.params.smegaId,
            userHandle: req.user.handle
          })
          .then(() => {
            smegaData.fameCount++;
            return smegaDocument.update({ fameCount: smegaData.fameCount });
          })
          .then(() => {
            return res.json(smegaData);
          });
      } else {
        return res.status(400).json({ error: 'Smega already famed' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.defameSmega = (req, res) => {
  const fameDocument = db
    .collection('fame')
    .where('userHandle', '==', req.user.handle)
    .where('smegaId', '==', req.params.smegaId)
    .limit(1);

  const smegaDocument = db.doc(`/smegas/${req.params.smegaId}`);

  let smegaData;

  smegaDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        smegaData = doc.data();
        smegaData.smegaId = doc.id;
        return fameDocument.get();
      } else {
        return res.status(404).json({ error: 'Smega not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: 'Smega not famed' });
      } else {
        return db
          .doc(`fame/${data.docs[0].id}`)
          .delete()
          .then(() => {
            smegaData.fameCount--;
            return smegaDocument.update({ fameCount: smegaData.fameCount });
          })
          .then(() => {
            return res.json(smegaData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
