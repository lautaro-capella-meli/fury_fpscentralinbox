sap.ui.define([
	"sap/ui/base/Object"
], function (UI5Object) {
	"use strict";
	// Module to contain all data comparators
	UI5Object.extend("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.CustomFormatters", {});
	
	cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.CustomFormatters = {
		formatterCustomAttributeValue: function(sAttributeName, oCustomAttributeData) {
			var oValue = null;
			console.log("## formatterCustomAttributeValue", sAttributeName, oCustomAttributeData);
			if(oCustomAttributeData){
				for (var i=0; i<oCustomAttributeData.results.length; i++) {
					console.log("## formatterCustomAttributeValue IF", oCustomAttributeData.results[i].Name.toLowerCase(), sAttributeName.toLowerCase());
					//var oCustomAttribute = this.getModel().getProperty("/" + oCustomAttributeData[i]);
					if (oCustomAttributeData.results[i].Name.toLowerCase() === sAttributeName.toLowerCase()) {
						oValue = oCustomAttributeData.results[i].Value;
						break;
					}
				}	
			}
			console.log("## formatterCustomAttributeValue", sAttributeName, oValue);
			
			return oValue;
		}
	};

	return cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.CustomFormatters;
});
		