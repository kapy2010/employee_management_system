var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var superSecret = config.secret;

module.exports = function(app, express) {

  var apiRouter = express.Router();

  // route to generate sample user
  apiRouter.post('/sample', function(req, res) {
    User.findOne({ 'email': 'chris@gmail.com' }, function(err, user) {
      if (!user) {
        var sampleUser = new User();
        sampleUser.email = 'chris@gmail.com';
        sampleUser.password = 'supersecret';
        sampleUser.admin = true;
        sampleUser.save();
      res.json({
        success: true,
        message: 'Sample user created!'
        });
      }
    });
  });

  // route to authenticate a user and get token
  apiRouter.post('/authenticate', function(req, res) {
      User.findOne({
        email: req.body.email
      }).select('email admin password').exec(function(err, user) {
        if (err) throw err;

        if (!user) {
          res.json({
            success: false,
            message: 'Authentication failed. User not found.'
          });
        } else if (user) {
          var validPassword = user.comparePassword(req.body.password);
          if (!validPassword) {
            res.json({
              success: false,
              message: 'Authentication failed. Wrong password.'
            });
          } else {
            var token = jwt.sign({
              email: user.email,
              admin: user.admin
            }, superSecret, {
              expiresInMinutes: 1440
            });
            res.json({
              success: true,
              message: 'Enjoy your token!',
              token: token
            });
          }
        }
      });
    });

  // route middleware to verify token
  apiRouter.use(function(req, res, next) {
      var token = req.body.token || req.param('token') || req.headers['x-access\
-token'];

      if (token) {
        jwt.verify(token, superSecret, function(err, decoded) {
          if (err) {
            return res.status(403).send({
              success: false,
              message: 'Failed to authenticate token'
            });
          } else {
            req.decoded = decoded;
            next();
          }
        });
      } else {
        return res.status(403).send({
          success: false,
          message: 'No token provided.'
        });
      }
    });

  apiRouter.route('/users')

      // add new user
      .post(function(req, res) {
        if (!req.decoded['admin']) {
          return res.json({ success: false, message: 'Current user not admin!' });
        }

        var user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.phone = req.body.phone;
        if (req.body.admin) user.admin = req.body.admin;
        if (req.body.active) user.active = req.body.active;

        user.save(function(err) {
          if (err) {
            if (err.code == 11000)
              return res.json({ success: false, message: 'A user with that\
email already exists.' });
            else
              return res.send(err);
          }

        res.json({ message: 'Employee created!' });
        });
      })

      // get all users
      .get(function(req, res) {
        User.find(function(err, users) {
          if (err) res.send(err);

          res.json(users);
        });
      });

  apiRouter.route('/users/:user_id')

      // get the user with  this id
      .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
          if (err) res.send(err);

          res.json(user);
        });
      })

      // update a user
      .put(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
          if (err) res.send(err);

          if (!req.decoded['admin'] && !user.active) {
            return res.json({ success: false,
              message: 'Current user not admin!' });
          }

          if (req.body.firstname) user.firstname = req.body.firstname;
          if (req.body.lastname) user.lastname = req.body.lastname;
          if (req.body.phone) user.phone = req.body.phone;
          if (req.body.active && req.decoded['admin']) user.active = req.body.active;

          user.save(function(err) {
            if (err) res.send(err);

            res.json({ message: 'Employee updated!' });
          });
        });
      })

      // delete an employee
      .delete(function(req, res) {
        if (!req.decoded['admin']) {
          return res.json({ success: false, message: 'Current user not admin!' });
        }

        User.remove({ _id: req.params.user_id }, function(err, user) {
          if (err) res.send(err);

          res.json({ message: 'Successfully deleted!' });
        });
      });

  // api endpoint to get user information
  apiRouter.get('/me', function(req, res) {
    res.send(req.decoded);
  });

  return apiRouter;
}
