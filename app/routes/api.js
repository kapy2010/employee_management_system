var User = require('../models/user');
var Employee = require('../models/employee');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var superSecret = config.secret;

module.exports = function(app, express) {

  var apiRouter = express.Router();

  // route to authenticate a user and get token
  apiRouter.post('/authenticate', function(req, res) {
    User.findOne({
      username: req.body.username
    }).select('name username password').exec(function(err, user) {
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
            name: user.name,
            username: user.username
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
    var token = req.body.token || req.param('token') || req.headers['x-access-\
token'];

    if (token) {
      jwt.verify(token, superSecret, function(err, decoded) {
        if (err) {
          return res.status(403).send({
            success: false,
            message: 'Failed to authenticate token'
          });
        } else {
          req.decoded = decoded;
          User.findOne({ 'username': decoded['username'] }, function(err, user) {
            if (err) res.send(err);
            req.is_admin = user.admin;
          });
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

      // create a user
      .post(function(req, res) {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        if (req.is_admin) {
          if (req.body.admin) user.admin = req.body.admin;
        }

        user.save(function(err) {
          if (err) {
            if (err.code == 11000)
              return res.json({ success: false, message: 'A user with that\
    username already exists.' });
            else
              return res.send(err);
          }

        res.json({ message: 'User created!' });
        });
      })

      // get all users
      .get(function(req, res) {
        User.find(function(err, users) {
        if (err) res.send(err);

        res.json(users);
        });
      });

  apiRouter.route('/emp')

      // add new employee
      .post(function(req, res) {
        if (!req.is_admin) {
          return res.json({ success: false, message: 'Current user not admin!' });
        }

        var emp = new Employee();
        emp.email = req.body.email;
        emp.firstname = req.body.firstname;
        emp.lastname = req.body.lastname;
        emp.phone = req.body.phone;
        if (req.body.active) emp.active = req.body.active;

        emp.save(function(err) {
          if (err) {
            if (err.code == 11000)
              return res.json({ success: false, message: 'A user with that\
      username already exists.' });
            else
              return res.send(err);
          }

        res.json({ message: 'Employee created!' });
        });
      })

      // get all employees
      .get(function(req, res) {
        Employee.find(function(err, employees) {
          if (err) res.send(err);

          res.json(employees);
        });
      });

  apiRouter.route('/emp/:emp_id')

      // get the employee with  this id
      .get(function(req, res) {
        Employee.findById(req.params.emp_id, function(err, emp) {
          if (err) res.send(err);

          res.json(emp);
        });
      })

      // update an employee
      .put(function(req, res) {
        Employee.findById(req.params.emp_id, function(err, emp) {
          if (err) res.send(err);

          if (!req.is_admin && !emp.active) {
            return res.json({ success: false,
              message: 'Current user not admin!' });
          }

          if (req.body.firstname) emp.firstname = req.body.firstname;
          if (req.body.secondname) emp.secondname = req.body.secondname;
          if (req.body.phone) emp.phone = req.body.phone;
          if (req.body.active && req.is_admin) emp.active = req.body.active;

          emp.save(function(err) {
            if (err) res.send(err);

            res.json({ message: 'Employee updated!' });
          });
        });
      })

      // delete an employee
      .delete(function(req, res) {
        if (!req.is_admin) {
          return res.json({ success: false, message: 'Current user not admin!' });
        }

        Employee.remove({ _id: req.params.emp_id }, function(err, emp) {
          if (err) res.send(err);

          res.json({ message: 'Successfully deleted!' });
        });
      });

  return apiRouter;
}
