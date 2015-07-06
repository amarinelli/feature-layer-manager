require([
    "esri/arcgis/Portal", "esri/arcgis/OAuthInfo", "esri/IdentityManager",
    "dojo/dom-style", "dojo/dom-attr", "dojo/dom", "dojo/on", "dojo/_base/array",
    "dojo/domReady!"
  ], function (arcgisPortal, OAuthInfo, esriId,
    domStyle, domAttr, dom, on, arrayUtils){

    var info = new OAuthInfo({
      appId: "08amyvihKU2DfcxZ",
      // Uncomment this line to prevent the user's signed in state from being shared
      // with other apps on the same domain with the same authNamespace value.
      //authNamespace: "portal_oauth_inline",
      popup: false
    });
    esriId.registerOAuthInfos([info]);

    esriId.checkSignInStatus(info.portalUrl).then(
      function (){
        displayItems();
      }
    ).otherwise(
      function (){
        // Anonymous view
        domStyle.set("anonymousPanel", "display", "block");
        domStyle.set("personalizedPanel", "display", "none");
      }
    );

    on(dom.byId("sign-in"), "click", function (){
      console.log("click", arguments);
      // user will be redirected to OAuth Sign In page
      esriId.getCredential(info.portalUrl);
    });

    on(dom.byId("sign-out"), "click", function (){
      esriId.destroyCredentials();
      window.location.reload();
    });

    function displayItems(){

      new arcgisPortal.Portal("https://www.arcgis.com").signIn().then(
        function (portalUser){
          console.log("Signed in to the portal: ", portalUser);

          domAttr.set("userId", "innerHTML", portalUser.fullName + "<span class='caret'>");
          domStyle.set("anonymousPanel", "display", "none");
          domStyle.set("personalizedPanel", "display", "block");

          queryPortal(portalUser);
        }
      ).otherwise(
        function (error){
          console.log("Error occurred while signing in: ", error);
        }
      );
    }

    function queryPortal(portalUser){
      var portal = portalUser.portal;

      numbItems = 0;

      portalUser.getItems().then(function(rootItems){
        $('#featureSelect').append($('<optgroup>', {
              label: 'Root',
              id: 'root'
        }));

        rootItems.forEach(function(rootItem){
          if (rootItem.typeKeywords.indexOf("Hosted Service") >= 0) {
            numbItems += 1;
            $('#root').append($('<option>', {
                    text: rootItem.title,
                    class: 'select-item',
                    'data-content': "<span style='padding-left: 10px;'>" + rootItem.title + "</span>"
            }));
          };
        });
      });

      portalUser.getFolders().then(function(folders){
        folders.forEach(function(folder){
          $('#featureSelect').append($('<optgroup>', {
              label: folder.title,
              id: folder.title.replace(" ", "-")
          }));

          folder.getItems().forEach(function(item){
            if (item.typeKeywords.indexOf("Hosted Service") >= 0) {
              numbItems += 1;
              $('#' + folder.title.replace(" ", "-")).append($('<option>', {
                  text: item.title,
                  class: 'select-item',
                  'data-content': "<span style='padding-left: 10px;'>" + item.title + "</span>"
              }));
            }
          }).then(function(){
            domAttr.set("numbItems", "innerHTML", numbItems);

            $('#featureSelect').selectpicker('refresh');
            $('#inputs').fadeIn(800);
          })
        });
      });
    }
  }); // end require

$( document ).ready(function() {
  console.log("ready");
  $('.selectpicker').selectpicker({
      style: 'btn-primary',
      size: "auto"
  });

  $( "#featureSelect" ).change(function() {
    console.log($('#featureSelect').val());
  });

  $('#GitHub-logo, #Home-logo').popover({'trigger': 'hover'});
}); // end ready
