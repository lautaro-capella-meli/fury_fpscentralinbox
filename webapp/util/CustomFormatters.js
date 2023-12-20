sap.ui.define([
	"sap/ui/base/Object"
], function (UI5Object) {
	"use strict";
	// Module to contain all data comparators
	UI5Object.extend("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.CustomFormatters", {});

	cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.CustomFormatters = {
		formatterCustomAttributeValue: function (sAttributeName, oCustomAttributeData) {
			return oCustomAttributeData
				?.results
				?.find(oCustomAttribute => oCustomAttribute.Name.toLowerCase() === sAttributeName.toLowerCase())
				?.Value;
		}
	};

	return cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.CustomFormatters;
});
