(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .service("spa-demo.subjects.Type", Type);

  Type.$inject = ["$resource","spa-demo.config.APP_CONFIG"];
  function Type($resource, APP_CONFIG) {
    var types = $resource(APP_CONFIG.server_url + "/api/types");
    var typethings = $resource(APP_CONFIG.server_url + "/api/filtertype");
    var thingimages = $resource(APP_CONFIG.server_url + "/api/things/:thing_id/thing_images",
      {thing_id: '@thing_id'},{});

    var service = this;
    service.getThings = getThings;
    service.getTypes = getTypes;
    service.getThingImages = getThingImages;
    service.currentThing = null;
    service.getCurrentThing = getCurrentThing;
    service.setCurrentThing = setCurrentThing;
    return; 
    ///////////////////

    function getThings(params) {
      return typethings.query(params);
    }

    function getTypes() {
      return types.query();
    }

    function getThingImages() {
      return thingimages.query({thing_id: service.currentThing, position: true});
    }

    function getCurrentThing() {
      return service.currentThing;
    }

     function setCurrentThing(thingid) {
        service.currentThing = thingid;
    }
  }
})();