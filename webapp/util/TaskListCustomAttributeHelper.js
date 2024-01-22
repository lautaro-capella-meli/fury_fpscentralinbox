jQuery.sap.declare("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.util.TaskListCustomAttributeHelper"); // This line of code declares my extended Formatter.js
jQuery.sap.require("cross.fnd.fiori.inbox.util.TaskListCustomAttributeHelper"); // This line of code declares my extended Formatter.js
cross.fnd.fiori.inbox.util.TaskListCustomAttributeHelper._addCustomAttributeColumn = function (customAttribute) {
	//old way - escaping of some chars:
	//var id = (decodeURIComponent(customAttribute.TaskDefinitionID) + customAttribute.Name).replace(/\//g, "");
	//now using _genSafeId
	var id = this._genSafeId(customAttribute, true);
	var oColumn = new Column(id + "Column", {
		header: new Label(id + "Lbl", { text: customAttribute.Label }),
		popinDisplay: PopinDisplay.Inline,
		minScreenWidth: "Tablet",
		demandPopin: true
	});
	if (true) {
		debugger;
		var oCell = new ObjectNumber(id + "Txt", {
			text: "{parts:[{path:'taskList>" + encodeURIComponent(customAttribute.Name) + "'}], formatter:'cross.fnd.fiori.inbox.Conversions.fnCustomAttributeFormatter'}"
		});
	} else {
		var oCell = new Text(id + "Txt", {
			text: "{parts:[{path:'taskList>" + encodeURIComponent(customAttribute.Name) + "'}], formatter:'cross.fnd.fiori.inbox.Conversions.fnCustomAttributeFormatter'}"
		});
	}
	oCell.data({
		Type: customAttribute.Type
	});
	//Add columns to grouping dialog
	this._oGrouping.addCustomGroupItem(id, customAttribute.Name, customAttribute.Label);
	//Add columns to sorting dialog
	this._oSorting.addCustomSortItem(id, customAttribute.Name, customAttribute.Label);
	return {
		cell: oCell,
		column: oColumn
	};
}.bind(cross.fnd.fiori.inbox.util.TaskListCustomAttributeHelper);