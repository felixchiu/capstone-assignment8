(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdTypeThings", {
      templateUrl: typeThingsTemplateUrl,
      controller: TypeThingsController,
      bindings: {
        authz: "<"
      }
    })
    .component("sdFilterTypesMap", {
      template: "<div id='map'></div>",
      controller: FilterTypesMapController,
      bindings: {
        zoom: "@"
      }
    });
    ;
 
  typeThingsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function typeThingsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.typethings_html;
  } 

  
  TypeThingsController.$inject = ["$scope",
                                     "$stateParams",
                                     "spa-demo.authz.Authz",
                                     "spa-demo.subjects.Type"];
  function TypeThingsController($scope, $stateParams, Authz, Type) {
    var vm=this;
    vm.updateThings = updateThings;
    vm.thingClicked = thingClicked;
    vm.isCurrentThing = isCurrentThing;
   
    vm.$onInit = function() {
      vm.types = Type.getTypes();        
    };

    return;
    //////////////
     function thingClicked(id) {
      Type.setCurrentThing(id);
    }  

    function isCurrentThing(id) {
      return Type.getCurrentThing() == id;
    }

    function updateThings() {
      Type.getThings({type_id: vm.selectedType}).$promise.then(
        function(value) {
          vm.items = value;
        },
        function(error) {
          console.log(error);
        });
    }
    
  }

FilterTypesMapController.$inject = ["$scope", "$q", "$element",
                                          "spa-demo.geoloc.currentOrigin",
                                          "spa-demo.geoloc.myLocation",
                                          "spa-demo.geoloc.Map",
                                          "spa-demo.subjects.Type",
                                          "spa-demo.config.APP_CONFIG"];
  function FilterTypesMapController($scope, $q, $element, 
                                        currentOrigin, myLocation, Map, Type, 
                                        APP_CONFIG) {
    var vm=this;

    vm.$onInit = function() {
      console.log("FilterTypesMapController",$scope);
    }
    vm.$postLink = function() {
      var element = $element.find('div')[0];
      getLocation().then(
        function(location){
          vm.location = location;
          initializeMap(element, location.position);
        });

       $scope.$watch(
         function() { return Type.getCurrentThing(); },
         function(thingid) { 
          if (thingid){
            updateImages(thingid); 
          }
        });

    }

    return;
    //////////////
    function getLocation() {
      var deferred = $q.defer();

      //use current address if set
      var location = currentOrigin.getLocation();
      if (!location) {
        //try my location next
        myLocation.getCurrentLocation().then(
          function(location){
            deferred.resolve(location);
          },
          function(){
            deferred.resolve({ position: APP_CONFIG.default_position});
          });
      } else {
        deferred.resolve(location);
      }

      return deferred.promise;
    }

    function initializeMap(element, position) {
      vm.map = new Map(element, {
        center: position,        
        zoom: vm.zoom || 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
    }

    function updateImages(thingid) {
       Type.getThingImages(thingid).$promise.then(
         function(images) { 
          console.log("inside updateImages", images);
           vm.images = images; 
           displayImages();
         },
         function(error) {
          console.log(error);
         });
    }

    function displayImages(){
      if (!vm.map) { return; }
      vm.map.clearMarkers();
      //vm.map.displayOriginMarker(vm.originInfoWindow(vm.location));

      angular.forEach(vm.images, function(ti){
       // console.log("calling foreach...")
        if (ti.position){
          displaySubject(ti);
        }
      });
    }

    function displaySubject(ti) {
      var markerOptions = {
        position: {
          lng: ti.position.lng,
          lat: ti.position.lat
        },
        thing_id: ti.thing_id,
        image_id: ti.image_id          
      };
 
        markerOptions.title = ti.image_caption;
        markerOptions.icon = APP_CONFIG.orphan_marker;
        markerOptions.content = vm.imageInfoWindow(ti);

      vm.map.displayMarker(markerOptions);    
    }
  }

  FilterTypesMapController.prototype.imageInfoWindow = function(ti) {
    console.log("imageInfo", ti);
    var html ="<div class='image-marker-info'><div>";
      html += "<span class='id image_id'>"+ ti.image_id+"</span>";
      if (ti.image_caption) {
        html += "<span class='image-caption'>"+ ti.image_caption + "</span>";      
      }
      html += "</div><img src='"+ ti.image_content_url+"?width=200'>";
      html += "</div>";
    return html;    
  }
})();
