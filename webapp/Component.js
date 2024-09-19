jQuery.sap.declare("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.Component");

// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "cross.fnd.fiori.inbox",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/CA_FIORI_INBOX"
	// we use a URL relative to our own component
	// extension application is deployed with customer namespace
});

cross.fnd.fiori.inbox.Component.extend("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.Component", {
	metadata: {
		manifest: "json"
	},
	/**
	 * Initialize the application
	 *
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent: function () {
		const models = sap.ui.require("cross/fnd/fiori/inbox/model/models");
		const ErrorHandler = sap.ui.require("cross/fnd/fiori/inbox/controller/ErrorHandler");
		const StartupParameters = sap.ui.require("cross/fnd/fiori/inbox/util/StartupParameters");
		const HashChanger = sap.ui.require("sap/ui/core/routing/HashChanger");
		const UICoreLibrary = sap.ui.require("sap/ui/core/library");
		const Parser = sap.ui.require("cross/fnd/fiori/inbox/util/Parser");

		// Guarantee DataManager is created (a crutch)
		if (!this.getDataManager()) {
			// Create the DataManager instance
			this.setDataManager(this._createDataManager());
		}

        // initialize Startup Parameters
		this.oStartupParameters = StartupParameters.getInstance(this);

		if (this.oStartupParameters.isModeActive()) {
			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.getDeviceModel(), "device");
		}

		var oRootView = this._createRootView({component: this});
		if (oRootView instanceof Promise) {
			oRootView.then(function(rootView) {
				rootView.addStyleClass(this.getContentDensityClass());
				this._performInitialNavigation();
			}.bind(this));
		}
		else {
			oRootView.addStyleClass(this.getContentDensityClass());
			this._performInitialNavigation();
		}

        return oRootView;
	},
	
	_performInitialNavigation : function() {
		const models = sap.ui.require("cross/fnd/fiori/inbox/model/models");
		const ErrorHandler = sap.ui.require("cross/fnd/fiori/inbox/controller/ErrorHandler");
		const StartupParameters = sap.ui.require("cross/fnd/fiori/inbox/util/StartupParameters");
		const HashChanger = sap.ui.require("sap/ui/core/routing/HashChanger");
		const UICoreLibrary = sap.ui.require("sap/ui/core/library");
		const Parser = sap.ui.require("cross/fnd/fiori/inbox/util/Parser");
		
		var oDataManager = this.getDataManager();
		oDataManager.isActionS3Custom = false; 
		var sInstanceID = oDataManager.sTaskInstanceID;
		// eslint-disable-next-line camelcase
		var sSAP__Origin = oDataManager.sSapOrigin;
		var oRouter = this.getRouter();
		var sUrl;

		if (this.oStartupParameters.isModeActive()) { // taskcenter
			var bReplaceHistory;
			var taskcenterHash = oRouter.getHashChanger().getHash(); // get taskcenter hash (not global)
			// eslint-disable-next-line camelcase
            if (!taskcenterHash && sInstanceID && sSAP__Origin) { // deeplink scenario without hash
				bReplaceHistory = true;
				// eslint-disable-next-line camelcase
					oRouter.navTo("myTasksDetailDeep", {SAP__Origin: encodeURIComponent(sSAP__Origin),
					InstanceID: encodeURIComponent(sInstanceID), layout: "MidColumnFullScreen"}, null, bReplaceHistory);
            }
            else if (taskcenterHash && taskcenterHash.startsWith("myTasksDetailDeep")) {
				// do nothing - refreshing browser - deeplink with hash
				// only "myTasksDetailDeep" refresh is supported currently
				// when refreshibg "myTasksDetail" we navigate to the default "myTasksMaster" route in the below else clause
            }
            else { // default navigation
				// we should use navTo(), but the behaviour is different and tests fail with "no metadata"
				// so leaving old way - with replaceHash()
				// bReplaceHistory = false;
				// oRouter.navTo("myTasksMaster", {}, null, bReplaceHistory);
				sUrl = oRouter.getURL("myTasksMaster", {});
				if (sUrl) {
					oRouter.getHashChanger().replaceHash(sUrl);
				}
            }
			this.getRouter().attachRouteMatched(this._taskCenterRouteMatched, this);
		}
		else { // my inbox
			// usage of global hashchanger is not recommended
			// instead we must use oRouter.getHashChanger() so we follow the hierarchy
			var oHashChanger = HashChanger.getInstance();
			// eslint-disable-next-line camelcase
			if (sInstanceID && sSAP__Origin && window.location.href.indexOf("&/") === -1) {
				sUrl = this._getAppSpecificURL(sInstanceID,sSAP__Origin);
				if (sUrl) {
					var aLeftRightURLSplit = window.location.href.split("#");
					var sLeftPartOfURL = aLeftRightURLSplit[0];
					//var sRightPartOfURL = aLeftRightURLSplit[1];

					oHashChanger.replaceHash(sUrl);
					var sURLWithHash = this._getFullHash(sUrl);

					if (window.history.replaceState) {
						if (sLeftPartOfURL.indexOf("InstanceID") !== -1 && sLeftPartOfURL.indexOf("SAP__Origin") !== -1) {
							sLeftPartOfURL = Parser.removeParamsFromUrl(["InstanceID","SAP__Origin"], sLeftPartOfURL);

							window.history.replaceState({fromExternal:true}, null, sLeftPartOfURL + "#" + sURLWithHash);
						}
						else {
							window.history.replaceState({fromExternal:true}, null, "#" + sURLWithHash);
						}
					}
				}
			}

            //if (oDataManager.getTableView() && (!Device.system.phone || oDataManager.getTableViewOnPhone())) {
            if (oDataManager.getTableView()) {
                var currentHash = oHashChanger.getHash();
                if (!currentHash.startsWith("detail_deep") && !currentHash.startsWith("substitution")) {
                    //to construct the correct URL all parameters defined in the routes's pattern have to be provided to the getURL function:
                    sUrl = oRouter.getURL("table_view",{}); //adopt to your route
                    if (sUrl) {
                        oHashChanger.replaceHash(sUrl);
                    }
                }
            }
		}
		// create the views based on the url/hash
		// called after the initia navigation in order to avoid loading of unnecessary routes/views
		this.getRouter().initialize();
	}
});