app.controller('ToastController', function($scope, $mdToast, $animate) {

  $scope.$on('event:showToast', function(e, args) {
    $scope.showSimpleToast(args);
  });

  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };
  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };
  $scope.showCustomToast = function() {
    $mdToast.show({
      controller: 'ToastCtrl',
      templateUrl: 'toast-template.html',
      hideDelay: 6000,
      position: $scope.getToastPosition()
    });
  };
  $scope.showSimpleToast = function(content) {
    $mdToast.show(
      $mdToast.simple()
        .content(content)
        .position($scope.getToastPosition())
        .hideDelay(3000)
    );
  };
  $scope.showActionToast = function() {
    var toast = $mdToast.simple()
          .content('Action Toast!')
          .action('OK')
          .highlightAction(false)
          .position($scope.getToastPosition());
    $mdToast.show(toast).then(function() {
      alert('You clicked \'OK\'.');
    });
  };
})
.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});
