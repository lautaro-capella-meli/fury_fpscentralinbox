sap.ui.define([
	"cross/fnd/fiori/inbox/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"cross/fnd/fiori/inbox/util/DataManager",
	"cross/fnd/fiori/inbox/util/StartupParameters"
], function(B, J, D, a, S) {
	"use strict";
	return sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.controller.AppCustom", {
		    onInit: function () {
		        var m = new J();
		        this.setModel(m, "fcl");
		        var M = new J();
		        this.setModel(M, "parametersModel");
		        var o = this.getOwnerComponent();
		        var d = new a(this);
		        console.log("#### App DataManager", d);
		        console.log("#### App StartupParameters", S);
		        o.setDataManager(d);
		        this.oStartupParameters = S.getInstance();
		        
		        sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		        
		        if (this.oStartupParameters.isModeActive()) {
		            var v, O = this.getView().getBusyIndicatorDelay();
		            v = new J({
		                busy: true,
		                delay: O
		            });
		            this.setModel(v, "appView");
		            var e = this.getOwnerComponent().getErrorHandler();
		            var s = function (I) {
		                e.setIsMetadataLoadedFailed(I);
		                v.setProperty("/busy", false);
		                v.setProperty("/delay", O);
		            };
		            this.getOwnerComponent().getModel().metadataLoaded().then(s.bind(this, false));
		            this.getOwnerComponent().getModel().attachMetadataFailed(s.bind(this, true));
		            var i = e.getIsMetadataLoadedFailed();
		            if (i) {
		                s(i);
		            }
		        }
		        console.log("#### App getContentDensityClass", this.getOwnerComponent().getContentDensityClass());
		        this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		   //      console.log("#### App AdjustHeightWithShellBar", o.getDataManager().getAdjustHeightWithShellBar());
		   //      var methods = [];
					// for (var m in this.getView().byId("app")) {        
					//     if (typeof this.getView().byId("app")[m] == "function") {
					//         methods.push(m);
					//     }
					// }
		   //      console.log("#### App methods", methods.join(","));
				// console.log("#### App css class sapUShellApplicationContainer ", this.getView().byId("app").hasStyleClass("sapUShellApplicationContainer"));
				// console.log("#### App css class sapUshellApplicationPage ", this.getView().byId("app").hasStyleClass("sapUshellApplicationPage"));
				// console.log("#### App css class sapUshellDefaultBackground ", this.getView().byId("app").hasStyleClass("sapUshellDefaultBackground"));
				// console.log("#### App css class sapUShellApplicationContainerLimitedWidth ", this.getView().byId("app").hasStyleClass("sapUShellApplicationContainerLimitedWidth"));

				// this.getView().byId("app").removeStyleClass("sapUShellApplicationContainer");
				// this.getView().byId("app").removeStyleClass("sapUshellApplicationPage");
				// this.getView().byId("app").removeStyleClass("sapUshellDefaultBackground");
				// this.getView().byId("app").removeStyleClass("sapUShellApplicationContainerLimitedWidth");
				
		        // if (o.getDataManager().getAdjustHeightWithShellBar()) {
		        //     this.getView().byId("app").addStyleClass("adjustHeightWithShellBar");
		        // }
		        this.oRouter = this.getOwnerComponent().getRouter();
		        this.oRouter.attachRouteMatched(this.onRouteMatched, this);
		        this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		        
		        sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		    },
		    onAfterRendering: function(e){
		  //  		console.log("#### App onAfterRendering css class sapUShellApplicationContainer ", this.getView().byId("app").hasStyleClass("sapUShellApplicationContainer"));
				// console.log("#### App css onAfterRendering class sapUshellApplicationPage ", this.getView().byId("app").hasStyleClass("sapUshellApplicationPage"));
				// console.log("#### App css onAfterRendering class sapUshellDefaultBackground ", this.getView().byId("app").hasStyleClass("sapUshellDefaultBackground"));
				// console.log("#### App css onAfterRendering class sapUShellApplicationContainerLimitedWidth ", this.getView().byId("app").hasStyleClass("sapUShellApplicationContainerLimitedWidth"));

				// this.getView().byId("app").removeStyleClass("sapUShellApplicationContainer");
				// this.getView().byId("app").removeStyleClass("sapUshellApplicationPage");
				// this.getView().byId("app").removeStyleClass("sapUshellDefaultBackground");
				// this.getView().byId("app").removeStyleClass("sapUShellApplicationContainerLimitedWidth");
				sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		    },
		    onColumnResize: function (e) {
		    	sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		        var m = e.getSource().getBeginColumnPages()[0];
		        if (m && typeof m.getController().iIndex === "number" && e.getParameter("beginColumn")) {
		            var t = m.byId("table");
		            t.$().is(":visible") && t.scrollToIndex(m.getController().iIndex);
		        }
		    },
		    onBeforeRouteMatched: function (e) {
		    	sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		        var m = this.getModel("fcl");
		        var l = e.getParameters().arguments.layout;
		        if (!l || !this.oStartupParameters.isFlexibleColumnLayout()) {
		            var n = this.getOwnerComponent().getFCLHelper().getNextUIState(0);
		            l = n.layout;
		        }
		        if (l) {
		            m.setProperty("/layout", l);
		        }
		    },
		    onRouteMatched: function (e) {
		    	sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		        var r = e.getParameter("name");
		        var A = e.getParameter("arguments");
		        this._updateUIElements();
		        this.currentRouteName = r;
		        this.SAP__Origin = decodeURIComponent(A.SAP__Origin);
		        this.InstanceID = decodeURIComponent(A.InstanceID);
		    },
		    onStateChanged: function (e) {
		    	sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		        var i = e.getParameter("isNavigationArrow");
		        var l = e.getParameter("layout");
		        var r = !D.system.phone;
		        this._updateUIElements();
		        if (i) {
		            if (l === "ThreeColumnsMidExpandedEndHidden") {
		                this.getModel("parametersModel").setProperty("/showLogButtonPressed", false);
		                this.getModel("parametersModel").setProperty("/showDetailsButtonPressed", false);
		            }
		            this.oRouter.navTo(this.currentRouteName, {
		                SAP__Origin: encodeURIComponent(this.SAP__Origin),
		                InstanceID: encodeURIComponent(this.InstanceID),
		                layout: l
		            }, { dummyProperty: "dummyValue" }, r);
		        }
		        if (l === "ThreeColumnsMidExpanded") {
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
		        var m = this.getModel("fcl");
		        var u = this.getOwnerComponent().getFCLHelper().getCurrentUIState();
		        m.setData(u);
		    },
		    onExit: function () {
		        this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		        this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		        this.oStartupParameters.destroy();
		    }
	});
});