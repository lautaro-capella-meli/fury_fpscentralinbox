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

		var oViewData = { component: this };

		// initialize Startup Parameters
		this.oStartupParameters = StartupParameters.getInstance(this);

		if (this.oStartupParameters.isModeActive()) {
			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.getDeviceModel(), "device");
		}

		// eslint-disable-next-line new-cap
		var oRootView = new sap.ui.view({
			viewName: "cross.fnd.fiori.inbox.view.App",
			type: UICoreLibrary.mvc.ViewType.XML,
			viewData: oViewData
		});

		oRootView.addStyleClass(this.getContentDensityClass());
		var oDataManager = this.getDataManager();
		var sInstanceID = oDataManager.sTaskInstanceID;
		// eslint-disable-next-line camelcase
		var sSAP__Origin = oDataManager.sSapOrigin;

		var oHashChanger = HashChanger.getInstance();

		// eslint-disable-next-line camelcase
		if (sInstanceID && sSAP__Origin && window.location.href.indexOf("&/") === -1) {
			var sURL = this._getAppSpecificURL(sInstanceID, sSAP__Origin);
			if (sURL) {
				var aLeftRightURLSplit = window.location.href.split("#");
				var sLeftPartOfURL = aLeftRightURLSplit[0];
				//var sRightPartOfURL = aLeftRightURLSplit[1];

				oHashChanger.replaceHash(sURL);
				var sURLWithHash = this._getFullHash(sURL);

				if (window.history.replaceState) {
					if (sLeftPartOfURL.indexOf("InstanceID") !== -1 && sLeftPartOfURL.indexOf("SAP__Origin") !== -1) {
						sLeftPartOfURL = Parser.removeParamsFromUrl(["InstanceID", "SAP__Origin"], sLeftPartOfURL);

						window.history.replaceState({ fromExternal: true }, null, sLeftPartOfURL + "#" + sURLWithHash);
					}
					else {
						window.history.replaceState({ fromExternal: true }, null, "#" + sURLWithHash);
					}
				}
			}
		}

		var oRouter = this.getRouter();
		var sUrl;
		//if (oDataManager.getTableView() && (!Device.system.phone || oDataManager.getTableViewOnPhone())) {
		if (oDataManager.getTableView()) {
			var currentHash = oHashChanger.getHash();
			if (!currentHash.startsWith("detail_deep")) {
				//to construct the correct URL all parameters defined in the routes's pattern have to be provided to the getURL function:
				sUrl = oRouter.getURL("table_view", {}); //adopt to your route
				if (sUrl) {
					oHashChanger.replaceHash(sUrl);
				}
			}
		}

		if (this.oStartupParameters.isModeActive()) {
			sUrl = oRouter.getURL("myTasksMaster", {});
			if (sUrl) {
				oHashChanger.replaceHash(sUrl);
			}
		}

		return oRootView;
	}
});