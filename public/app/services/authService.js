angular.module('authService', [])

.factory('AuthToken', function($window) {

  var authTokenFactory = {};

  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  };

  authTokenFactory.setToken = function(token) {
    if (token)
      $window.localStorage.setItem('token', token);
    else
      $window.localStorage.setItem('token');
  };

  return authTokenFactory;

})

.factory('Auth', function($http, $q, AuthToken) {

  var authFactory = {};

  authFactory.login = function(email, password) {
    return $http.post('/api/authenticate', {
      email: email,
      password: password
    })
      .success(function(data) {
        AuthToken.setToken(data.token);
        return data;
      });
  };

  authFactory.logout = function() {
    if (AuthToken.getToken())
      return true;
    else
      return false;
  };

  authFactory.isLoggedIn = function() {
    if (AuthToken.getToken())
      return true;
    else
      return false;
  };

  authFactory.getUser = function() {
    if (AuthToken.getToken())
      return $http.get('/api/me', { cache: true });
    else
      return $q.reject({ message: 'User has no token.' });
  };

  authFactory.createSampleUser = function() {
    $http.post('/api/sample');
  };

  return authFactory;

})

.factory('AuthInterceptor', function($q, $location, AuthToken) {

  var interceptorFactory = {};

  interceptorFactory.request = function(config) {
    var token = AuthToken.getToken();
    if (token)
      config.headers['x-access-header'] = token;
    return config;
  };

  interceptorFactory.responseError = function(response) {
    if (response.status == 403) {
      AuthToken.setToken();
      $location.path('/login');
    }
    return $q.reject(response);
  };

  return interceptorFactory;

});
