angular.module('userApp', [
  'ngAnimate',
  'app.routes',
  'authService',
  'mainCtrl',
  'userCtrl',
  'userService'
]);

.controller('mainController', function($http) {

  var vm = this;

  $http.get('/emp/users')
    .then(function(data) {
      vm.users = data.users;
    });
});
