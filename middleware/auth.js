import admin from 'firebase-admin';

const auth = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // verify firebase token
    admin
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        req.user = decodedToken; // to get id use decodedToken.uid
        next();
        // res.status(200).send(decodedToken);
      })
      .catch(() => {
        res.status(403).send('Unauthorized');
      });
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;
