require([
    "esri/arcgis/Portal", "esri/arcgis/OAuthInfo", "esri/IdentityManager",
    "dojo/dom-style", "dojo/dom-attr", "dojo/dom", "dojo/on", "dojo/_base/array",
    "dojo/domReady!"
  ], function (arcgisPortal, OAuthInfo, esriId,
    domStyle, domAttr, dom, on, arrayUtils){
    var info = new OAuthInfo({
      appId: "ZkkhbM0Eaws3OlbX",
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

          domAttr.set("userId", "innerHTML", portalUser.fullName);
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

      //See list of valid item types here:  http://www.arcgis.com/apidocs/rest/index.html?itemtypes.html
      //See search reference here:  http://www.arcgis.com/apidocs/rest/index.html?searchreference.html
      var queryParams = {
        q: "owner:" + portalUser.username + " AND type:\"Feature Service\"",
        sortField: "numViews",
        sortOrder: "desc",
        num: 100
      };

      portal.queryItems(queryParams).then(createGallery);
    }

    function createGallery(items){
      console.log(items);
      var htmlFragment = "";

      arrayUtils.forEach(items.results, function (item){
        htmlFragment += (
        "<div class=\"esri-item-container\">" +
        (
          item.thumbnailUrl ?
          "<div class=\"esri-image\" style=\"background-image:url(" + item.thumbnailUrl + ");\"></div>" :
            "<div class=\"esri-image esri-null-image\">Thumbnail not available</div>"
        ) +
        (
          item.title ?
          "<div class=\"esri-title\">" + (item.title || "") + "</div>" :
            "<div class=\"esri-title esri-null-title\">Title not available</div>"
        ) +
        "</div>"
        );
      });

      dom.byId("itemGallery").innerHTML = htmlFragment;
    }
  });