// CALL THE PACKAGES
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
var jwt = require('jsonwebtoken');
var Employee = require('./app/models/employee');
var Admin = require('./app/models/admin');
var superSecret = 'appzuiemployeemanagementsystem';

// APP CONFIGURATION
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,\
Authorization');
  next();
});

mongoose.connect('mongodb://localhost/');

app.use(morgan('dev'));

// ROUTES FOR OUR API

// ADMIN ROUTER
var adminRouter = express.Router();

adminRouter.post('/authenticate', function(req, res) {
  Admin.findOne({
    username: req.body.username
  }).select('name username password').exec(function(err, admin) {
    if (err) throw err;

    if (!admin) {
      res.json({
        success: false,
        message: 'Authentication failed. Admin not found.'
      });
    } else if (admin) {
      var validPassword = admin.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        var token = jwt.sign({
          name: admin.name,
          username: admin.username
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

// MIDDLEWARE FOR AUTHENTICATION
adminRouter.use(function(req, res, next) {
  var token = req.body.token || req.param('token') || req.headers['x-access-tok\
en'];

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

// CREATE AND ADMIN
adminRouter.post('/create_admin', function(req, res) {
    var admin = new Admin();
    admin.name = req.body.name;
    admin.username = req.body.username;
    admin.password = req.body.password;

    admin.save(function(err) {
      if (err) {
        if (err.code == 11000)
          return res.json({ success: false, message: 'An admin with that\
username already exists.' });
        else
          return res.send(err);
      }

    res.json({ message: 'Admin created!' });
    });
  });

// GET ALL ADMINS
adminRouter.get('/get_admin', function(req, res) {
  Admin.find(function(err, admins) {
      if (err) res.send(err);

      res.json(admins);
    });
});

adminRouter.route('/')
    // ADD NEW EMPLOYEE
    .post(function(req, res) {
      var emp = new Employee();
      emp.email = req.body.email;
      emp.password = req.body.password;
      emp.firstname = req.body.firstname;
      emp.lastname = req.body.lastname;
      emp.phone = req.body.phone;
      emp.status = req.body.status;

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

    // GET ALL EPMLOYEES
    .get(function(req, res) {
      Employee.find(function(err, employees) {
        if (err) res.send(err);

        res.json(employees);
      });
    });

adminRouter.route('/:emp_id')

    .get(function(req, res) {
      Employee.findById(req.params.emp_id, function(err, emp) {
        if (err) res.send(err);

        res.json(emp);
      });
    })

    // UPDATE AN EMPLOYEE
    .put(function(req, res) {
      Employee.findById(req.params.emp_id, function(err, emp) {
        if (err) res.send(err);

        if (req.body.firstname) emp.firstname = req.body.firstname;
        if (req.body.secondname) emp.secondname = req.body.secondname;
        if (req.body.phone) emp.phone = req.body.phone;
        if (req.body.status) emp.status = req.body.status;

        emp.save(function(err) {
          if (err) res.send(err);

          res.json({ message: 'Employee updated!' });
        });
      });
    })

    // DELETE AN EMPLOYEE
    .delete(function(req, res) {
      Employee.remove({ _id: req.params.emp_id }, function(err, emp) {
        if (err) res.send(err);

        res.json({ message: 'Successfully deleted!' });
      });
    });

app.use('/admin', adminRouter);

// EMPLOYEE ROUTER
var empRouter = express.Router();

empRouter.post('/authenticate', function(req, res) {
  Employee.findOne({
    email: req.body.email
  }).select('email password').exec(function(err, emp) {
    if (err) throw err;

    if (!emp) {
      res.json({
        success: false,
        message: 'Authentication failed. Employee not found.'
      });
    } else if (emp) {
      var validPassword = emp.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        var token = jwt.sign({
          email: emp.email,
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

// MIDDLEWARE FOR AUTHENTICATION
empRouter.use(function(req, res, next) {
  var token = req.body.token || req.param('token') || req.headers['x-access-tok\
en'];

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

empRouter.route('/')
    // GET ALL EMPLOYEES
    .get(function(req, res) {
      Employee.find(function(err, employees) {
        if (err) res.send(err);

        res.json(employees);
      });
    });

empRouter.route('/:emp_id')
    // GET A PARTICULAR EMPLOYEE
    .get(function(req, res) {
      Employee.findById(req.params.emp_id, function(err, emp) {
        if (err) res.send(err);

        res.json(emp);
      });
    })

    // UPDATE AN EMPLOYEE
    .put(function(req, res) {
      Employee.findById(req.params.emp_id, function(err, emp) {
        if (err) res.send(err);

        if (req.body.firstname) emp.firstname = req.body.firstname;
        if (req.body.secondname) emp.secondname = req.body.secondname;
        if (req.body.phone) emp.phone = req.body.phone;

        // CHECK IF IT IS ACTIVE
        if (emp.status == 'active') {
          emp.save(function(err) {
            if (err) res.send(err);

            res.json({ message: 'Employee updated!' });
          });
        } else {
          res.json({ message: 'Employee is not actived!' });
        }
      });
    });

app.use('/emp', adminRouter);



app.listen(port);
console.log('Server running on 127.0.0.1:' + port);
