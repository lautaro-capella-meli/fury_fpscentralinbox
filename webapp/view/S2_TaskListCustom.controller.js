sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Column",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/TablePersoController",
	"sap/m/GroupHeaderListItem",
	"cross/fnd/fiori/inbox/util/TableOperations",
	"cross/fnd/fiori/inbox/util/TaskListGroupingHelper",
	"cross/fnd/fiori/inbox/util/TaskListSortingHelper",
	"cross/fnd/fiori/inbox/util/TaskListCustomAttributeHelper",
	"cross/fnd/fiori/inbox/util/DataManager",
	"cross/fnd/fiori/inbox/controller/BaseController",
	"sap/m/semantic/PositiveAction",
	"sap/m/semantic/NegativeAction",
	"sap/m/Button",
	"sap/base/Log",
	"cross/fnd/fiori/inbox/util/ConfirmationDialogManager",
	"cross/fnd/fiori/inbox/util/Forward",
	"cross/fnd/fiori/inbox/util/Resubmit",
	"cross/fnd/fiori/inbox/util/MultiSelect",
	"cross/fnd/fiori/inbox/util/ActionHelper",
	"cross/fnd/fiori/inbox/util/CommonFunctions",
	"cross/fnd/fiori/inbox/util/ForwardSimple",
	"cross/fnd/fiori/inbox/util/Conversions",
	"sap/ui/core/syncStyleClass",
	"sap/ui/Device",
	"sap/m/MessagePopoverItem",
	"sap/m/library",
	"sap/m/MessagePopover",
	"sap/ui/core/Fragment",
	"sap/ui/core/format/DateFormat",
	"sap/ui/thirdparty/jquery",
	"cross/fnd/fiori/inbox/CA_FIORI_INBOXExtension2/util/CustomFormatters",
], function (UIComponent, XMLView, Sorter, Filter, FilterOperator, JSONModel, Column, MessageToast,
	MessageBox, TablePersoController, GroupHeaderListItem, TableOperations, TaskListGroupingHelper,
	TaskListSortingHelper, TaskListCustomAttributeHelper, DataManager, BaseController, PositiveAction,
	NegativeAction, Button, Log, ConfirmationDialogManager, Forward, Resubmit, MultiSelect, ActionHelper,
	CommonFunctions, ForwardSimple, Conversions, syncStyleClass, Device, MessagePopoverItem, library,
	MessagePopover, Fragment, DateFormat, jquery, CustomFormatters) {
	"use strict";
	var ButtonType = library.ButtonType;
	const I18N_CUSTOM_PREFIX = "custom.meli."

	sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.view.S2_TaskListCustom", {

		_getI18nCustomText(sText, ...args) {
			return this._oResourceBundle.hasText(I18N_CUSTOM_PREFIX + sText, ...args) ?
				this._oResourceBundle.getText(I18N_CUSTOM_PREFIX + sText, ...args)
				: "";
		},

		_initTaskDefintionModel: function () {
			var taskDefArray = this._getTaskDefinitionFilters();
			if (taskDefArray) {
				taskDefArray = [taskDefArray];
			}
			var params = {
				filters: taskDefArray,
				success: this.onSuccessTaskDefintionRequest.bind(this),
				urlParameters: {
					$select: "SAP__Origin,TaskDefinitionID,TaskName,CustomAttributeDefinitionData",
					$expand: "CustomAttributeDefinitionData"
				}
			};
			this._oDataModel.read("/TaskDefinitionCollection", params);
		},

		onSuccessTaskDefintionRequest: function (oData, oResponse) {
			if (oResponse.statusCode != 200)
				return MessageToast.show(oResponse.statusText + ":" + oResponse.body);

			//TODO Create an interface and provide two implmentations
			//1. for Scenario based custom attribute columns (Merge custom attrbutes from Task defs in a scenario)
			//2. for TaskDefinition based custom attribute column.

			// TODO: !!!REMOVE!!!
			if (!oData.results.length)
				oData = JSON.parse(`{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166')","type":"TASKPROCESSING.TaskDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","TaskName":"Liberar pedido","CustomAttributeDefinitionData":{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PO_NUMBER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PO_NUMBER')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PO_NUMBER","Type":"Custom type string","Label":"Número de pedido"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PRICE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PRICE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PRICE","Type":"Custom type string","Label":"Precio"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='CURRENCY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='CURRENCY')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"CURRENCY","Type":"Custom type string","Label":"Moneda"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PAYMENT_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PAYMENT_TERMS')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PAYMENT_TERMS","Type":"Custom type string","Label":"Condiciones de pago"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='INCO_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='INCO_TERMS')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"INCO_TERMS","Type":"Custom type string","Label":"Incoterms"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='SUPPLIER_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='SUPPLIER_NAME')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"SUPPLIER_NAME","Type":"Custom type string","Label":"Proveedor"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='ITEMOVERVIEW')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='ITEMOVERVIEW')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"ITEMOVERVIEW","Type":"Custom type string","Label":"Resumen posiciones"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='COMPANY_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='COMPANY_CODE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"COMPANY_CODE","Type":"Custom type string","Label":"Sociedad"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='COMPANY_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='COMPANY_NAME')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"COMPANY_NAME","Type":"Custom type string","Label":"Nombre soc.GL"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='SUPPLIER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='SUPPLIER')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"SUPPLIER","Type":"Custom type string","Label":"Cod. Proveedor"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PAYMENT_TERM_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PAYMENT_TERM_CODE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PAYMENT_TERM_CODE","Type":"Custom type string","Label":"Cond.pago"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='INCO_TERMS_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='INCO_TERMS_CODE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"INCO_TERMS_CODE","Type":"Custom type string","Label":"Incoterms"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_GROUP')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_GROUP')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PURCHASING_GROUP","Type":"Custom type string","Label":"Grupo compras"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_ORG')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_ORG')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PURCHASING_ORG","Type":"Custom type string","Label":"Org.compras"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='COMPLIANCE_POLICY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='COMPLIANCE_POLICY')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"COMPLIANCE_POLICY","Type":"Custom type string","Label":"Cump. de Política"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_TYPE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_TYPE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PURCHASING_TYPE","Type":"Custom type string","Label":"Tipo de Compra"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_CATEGORY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_CATEGORY')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PURCHASING_CATEGORY","Type":"Custom type string","Label":"Categoría OC"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_SUBCATEGORY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000166',Name='PURCHASING_SUBCATEGORY')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000166","Name":"PURCHASING_SUBCATEGORY","Type":"Custom type string","Label":"Subcategoría OC"}]}},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172')","type":"TASKPROCESSING.TaskDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","TaskName":"Liberación de contrato de compra","CustomAttributeDefinitionData":{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='CONTRACT_NUMBER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='CONTRACT_NUMBER')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"CONTRACT_NUMBER","Type":"Custom type string","Label":"Doc.compras"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PRICE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PRICE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"PRICE","Type":"Custom type string","Label":"Valor Total Contrato"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='CURRENCY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='CURRENCY')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"CURRENCY","Type":"Custom type string","Label":"Moneda"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PAYMENT_TERM_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PAYMENT_TERM_CODE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"PAYMENT_TERM_CODE","Type":"Custom type string","Label":"Cond.pago"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PAYMENT_TERM')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PAYMENT_TERM')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"PAYMENT_TERM","Type":"Custom type string","Label":"String"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='INCO_TERMS_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='INCO_TERMS_CODE')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"INCO_TERMS_CODE","Type":"Custom type string","Label":"Incoterms"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='INCO_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='INCO_TERMS')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"INCO_TERMS","Type":"Custom type string","Label":"Descripción"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='SUPPLIER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='SUPPLIER')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"SUPPLIER","Type":"Custom type string","Label":"Cod. Proveedor"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='SUPPLIER_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='SUPPLIER_NAME')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"SUPPLIER_NAME","Type":"Custom type string","Label":"Nombre"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='COMPANY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='COMPANY')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"COMPANY","Type":"Custom type string","Label":"Sociedad"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='COMPANY_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='COMPANY_NAME')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"COMPANY_NAME","Type":"Custom type string","Label":"Nombre soc.GL"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PURCHASING_GROUP')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PURCHASING_GROUP')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"PURCHASING_GROUP","Type":"Custom type string","Label":"Grupo compras"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PURCHASING_ORG')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeDefinitionCollection(SAP__Origin='LOCAL_TGW',TaskDefinitionID='TS20000172',Name='PURCHASING_ORG')","type":"TASKPROCESSING.CustomAttributeDefinition"},"SAP__Origin":"LOCAL_TGW","TaskDefinitionID":"TS20000172","Name":"PURCHASING_ORG","Type":"Custom type string","Label":"Org.compras"}]}}]}`);
			// TODO: !!!REMOVE!!!

			this.oDataManager.storeTaskDefinitionModel(oData.results); //save task definition model for further use
			var oCcolumns = this._identifyColumnsTobeAdded(oData.results);
			var oTaskDefinitionsModel = new JSONModel({
				TaskDefinitionCollection: oData.results,
				Columns: oCcolumns
			});
			this.getView().setModel(oTaskDefinitionsModel, "taskDefinitions");
			this._loadCustomAttributesDeferredForTaskDefs.resolve();
		},

		_identifyColumnsTobeAdded: function (aTaskDefinitions) {
			return aTaskDefinitions.reduce((oCcolumns, oTaskDefinition) => {
				oTaskDefinition.TaskDefinitionID = oTaskDefinition.TaskDefinitionID?.toUpperCase();
				oCcolumns[oTaskDefinition.TaskDefinitionID] = oTaskDefinition.CustomAttributeDefinitionData?.results;
				return oCcolumns;
			}, {});
		},

		_initTaskModel: function () {

			this._bUseSubIconTabBar ??= true;
			this._oGroupsMap ??= new Map();

			if (!this._oMainIconTabBar) {
				this._oMainIconTabBar = this.byId("idMainIconTabBar");
				this._oMainIconTabBar.attachSelect(this.onSelectMainIconTabBar.bind(this));
			}

			if (!this._oSubIconTabBar) {
				this._oSubIconTabBar = this.byId("idSubIconTabBar");
				this._oSubIconTabBar.attachSelect(this.onSelectMainIconTabBar.bind(this));
			}

			const aFilters = [this._getinitialStatusFilters()];
			const oTaskDefinitionFilter = this._getTaskDefinitionFilters();

			if (oTaskDefinitionFilter)
				aFilters.push(oTaskDefinitionFilter);

			const oRequestConfiguration = {
				filters: [new Filter({
					filters: aFilters,
					and: true
				})],
				sorters: [this._getCurrentSorter()],
				success: this.onSuccessTaskCollectionRequest.bind(this),
				urlParameters: {
					$top: this.oDataManager.getListSize(),
					$select: this._getTaskPropertiesToFetch().join(",")
				}
			};

			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
				oRequestConfiguration.urlParameters.$expand = "CustomAttributeData";

			this._oDataModel.read("/TaskCollection", oRequestConfiguration);
		},

		onSuccessTaskCollectionRequest: function (oData, oResponse) {
			if (oResponse.statusCode != 200)
				return MessageToast.show(oResponse.statusText + ":" + oResponse.body);

			// TODO: !!!REMOVE!!!
			if (!oData.results.length) {
				oData = JSON.parse(`{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495')","type":"TASKPROCESSING.Task","content_type":"application/octet-stream","media_src":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495')/$value"},"TaskSupports":{"__metadata":{"type":"TASKPROCESSING.TaskSupports"},"AddAttachments":true,"AddComments":true,"Attachments":true,"Comments":true,"CreatedByDetails":true,"CustomAttributeData":true,"Description":true,"PossibleAgents":true,"PotentialOwners":true,"ProcessingLogs":true,"ProcessorDetails":true,"TaskDefinitionData":true,"TaskObject":true,"UIExecutionLink":true,"CancelResubmission":false,"Confirm":false,"Claim":true,"Forward":true,"Release":false,"Resubmit":true,"SetPriority":true,"WorkflowLog":true},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","TaskDefinitionID":"TS20000172","TaskDefinitionName":"Liberación de contrato de compra","TaskTitle":"Liberación pedido abierto 4600001716","Priority":"MEDIUM","Status":"READY","StatusText":"","CreatedOn":"2023-12-08T20:49:29.000Z","CreatedBy":"SAP_WFRT","CreatedByName":"SAP_WFRT","CompletionDeadLine":null,"SupportsComments":true,"SupportsAttachments":true,"HasAttachments":false,"SupportsClaim":true,"SupportsRelease":false,"SupportsForward":true,"PriorityNumber":5,"GUI_Link":"sapui5://cross.fnd.fiori.inbox.annotationBasedTaskUI?service=/sap/opu/odata/sap/C_CONTRACT_FS_SRV&entity=/C_ContractFs(PurchaseContract='4600001716')&annotations=/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='C_CONTRACT_FS_ANNO_MDL',Version='0001')/$value/","CustomAttributeData":{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='CONTRACT_NUMBER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='CONTRACT_NUMBER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"CONTRACT_NUMBER","Value":"4600001716"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PRICE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PRICE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"PRICE","Value":"0.00"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='CURRENCY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='CURRENCY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"CURRENCY","Value":"USD"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PAYMENT_TERM_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PAYMENT_TERM_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"PAYMENT_TERM_CODE","Value":"ML30"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PAYMENT_TERM')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PAYMENT_TERM')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"PAYMENT_TERM","Value":"Pago a 30 días"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='INCO_TERMS_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='INCO_TERMS_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"INCO_TERMS_CODE","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='INCO_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='INCO_TERMS')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"INCO_TERMS","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='SUPPLIER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='SUPPLIER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"SUPPLIER","Value":"9600006906"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='SUPPLIER_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='SUPPLIER_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"SUPPLIER_NAME","Value":"DANNEMANN SIEMSEN ADVOGADOS"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='COMPANY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='COMPANY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"COMPANY","Value":"MLB"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='COMPANY_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='COMPANY_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"COMPANY_NAME","Value":"MercadoLivre.com A.I.Ltda"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PURCHASING_GROUP')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PURCHASING_GROUP')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"PURCHASING_GROUP","Value":"B34"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PURCHASING_ORG')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155495',Name='PURCHASING_ORG')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155495","Name":"PURCHASING_ORG","Value":"BR10"}]}},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493')","type":"TASKPROCESSING.Task","content_type":"application/octet-stream","media_src":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493')/$value"},"TaskSupports":{"__metadata":{"type":"TASKPROCESSING.TaskSupports"},"AddAttachments":true,"AddComments":true,"Attachments":true,"Comments":true,"CreatedByDetails":true,"CustomAttributeData":true,"Description":true,"PossibleAgents":true,"PotentialOwners":true,"ProcessingLogs":true,"ProcessorDetails":true,"TaskDefinitionData":true,"TaskObject":true,"UIExecutionLink":true,"CancelResubmission":false,"Confirm":false,"Claim":true,"Forward":true,"Release":false,"Resubmit":true,"SetPriority":true,"WorkflowLog":true},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","TaskDefinitionID":"TS20000172","TaskDefinitionName":"Liberación de contrato de compra","TaskTitle":"Liberación pedido abierto 4600001715","Priority":"HIGH","Status":"IN_PROGRESS","StatusText":"","CreatedOn":"2023-12-08T20:47:37.000Z","CreatedBy":"SAP_WFRT","CreatedByName":"SAP_WFRT","CompletionDeadLine":null,"SupportsComments":true,"SupportsAttachments":true,"HasAttachments":false,"SupportsClaim":true,"SupportsRelease":false,"SupportsForward":true,"PriorityNumber":5,"GUI_Link":"sapui5://cross.fnd.fiori.inbox.annotationBasedTaskUI?service=/sap/opu/odata/sap/C_CONTRACT_FS_SRV&entity=/C_ContractFs(PurchaseContract='4600001715')&annotations=/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='C_CONTRACT_FS_ANNO_MDL',Version='0001')/$value/","CustomAttributeData":{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='CONTRACT_NUMBER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='CONTRACT_NUMBER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"CONTRACT_NUMBER","Value":"4600001715"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PRICE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PRICE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"PRICE","Value":"0.00"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='CURRENCY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='CURRENCY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"CURRENCY","Value":"USD"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PAYMENT_TERM_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PAYMENT_TERM_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"PAYMENT_TERM_CODE","Value":"ML30"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PAYMENT_TERM')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PAYMENT_TERM')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"PAYMENT_TERM","Value":"Pago a 30 días"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='INCO_TERMS_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='INCO_TERMS_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"INCO_TERMS_CODE","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='INCO_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='INCO_TERMS')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"INCO_TERMS","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='SUPPLIER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='SUPPLIER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"SUPPLIER","Value":"9600006906"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='SUPPLIER_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='SUPPLIER_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"SUPPLIER_NAME","Value":"DANNEMANN SIEMSEN ADVOGADOS"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='COMPANY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='COMPANY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"COMPANY","Value":"MLB"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='COMPANY_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='COMPANY_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"COMPANY_NAME","Value":"MercadoLivre.com A.I.Ltda"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PURCHASING_GROUP')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PURCHASING_GROUP')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"PURCHASING_GROUP","Value":"B34"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PURCHASING_ORG')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003155493',Name='PURCHASING_ORG')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003155493","Name":"PURCHASING_ORG","Value":"BR10"}]}},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885')","type":"TASKPROCESSING.Task","content_type":"application/octet-stream","media_src":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885')/$value"},"TaskSupports":{"__metadata":{"type":"TASKPROCESSING.TaskSupports"},"AddAttachments":true,"AddComments":true,"Attachments":true,"Comments":true,"CreatedByDetails":true,"CustomAttributeData":true,"Description":true,"PossibleAgents":true,"PotentialOwners":true,"ProcessingLogs":true,"ProcessorDetails":true,"TaskDefinitionData":true,"TaskObject":true,"UIExecutionLink":true,"CancelResubmission":false,"Confirm":false,"Claim":true,"Forward":true,"Release":false,"Resubmit":true,"SetPriority":true,"WorkflowLog":true},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","TaskDefinitionID":"TS20000166","TaskDefinitionName":"Liberar pedido","TaskTitle":"Liberar pedido 4000024416","Priority":"LOW","Status":"IN_PROGRESS","StatusText":"","CreatedOn":"2023-11-01T20:32:18.000Z","CreatedBy":"SAP_WFRT","CreatedByName":"SAP_WFRT","CompletionDeadLine":null,"SupportsComments":true,"SupportsAttachments":true,"HasAttachments":false,"SupportsClaim":true,"SupportsRelease":false,"SupportsForward":true,"PriorityNumber":5,"GUI_Link":"sapui5://cross.fnd.fiori.inbox.annotationBasedTaskUI?service=/sap/opu/odata/sap/C_PURCHASEORDER_FS_SRV&entity=/C_PurchaseOrderFs(PurchaseOrder='4000024416')&entity=/C_PurchaseOrderFs('')&annotations=/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='C_PURCHASEORDER_FS_ANNO_MDL',Version='0001')/$value/","CustomAttributeData":{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PO_NUMBER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PO_NUMBER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PO_NUMBER","Value":"4000024416"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PRICE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PRICE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PRICE","Value":"5808000.00"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='CURRENCY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='CURRENCY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"CURRENCY","Value":"BRL"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PAYMENT_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PAYMENT_TERMS')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PAYMENT_TERMS","Value":"Pago a 60 días"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='SUPPLIER_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='SUPPLIER_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"SUPPLIER_NAME","Value":"SEMP TCL INDUSTRIA E COMERCIO DE EL"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='ITEMOVERVIEW')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='ITEMOVERVIEW')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"ITEMOVERVIEW","Value":"Número de posición:\\t10\\nDescripción:\\tTCL QLED TV 55” C825 4K GOOGLE TV\\nTp.posición:\\tNormal\\nCantidad:\\t1.000,000\\tUnidad\\nSubtotal:\\t5808000.00\\tBRL\\nFecha de entrega:\\t31.10.2023\\n\\n"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='COMPANY_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='COMPANY_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"COMPANY_CODE","Value":"EBA"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='COMPANY_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='COMPANY_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"COMPANY_NAME","Value":"eBazar.com.br Limitada"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='SUPPLIER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='SUPPLIER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"SUPPLIER","Value":"9600020471"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PAYMENT_TERM_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PAYMENT_TERM_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PAYMENT_TERM_CODE","Value":"ML60"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='INCO_TERMS_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='INCO_TERMS_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"INCO_TERMS_CODE","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_GROUP')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_GROUP')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PURCHASING_GROUP","Value":"BPB"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_ORG')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_ORG')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PURCHASING_ORG","Value":"BR1P"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='COMPLIANCE_POLICY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='COMPLIANCE_POLICY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"COMPLIANCE_POLICY","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_TYPE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_TYPE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PURCHASING_TYPE","Value":"06"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_CATEGORY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_CATEGORY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PURCHASING_CATEGORY","Value":"00"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_SUBCATEGORY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121885',Name='PURCHASING_SUBCATEGORY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121885","Name":"PURCHASING_SUBCATEGORY","Value":"00"}]}},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881')","type":"TASKPROCESSING.Task","content_type":"application/octet-stream","media_src":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/TaskCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881')/$value"},"TaskSupports":{"__metadata":{"type":"TASKPROCESSING.TaskSupports"},"AddAttachments":true,"AddComments":true,"Attachments":true,"Comments":true,"CreatedByDetails":true,"CustomAttributeData":true,"Description":true,"PossibleAgents":true,"PotentialOwners":true,"ProcessingLogs":true,"ProcessorDetails":true,"TaskDefinitionData":true,"TaskObject":true,"UIExecutionLink":true,"CancelResubmission":false,"Confirm":false,"Claim":true,"Forward":true,"Release":false,"Resubmit":true,"SetPriority":true,"WorkflowLog":true},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","TaskDefinitionID":"TS20000166","TaskDefinitionName":"Liberar pedido","TaskTitle":"Liberar pedido 4000024415","Priority":"LOW","Status":"READY","StatusText":"","CreatedOn":"2023-11-01T20:28:46.000Z","CreatedBy":"SAP_WFRT","CreatedByName":"SAP_WFRT","CompletionDeadLine":null,"SupportsComments":true,"SupportsAttachments":true,"HasAttachments":false,"SupportsClaim":true,"SupportsRelease":false,"SupportsForward":true,"PriorityNumber":5,"GUI_Link":"sapui5://cross.fnd.fiori.inbox.annotationBasedTaskUI?service=/sap/opu/odata/sap/C_PURCHASEORDER_FS_SRV&entity=/C_PurchaseOrderFs(PurchaseOrder='4000024415')&entity=/C_PurchaseOrderFs('')&annotations=/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='C_PURCHASEORDER_FS_ANNO_MDL',Version='0001')/$value/","CustomAttributeData":{"results":[{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PO_NUMBER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PO_NUMBER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PO_NUMBER","Value":"4000024415"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PRICE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PRICE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PRICE","Value":"5808000.00"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='CURRENCY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='CURRENCY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"CURRENCY","Value":"BRL"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PAYMENT_TERMS')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PAYMENT_TERMS')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PAYMENT_TERMS","Value":"Pago a 60 días"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='SUPPLIER_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='SUPPLIER_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"SUPPLIER_NAME","Value":"SEMP TCL INDUSTRIA E COMERCIO DE EL"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='ITEMOVERVIEW')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='ITEMOVERVIEW')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"ITEMOVERVIEW","Value":"Número de posición:\\t10\\nDescripción:\\tTCL QLED TV 55” C825 4K GOOGLE TV\\nTp.posición:\\tNormal\\nCantidad:\\t1.000,000\\tUnidad\\nSubtotal:\\t5808000.00\\tBRL\\nFecha de entrega:\\t31.10.2023\\n\\n"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='COMPANY_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='COMPANY_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"COMPANY_CODE","Value":"EBA"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='COMPANY_NAME')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='COMPANY_NAME')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"COMPANY_NAME","Value":"eBazar.com.br Limitada"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='SUPPLIER')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='SUPPLIER')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"SUPPLIER","Value":"9600020471"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PAYMENT_TERM_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PAYMENT_TERM_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PAYMENT_TERM_CODE","Value":"ML60"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='INCO_TERMS_CODE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='INCO_TERMS_CODE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"INCO_TERMS_CODE","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_GROUP')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_GROUP')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PURCHASING_GROUP","Value":"BPB"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_ORG')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_ORG')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PURCHASING_ORG","Value":"BR1P"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='COMPLIANCE_POLICY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='COMPLIANCE_POLICY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"COMPLIANCE_POLICY","Value":""},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_TYPE')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_TYPE')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PURCHASING_TYPE","Value":"06"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_CATEGORY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_CATEGORY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PURCHASING_CATEGORY","Value":"00"},{"__metadata":{"id":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_SUBCATEGORY')","uri":"https://sapts401.melisap.com:44301/sap/opu/odata/IWPGW/TASKPROCESSING;mo;v=2/CustomAttributeCollection(SAP__Origin='LOCAL_TGW',InstanceID='000003121881',Name='PURCHASING_SUBCATEGORY')","type":"TASKPROCESSING.CustomAttribute"},"SAP__Origin":"LOCAL_TGW","InstanceID":"000003121881","Name":"PURCHASING_SUBCATEGORY","Value":"00"}]}}]}`);
				oData.results.forEach(oEntry => oEntry.CreatedOn = new Date(oEntry.CreatedOn));
			}
			// TODO: !!!REMOVE!!!

			var aTasks = oData.results;

			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
				aTasks = this._dataMassage(oData.results);

			const oTaskListModel = new JSONModel({ TaskCollection: aTasks });
			this.getView().setModel(oTaskListModel, "taskList");

			this._loadCustomAttributesDeferredForTasks?.resolve();
			this._filterDeferred?.resolve();

			const oTaskListData = this._processTaskListData(aTasks);
			this._initTabBars();
			this._createTabFilters(oTaskListData);
		},

		_processTaskListData: function (aTasks) {

			const newTaskGroup = () => ({ count: 0, tasks: [] }); //Helper fn

			const oTaskListData = aTasks.reduce((oTaskListData, oTask) => {
				// Build  By source group
				oTaskListData.bySource[oTask.SAP__Origin] ||= newTaskGroup();
				oTaskListData.bySource[oTask.SAP__Origin].count++;
				oTaskListData.bySource[oTask.SAP__Origin].tasks.push(oTask);

				// Build  By source | TaskDefinitionName group
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinitionName ||= {};
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinitionName[oTask.TaskDefinitionName] ||= newTaskGroup();
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinitionName[oTask.TaskDefinitionName].count++;
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinitionName[oTask.TaskDefinitionName].tasks.push(oTask);

				// Build  By status group
				oTaskListData.byStatus[oTask.Status] ||= newTaskGroup();
				oTaskListData.byStatus[oTask.Status].count++;
				oTaskListData.byStatus[oTask.Status].tasks.push(oTask);

				// Build  By Priority group
				oTaskListData.byPriority[oTask.Priority] ||= newTaskGroup();
				oTaskListData.byPriority[oTask.Priority].count++;
				oTaskListData.byPriority[oTask.Priority].tasks.push(oTask);

				if (oTask.CompletionDeadLine) {
					oTaskListData.withCompletionDeadLine.count++;
					oTaskListData.withCompletionDeadLine.tasks.push(oTask);
				}

				return oTaskListData;
			}, {
				allTasks: newTaskGroup(),
				bySource: {},
				byStatus: {},
				byPriority: {},
				withCompletionDeadLine: newTaskGroup()
			});

			// Fill All Tasks group
			oTaskListData.allTasks.count = aTasks.length;
			oTaskListData.allTasks.tasks = [...aTasks];

			return oTaskListData;
		},

		_createTabFilters: function (oTaskListData) {

			/// MAIN > ALL TASKS ///
			const oAllTasksIconTabFilter = new sap.m.IconTabFilter({
				key: "ALL",
				text: this._getI18nCustomText("All"),
				showAll: true,
				count: oTaskListData.allTasks.count
			});
			this._oMainIconTabBar.addItem(oAllTasksIconTabFilter);
			this._oGroupsMap.set(oAllTasksIconTabFilter, oTaskListData.allTasks);

			/// SUB > ALL TASKS ///
			const oAllSubIconTabFilter = new sap.m.IconTabFilter({
				key: "ALL",
				text: this._getI18nCustomText("All"),
				count: oTaskListData.allTasks.count
			});
			this._oSubIconTabBar.addItem(oAllSubIconTabFilter);
			this._oGroupsMap.set(oAllSubIconTabFilter, oTaskListData.allTasks);

			if (Object.keys(oTaskListData.bySource).length) {
				/// MAIN > |SEPARATOR| ///
				this._oMainIconTabBar.addItem(new sap.m.IconTabSeparator);

				for (const sSource in oTaskListData.bySource) {
					const oTaskGroupBySource = oTaskListData.bySource[sSource];
					/// MAIN > (EACH) SOURCE ///
					const oBySourceIconTabFilter = new sap.m.IconTabFilter({
						key: "bySource__" + sSource,
						text: this._getI18nCustomText(`Source.${sSource}`),
						icon: this._getI18nCustomText(`Source.${sSource}.Icon`),
						count: oTaskGroupBySource.count
					});
					this._oMainIconTabBar.addItem(oBySourceIconTabFilter);
					this._oGroupsMap.set(oBySourceIconTabFilter, oTaskGroupBySource);

					for (const sTaskDefinitionName in oTaskGroupBySource.byTaskDefinitionName) {
						const oTaskGroupByTaskDefinitionName = oTaskGroupBySource.byTaskDefinitionName[sTaskDefinitionName];
						/// SUB > BY TASK DEFINITION ///
						const oByTaskDefinitionIconTabFilter = new sap.m.IconTabFilter({
							key: "bySource__" + sSource + "__byTaskDefinitionName__" + sTaskDefinitionName,
							text: sTaskDefinitionName,
							count: oTaskGroupByTaskDefinitionName.count
						});
						if (this._bUseSubIconTabBar)
							this._oSubIconTabBar.addItem(oByTaskDefinitionIconTabFilter);
						else
							oBySourceIconTabFilter.addItem(oByTaskDefinitionIconTabFilter);
						this._oGroupsMap.set(oByTaskDefinitionIconTabFilter, oTaskGroupByTaskDefinitionName);
					}
				}
			}
			/// MAIN > |SEPARATOR| ///
			this._oMainIconTabBar.addItem(new sap.m.IconTabSeparator);

			/// MAIN > BY STATUS ///
			const oByStatusIconTabFilter = new sap.m.IconTabFilter({
				key: "byStatus",
				text: this._getI18nCustomText("ByStatus"),
				icon: this._getI18nCustomText("ByStatus.Icon"),
			});
			this._oMainIconTabBar.addItem(oByStatusIconTabFilter);
			this._oGroupsMap.set(oByStatusIconTabFilter, oTaskListData.allTasks);

			for (const sStatus in oTaskListData.byStatus) {
				const oTaskGroupByStatus = oTaskListData.byStatus[sStatus];

				/// SUB > BY STATUS ///
				const oByStatusSubIconTabFilter = new sap.m.IconTabFilter({
					key: "byStatus__" + sStatus,
					text: this._getI18nCustomText(`Status.${sStatus}`),
					icon: this._getI18nCustomText(`Status.${sStatus}.Icon`) || undefined,
					iconColor: this._getI18nCustomText(`Status.${sStatus}.IconColor`) || undefined,
					count: oTaskGroupByStatus.count
				});
				if (this._bUseSubIconTabBar)
					this._oSubIconTabBar.addItem(oByStatusSubIconTabFilter);
				else
					oByStatusIconTabFilter.addItem(oByStatusSubIconTabFilter);
				this._oGroupsMap.set(oByStatusSubIconTabFilter, oTaskGroupByStatus);

			}

			/// MAIN > BY PRIORITY ///
			const oByPriorityIconTabFilter = new sap.m.IconTabFilter({
				key: "byPriority",
				text: this._getI18nCustomText("ByPriority"),
				icon: this._getI18nCustomText("ByPriority.Icon"),
			});
			this._oMainIconTabBar.addItem(oByPriorityIconTabFilter);
			this._oGroupsMap.set(oByPriorityIconTabFilter, oTaskListData.allTasks);

			for (const sPriority in oTaskListData.byPriority) {
				const oTaskGroupByPriority = oTaskListData.byPriority[sPriority];
				/// SUB > BY PRIORITY ///
				const oByPrioritySubIconTabFilter = new sap.m.IconTabFilter({
					key: "byPriority__" + sPriority,
					text: this._getI18nCustomText(`Priority.${sPriority}`),
					icon: this._getI18nCustomText(`Priority.${sPriority}.Icon`) || undefined,
					iconColor: this._getI18nCustomText(`Priority.${sPriority}.IconColor`) || undefined,
					count: oTaskGroupByPriority.count
				});
				if (this._bUseSubIconTabBar)
					this._oSubIconTabBar.addItem(oByPrioritySubIconTabFilter);
				else
					oByPriorityIconTabFilter.addItem(oByPrioritySubIconTabFilter);
				this._oGroupsMap.set(oByPrioritySubIconTabFilter, oTaskGroupByPriority);
			}

			/// MAIN > DUE ///
			const oNewMainIconTabFilter = new sap.m.IconTabFilter({
				key: "withCompletionDeadLine",
				text: this._getI18nCustomText("TaskDue"),
				icon: this._getI18nCustomText("TaskDue.Icon"),
				count: oTaskListData.withCompletionDeadLine.count
			});
			this._oMainIconTabBar.addItem(oNewMainIconTabFilter);
			this._oGroupsMap.set(oNewMainIconTabFilter, oTaskListData.withCompletionDeadLine);


			// /*******************************************************/
			// /*******************************************************/
			// /*******************************************************/
			// this.getView().getModel("taskListView").setProperty("/allTaskCount", iTotal);
			// this.getView().getModel("taskListView").setProperty("/DueCount", iDue);

			// for (var key in oSources) {
			// 	console.log("minhas tasks", key, oSources[key])
			// 	var propTab = "/" + key + "Count"
			// 	this.getView().getModel("taskListView").setProperty(propTab, oSources[key].count);

			// 	if (oSources[key].tasks) {
			// 		var tabFilterSource = this.byId("tabFilter" + key + "Id");
			// 		tabFilterSource.removeAllItems();
			// 		for (var key2 in oSources[key].tasks) {
			// 			tabFilterSource.addItem(new sap.m.IconTabFilter({
			// 				key: "TaskDefinitionName>>" + key2,
			// 				text: key2,
			// 				count: oSources[key].tasks[key2]
			// 			}));
			// 		};
			// 	}
			// };

			// var tabFilterStatus = this.byId("tabFilterStatusId");
			// tabFilterStatus.removeAllItems();
			// for (var key in oStatus) {
			// 	tabFilterStatus.addItem(new sap.m.IconTabFilter({
			// 		key: "Status>>" + key,
			// 		text: key,
			// 		count: oStatus[key]
			// 	}));
			// };

			// var tabFilterPriority = this.byId("tabFilterPriorityId");
			// tabFilterPriority.removeAllItems();
			// for (var key in oPriorities) {
			// 	tabFilterPriority.addItem(new sap.m.IconTabFilter({
			// 		key: "Priority>>" + key,
			// 		text: key,
			// 		count: oPriorities[key]
			// 	}));
			// };

			// var iconTabBar = this.byId("idMainIconTabBar");
			// var that = this;
			// iconTabBar.attachSelect(function (oEvent) {
			// 	var oBinding = that.byId("taskListTable").getBinding("items");
			// 	console.log()
			// 	var aFilters = [];
			// 	var sKey = oEvent.getParameter("key");
			// 	console.log("onFilterSelect", sKey);

			// 	if (sKey === "DUE") {
			// 		aFilters.push(
			// 			new sap.ui.model.Filter("CompletionDeadLine", "NE", undefined)
			// 		);
			// 	} else if (sKey !== "ALL" && sKey !== "STATUS" && sKey !== "PRIORITY") {
			// 		const filter = sKey.split(">>", 2);
			// 		console.log("onFilterSelect split", filter[0], filter[1]);
			// 		aFilters.push(
			// 			new sap.ui.model.Filter(filter[0], "EQ", filter[1])
			// 		);
			// 	}
			// 	oBinding.filter(aFilters);
			// 	that.byId("taskListTable").getColumns()[8].setVisible(true);
			// 	that.byId("taskListTable").getColumns()[9].setVisible(true);
			// });
			// //############ Custom Gabriel Fim ##########

		},

		_initTabBars: function () {
			// Init Tab Bars
			this._oMainIconTabBar.destroyItems();
			this._oSubIconTabBar.destroyItems();
			this._oSubIconTabBar.setVisible(false);
			this._oGroupsMap.clear();
		},

		onSelectMainIconTabBar: function (oEvent) {
			const oSelectedItem = oEvent.getParameter("selectedItem");
			const oTaskGroup = oSelectedItem && this._oGroupsMap.get(oSelectedItem);

			if (this._bUseSubIconTabBar && (oEvent.getSource() === this._oMainIconTabBar)) {
				// Toggle Sub IconTabFilters visibility
				this._oSubIconTabBar.getItems().forEach(oItem => {
					const bShowSubIconTabFilter = (oItem.getKey() === "ALL") || oItem.getKey().startsWith(oSelectedItem.getKey());
					oItem.setVisible(bShowSubIconTabFilter);
				});

				// Toggle Sub IconTabBar visibility
				const bShowSubIconTabBar = this._oSubIconTabBar.getItems().some(oItem =>
					(oItem.getKey() !== "ALL") && oItem.getVisible()
				);
				this._oSubIconTabBar.setVisible(bShowSubIconTabBar);
				this._oSubIconTabBar.setSelectedKey("ALL");
			}
			this.getView().getModel("taskList").setProperty("/TaskCollection", oTaskGroup.tasks);

			// this._oTable.getColumns()[8].setVisible(true);
			// this._oTable.getColumns()[9].setVisible(true);
		},

		onTaskSelected: function (oEvent) {
			const oBindingContext = oEvent.getSource().getBindingContext("taskList");
			const oParameters = {
				SAP__Origin: oBindingContext.getProperty("SAP__Origin"),
				InstanceID: oBindingContext.getProperty("InstanceID"),
				contextPath: "TaskCollection(SAP__Origin='" + oBindingContext.getProperty("SAP__Origin") + "',InstanceID='" + oBindingContext.getProperty("InstanceID") + "')"
			};
			this.selectedTaskPath = oBindingContext.getPath();
			return this.oRouter.navTo("detail_deep", oParameters, false);
		},

		onUpdateFinished: function (oEvent) {
			const oTaskListViewModel = this.getView().getModel("taskListView");
			const iItemCount = oEvent.getParameter("total");

			this.mainViewModel.setProperty("/busy", false);
			if (Device.system.phone)
				return;

			oTaskListViewModel.setProperty("/taskListCount", iItemCount);

			oTaskListViewModel.setProperty("/taskListTitle", iItemCount ?
				this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME_COUNT", [iItemCount]) :
				this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME"));

			oTaskListViewModel.setProperty("/noDataText", this._oResourceBundle.getText("view.Workflow.noDataTasks"));
		}
	});
});