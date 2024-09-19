/*
 * Copyright (C) 2009-2023 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"cross/fnd/fiori/inbox/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"cross/fnd/fiori/inbox/util/StartupParameters",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/f/library"
], function (BaseController, JSONModel, Device, StartupParameters, FlexibleColumnLayoutSemanticHelper, library) {
	"use strict";

	return sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.controller.AppCustom", {

		onInit: function () {

			var oModel = new JSONModel({
				"oldLayout": "OneColumn"
			});
			this.setModel(oModel, "fcl");

			// use the model for modifying and reading custom parameters
			var oModel2 = new JSONModel();
			this.setModel(oModel2, "parametersModel");

			this.oStartupParameters = StartupParameters.getInstance();

			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);

			if (this.oStartupParameters.isModeActive()) {
				var oViewModel,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy: true,
					delay: iOriginalBusyDelay
				});
				this.setModel(oViewModel, "appView");

				var oErrorHandler = this.getOwnerComponent().getErrorHandler();

				// handle busy App state when model metadata is returned
				// extending functionality to set loaded state of the APP
				var fnSetAppNotBusy = function (bIsFailed) {
					oErrorHandler.setIsMetadataLoadedFailed(bIsFailed);

					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				};

				// disable busy indication when the metadata is loaded and in case of errors
				this.getOwnerComponent()
					.getModel()
					.metadataLoaded()
					.then(fnSetAppNotBusy.bind(this, false));

				// this callback will be called only when the app work synchronously
				this.getOwnerComponent()
					.getModel()
					.attachMetadataFailed(fnSetAppNotBusy.bind(this, true));

				// this check is only valid only when the app work asynchronously
				// bIsMetadataFailed will be null in async execution
				var bIsMetadataFailed = oErrorHandler.getIsMetadataLoadedFailed();
				if (bIsMetadataFailed) {
					fnSetAppNotBusy(bIsMetadataFailed);
				}
			}

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		},

		onAfterRendering: function (oEvent) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		},
		onColumnResize: function (oEvent) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			// This event is ideal to call scrollToIndex function of the Table
			var oMasterView = oEvent.getSource().getBeginColumnPages()[0];

			if (oMasterView
				&& typeof oMasterView.getController().iIndex === "number"
				&& oEvent.getParameter("beginColumn")) {
				var oTable = oMasterView.byId("table");

				// eslint-disable-next-line no-unused-expressions
				oTable.$().is(":visible") && oTable.scrollToIndex(oMasterView.getController().iIndex);
			}
		},
		onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel("fcl");
			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout || !this.oStartupParameters.isFlexibleColumnLayout()) {
				var oNextUIState = this.getFCLHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				//Store the previous layout
				oModel.setProperty("/oldLayout", oModel.getProperty("/layout"));

				//Store the new Layout
				oModel.setProperty("/layout", sLayout);
			}
		},

		/**
		 * Stores properties neeeded for further actions and update UIs.
		 *
		 * @param {sap.ui.base.Event} oEvent router attachPatternMatched event
		 */
		onRouteMatched: function (oEvent) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var sRouteName = oEvent.getParameter("name");
			var oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();

			// Save the current route name
			this.currentRouteName = sRouteName;
			// eslint-disable-next-line camelcase
			this.SAP__Origin = decodeURIComponent(oArguments.SAP__Origin);
			this.InstanceID = decodeURIComponent(oArguments.InstanceID);
		},

		/**
		 * Function to control buttons when using arrows for resizing the columns or browser window resizing.
		 *
		 * @param {sap.ui.base.Event} oEvent Event from flexible column layout, when state is changed
		 */
		onStateChanged: function (oEvent) {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
			var sLayout = oEvent.getParameter("layout");
			var bReplaceHistory = !Device.system.phone;

			this._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				//unpress Show Log and Show Details buttons, when latest column is hidden
				if (sLayout === "ThreeColumnsMidExpandedEndHidden") {
					this.getModel("parametersModel").setProperty("/showLogButtonPressed", false);
					this.getModel("parametersModel").setProperty("/showDetailsButtonPressed", false);
				}
				//method navTo results in the right hash, whenever there is "oComponentTargetInfo" that is other than an empty object
				//it works with empty string or dummyObject with dummy data

				// eslint-disable-next-line camelcase
				this.oRouter.navTo(this.currentRouteName, {
					SAP__Origin: encodeURIComponent(this.SAP__Origin),
					InstanceID: encodeURIComponent(this.InstanceID),
					layout: sLayout
				},
					{ dummyProperty: "dummyValue" }, bReplaceHistory);

			}
			//Show Log button or Show Details should be pressed(visual representation is with blue background) when third columns is opened
			if (sLayout === "ThreeColumnsMidExpanded") {
				if (this.currentRouteName === "myTasksDetailDetail") {
					this.getModel("parametersModel").setProperty("/showLogButtonPressed", true);
				}
				if (this.currentRouteName === "additionalTaskDetails") {
					this.getModel("parametersModel").setProperty("/showDetailsButtonPressed", true);
				}
			}
		},

		/**
		 * Update the close/fullscreen buttons visibility.
		 */
		_updateUIElements: function () {
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
			var oModel = this.getModel("fcl");
			var oUIState = this.getFCLHelper().getCurrentUIState();

			//Store the oldLayout
			oUIState.oldLayout = oModel.getProperty("/oldLayout");

			oModel.setData(oUIState);
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			this.oStartupParameters.destroy();
		},

		/**
		 * Returns an instance of the semantic helper. With this helper control buttons and layout of flexible column layout.
		 *
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getFCLHelper: function () {
			var oFCL = this.byId("fcl"),
				//oParams = new UriParameters(window.location.href),
				oSettings = {
					defaultTwoColumnLayoutType: library.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: library.LayoutType.ThreeColumnsMidExpanded
					//initialColumnsCount: oParams.get("initial") can be used for initial opening of 2 columns for master detail view
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});

}
);
