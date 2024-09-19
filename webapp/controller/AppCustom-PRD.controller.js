sap.ui.define([
	"cross/fnd/fiori/inbox/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"cross/fnd/fiori/inbox/util/DataManager",
	"cross/fnd/fiori/inbox/util/StartupParameters"
], function (BaseController /* B */, JSONModel /* J */, Device /* D */, DataManager /* a */,
	StartupParameters /* S */) {
	"use strict";
	return sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.controller.AppCustom", {
		onInit: function () {
			var oFclModel = new JSONModel();
			this.setModel(oFclModel, "fcl");
			var oParametersModel = new JSONModel();
			this.setModel(oParametersModel, "parametersModel");
			var oComponent = this.getOwnerComponent();
			var oDataManager = new DataManager(this);
			console.log("#### App DataManager", oDataManager);
			console.log("#### App StartupParameters", StartupParameters);
			oComponent.setDataManager(oDataManager);
			this.oStartupParameters = StartupParameters.getInstance();

			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);

			if (this.oStartupParameters.isModeActive()) {
				var oAppViewModel;
				var iDelay = this.getView().getBusyIndicatorDelay();
				oAppViewModel = new JSONModel({
					busy: true,
					delay: iDelay
				});
				this.setModel(oAppViewModel, "appView");
				var oErrorHandler = this.getOwnerComponent().getErrorHandler();
				var fHandleMetadataLoad = function (bErrorOnMetadataLoad) {
					oErrorHandler.setIsMetadataLoadedFailed(bErrorOnMetadataLoad);
					oAppViewModel.setProperty("/busy", false);
					oAppViewModel.setProperty("/delay", iDelay);
				};
				this.getOwnerComponent().getModel().metadataLoaded().then(fHandleMetadataLoad.bind(this, false));
				this.getOwnerComponent().getModel().attachMetadataFailed(fHandleMetadataLoad.bind(this, true));
				var bIsMetadataLoadedFailed = oErrorHandler.getIsMetadataLoadedFailed();
				if (bIsMetadataLoadedFailed) {
					fHandleMetadataLoad(bIsMetadataLoadedFailed);
				}
			}
			console.log("#### App getContentDensityClass", this.getOwnerComponent().getContentDensityClass());
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		},

		onAfterRendering: function (e) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		},

		onColumnResize: function (e) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var oBeginColumnPage = e.getSource().getBeginColumnPages()[0];
			if (oBeginColumnPage
				&& typeof oBeginColumnPage.getController().iIndex === "number"
				&& e.getParameter("beginColumn")) {
				var oTable = oBeginColumnPage.byId("table");
				oTable.$().is(":visible") && oTable.scrollToIndex(oBeginColumnPage.getController().iIndex);
			}
		},

		onBeforeRouteMatched: function (e) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var oFclModel = this.getModel("fcl");
			var sLayout = e.getParameters().arguments.layout;
			if (!sLayout || !this.oStartupParameters.isFlexibleColumnLayout()) {
				var oNextUiState = this.getOwnerComponent().getFCLHelper().getNextUIState(0);
				sLayout = oNextUiState.layout;
			}
			if (sLayout) {
				oFclModel.setProperty("/layout", sLayout);
			}
		},

		onRouteMatched: function (e) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var sName = e.getParameter("name");
			var oArgs = e.getParameter("arguments");
			this._updateUIElements();
			this.currentRouteName = sName;
			this.SAP__Origin = decodeURIComponent(oArgs.SAP__Origin);
			this.InstanceID = decodeURIComponent(oArgs.InstanceID);
		},

		onStateChanged: function (e) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var bIsNavigationArrow = e.getParameter("isNavigationArrow");
			var sLayout = e.getParameter("layout");
			var bIsNotPhone = !Device.system.phone;
			this._updateUIElements();
			if (bIsNavigationArrow) {
				if (sLayout === "ThreeColumnsMidExpandedEndHidden") {
					this.getModel("parametersModel").setProperty("/showLogButtonPressed", false);
					this.getModel("parametersModel").setProperty("/showDetailsButtonPressed", false);
				}
				this.oRouter.navTo(this.currentRouteName, {
					SAP__Origin: encodeURIComponent(this.SAP__Origin),
					InstanceID: encodeURIComponent(this.InstanceID),
					layout: sLayout
				}, { dummyProperty: "dummyValue" }, bIsNotPhone);
			}
			if (sLayout === "ThreeColumnsMidExpanded") {
				if (this.currentRouteName === "myTasksDetailDetail") {
					this.getModel("parametersModel").setProperty("/showLogButtonPressed", true);
				}
				if (this.currentRouteName === "additionalTaskDetails") {
					this.getModel("parametersModel").setProperty("/showDetailsButtonPressed", true);
				}
			}
		},

		_updateUIElements: function () {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var oFclModel = this.getModel("fcl");
			var oCurrentUIState = this.getOwnerComponent().getFCLHelper().getCurrentUIState();
			oFclModel.setData(oCurrentUIState);
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			this.oStartupParameters.destroy();
		}
	});
});