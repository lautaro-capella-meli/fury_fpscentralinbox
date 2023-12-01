sap.ui.define([
	"cross/fnd/fiori/inbox/controller/BaseController",
	"cross/fnd/fiori/inbox/util/Conversions",
	"cross/fnd/fiori/inbox/util/SupportInfo",
	"cross/fnd/fiori/inbox/util/AddInbox",
	"cross/fnd/fiori/inbox/util/FooterButtonExtension",
	"cross/fnd/fiori/inbox/util/MultiSelect",
	"cross/fnd/fiori/inbox/util/tools/Application",
	"cross/fnd/fiori/inbox/util/tools/Startup",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/core/UIComponent",
	"sap/base/Log",
	"sap/m/Button"
], function(B, C, S, A, F, M, a, b, J, D, U, L, c) {
	"use strict";
	return sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.MainCustom", {
		    onInit: function () {
		        b.init("cross.fnd.fiori.inbox", this);
		        var o = a.getImpl();
		        var m = o.oConnectionManager ? o.oConnectionManager.modelList : {};
		        var O = this.getOwnerComponent();
		        var v = this.getView();
		        var d = Object.keys(m);
		        
		        sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		        
		        for (var i = 0; i < d.length; i++) {
		            var s = d[i];
		            if (m.hasOwnProperty(s)) {
		                if (s !== "undefined") {
		                    v.setModel(m[s], s);
		                    O.setModel(m[s], s);
		                } else {
		                    v.setModel(m[s]);
		                    O.setModel(m[s]);
		                }
		            }
		        }
		        var e = O.getDataManager();
		        e.setModel(O.getModel());
		        F.overrideEnsureButton();
	
		        if (!D.system.phone && e.bOutbox) {
		            C.setShellTitleToOutbox(O, "cross.fnd.fiori.inbox.Main");
		        }
		       
		        if (typeof sap.ushell !== "undefined" && typeof sap.ushell.renderers !== "undefined" && typeof sap.ushell.renderers.fiori2 !== "undefined") {
		            var r = sap.ushell.renderers.fiori2.RendererExtensions;
		        } else {
		            r = undefined;
		        }
		       
		        if (r) {
		            var f = this.getResourceBundle();
		            this.oRouter = U.getRouterFor(this);
		            if (e.getSubstitutionEnabled()) {
		                this.oSubstButton = new c({
		                    text: f.getText("substn.navigation_button"),
		                    icon: "sap-icon://citizen-connect",
		                    tooltip: f.getText("userdrop.manage_my_substitutes_tooltip"),
		                    press: jQuery.proxy(function () {
		                        this.oRouter.navTo("substitution", {}, false);
		                    }, this)
		                });
		                r.addOptionsActionSheetButton(this.oSubstButton, r.LaunchpadState.App);
		                this.oAddInboxButton = new c({
		                    text: f.getText("XBUT_SUBSTITUTE_FOR"),
		                    icon: "sap-icon://personnel-view",
		                    tooltip: f.getText("userdrop.substitute_for_tooltip"),
		                    press: function (E) {
		                        A.open();
		                    }
		                });
		                r.addOptionsActionSheetButton(this.oAddInboxButton, r.LaunchpadState.App);
		            }
		            this.oSupportInfoButton = new c({
		                text: f.getText("supportinfo.navigation_button"),
		                icon: "sap-icon://message-information",
		                tooltip: f.getText("userdrop.support_information_tooltip"),
		                press: function (E) {
		                    v.getController().getOwnerComponent().getEventBus().publish("cross.fnd.fiori.inbox", "open_supportinfo", { source: "MAIN" });
		                    S.open(v);
		                }
		            });
		            r.addOptionsActionSheetButton(this.oSupportInfoButton, r.LaunchpadState.App);

		        } else {
		            L.error("sap.ushell.renderers.fiori2.RendererExtensions not found. My Inbox menu options will not be added");
		        }
		        
		        sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		    },
		    onExit: function () {
		        if (C) {
		            C.setDataManager(null);
		        }
		        var r = sap.ushell.renderers ? sap.ushell.renderers.fiori2.RendererExtensions : undefined;
		        if (r) {
		            if (this.oSubstButton) {
		                r.removeOptionsActionSheetButton(this.oSubstButton, r.LaunchpadState.App);
		            }
		            if (this.oAddInboxButton) {
		                r.removeOptionsActionSheetButton(this.oAddInboxButton, r.LaunchpadState.App);
		            }
		            if (this.oSupportInfoButton) {
		                r.removeOptionsActionSheetButton(this.oSupportInfoButton, r.LaunchpadState.App);
		            }
		        }
		    }
	});
});