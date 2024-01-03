/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/core/UIComponent"
], function (UI5Object, Device, UIComponent) {
	"use strict";

	const aTaskDefinitionIDsShouldShowKPIs = [
		"TS20000166" // PO
	];
	return UI5Object.extend("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.util.KPI", {
		constructor: function (oModel) {
			UI5Object.prototype.constructor.call(this);
			this._oModel = oModel;
		},

		shouldTaskShowKPIsTab: function (oItem) {
			return aTaskDefinitionIDsShouldShowKPIs.includes(oItem.TaskDefinitionID)
		},

		getItemKpis: function (oItem) {
			return new Promise(function (resolve, reject) {
				this._oModel.read(`/WorkitemSet(${oItem.InstanceID})/WorkitemToKPI`, {
					success: resolve,
					error: reject
				})
			}.bind(this));
		},

		processItemsKpis: function (oData, oErr) {
			if (oErr)
				return { error: true };

			return oData?.results?.reduce((oKpisData, oKpi) => {
				const { Name, Value } = oKpi;
				oKpisData[Name] = {
					text: Value,
					icon: Number.isNaN(Value) ? "" :
						Value > 0 ? "sap-icon://trend-up" :
							Value < 0 ? "sap-icon://trend-down" :
								"sap-icon://less",
					state: Number.isNaN(Value) ? "" :
						Value > 0 ? "Success" :
							Value < 0 ? "Error" :
								"Information"
				};
				return oKpisData;
			}, { error: false });
		}
	});
});