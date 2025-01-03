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
	"cross/fnd/fiori/inbox/util/tools/Application",
	"cross/fnd/fiori/inbox/Main.controller", // Workaround to force Main.onInit before S2.onInit
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
	"cross/fnd/fiori/inbox/util/Constants",
	"sap/base/util/Version",
	"cross/fnd/fiori/inbox/CA_FIORI_INBOXExtension2/util/CustomFormatters",
], function (UIComponent, XMLView, Sorter, Filter, FilterOperator, JSONModel, Column, MessageToast,
	MessageBox, TablePersoController, GroupHeaderListItem, TableOperations, TaskListGroupingHelper,
	TaskListSortingHelper, TaskListCustomAttributeHelper, DataManager, BaseController, Application, Main, PositiveAction,
	NegativeAction, Button, Log, ConfirmationDialogManager, ForwardPopUp, ResubmitPopUp, MultiSelectDialog, ActionHelper,
	CommonFunctions, ForwardSimple, Conversions, syncStyleClass, Device, MessagePopoverItem, library,
	MessagePopover, Fragment, DateFormat, jquery, Constants, Version, CustomFormatters) {
	"use strict";
	let ButtonType = library.ButtonType;
	const I18N_CUSTOM_PREFIX = "custom.meli.";
	const C_ARIBA = 'ARIBA_TGW';
	const C_MENDEL = "MENDEL_TGW";
	const C_CONCUR = "CONCUR_TGW";
	const C_CONCUR_MENDEL = "CONCUR_MENDEL_TGW";
	const C_FIRST_APROV_NAME_KEY = "CUS_FIRST_APROV_NAME";
	const C_FIRST_APROV_NAME_VALUE = "Buyer Procurement Desk Agent";
	const C_PERSO_PREDEFINED = {
		"TaskSelectorsEnabled": {
			"bySource__LOCAL_FIGR_TGW__byTaskDefinition__FIGRP_SHIP": true,
			"bySource__LOCAL_TGW__byTaskDefinition__TS99800060_WS99800005_0000000032": true,
			"bySource__LOCAL_TGW__byTaskDefinition__TS99800064_WS20000079_0000000070": true,
			"bySource__LOCAL_TGW__byTaskDefinition__TS20000166": true,
			"bySource__ARIBA_TGW__byTaskDefinition__ARIBA_PRV2": true
		},
		"PersonalizationPayload": {
			"_persoSchemaVersion": "1.0",
			"aColumns": [
				{
					"text": "Doc. compras",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS20000166PO_NUMBERColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS20000166PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS20000166CURRENCYColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS20000166COMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166COMPANY_NAMEColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 4,
					"visible": true,
					"id": "table-taskListTable-TS20000166SUPPLIERColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS20000166SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PAYMENT_TERM_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PAYMENT_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166SUPPLIER_PAYMENT_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166INCO_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166INCO_TERMS_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166REQUESTING_USERColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PURCHASING_GROUPColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PURCHASING_ORGColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166COMPLIANCE_POLICYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PURCHASING_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PURCHASING_CATEGORYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166PURCHASING_SUBCATEGORYColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS20000166LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS20000166USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS20000166HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "Descripción de la compra",
					"order": 10,
					"visible": true,
					"id": "table-taskListTable-TS20000166COMMENTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166B_PRICEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000166COUNTRYColumn",
					"group": null
				},
				{
					"text": "Doc. compras",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS20000172PO_NUMBERColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS20000172PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS20000172CURRENCYColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS20000172COMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172COMPANY_NAMEColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 4,
					"visible": true,
					"id": "table-taskListTable-TS20000172SUPPLIERColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS20000172SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PAYMENT_TERM_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PAYMENT_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172SUPPLIER_PAYMENT_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172INCO_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172INCO_TERMS_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172REQUESTING_USERColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PURCHASING_GROUPColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PURCHASING_ORGColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172COMPLIANCE_POLICYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PURCHASING_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PURCHASING_CATEGORYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172PURCHASING_SUBCATEGORYColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS20000172LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS20000172USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS20000172HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "Descripción de la compra",
					"order": 10,
					"visible": true,
					"id": "table-taskListTable-TS20000172COMMENTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172B_PRICEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS20000172COUNTRYColumn",
					"group": null
				},
				{
					"text": "Doc. compras",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS99800064CONTRACT_NUMBERColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS99800064PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS99800064CURRENCYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PAYMENT_TERM_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PAYMENT_TERMColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064SUPPLIER_PAYMENT_TERMSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064INCO_TERMS_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064INCO_TERMSColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 4,
					"visible": true,
					"id": "table-taskListTable-TS99800064SUPPLIERColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS99800064SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS99800064COMPANYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064COMPANY_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PURCHASING_GROUPColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PURCHASING_ORGColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064DOCUMENT_CLASSColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064REQUESTING_USERColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064COMPLIANCE_POLICYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PURCHASING_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PURCHASING_CATEGORYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064PURCHASING_SUBCATEGORYColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS99800064LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS99800064USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS99800064HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 10,
					"visible": true,
					"id": "table-taskListTable-TS99800064COMMENTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064B_PRICEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800064COUNTRYColumn",
					"group": null
				},
				{
					"text": "Doc. compras",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2PR_NUMBERColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2CURRENCYColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2COMPANYColumn",
					"group": null
				},
				{
					"text": "Proveedor",
					"order": 4,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2SUPPLIERColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2OWNERColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2CREATE_DATEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2PURCHASING_GROUPColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2PURCHASING_ORGColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2CUS_CATEGORIAColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2CUS_SUBCATEGORIAColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2CUS_FIRST_APROV_NAMEColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-ARIBA_PRV2USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2TERMS_PAYMENTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-ARIBA_PRV2COUNTRYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPSHIPMENT_NOColumn",
					"group": null
				},
				{
					"text": "",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPCOMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPCOMPANY_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 4,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPSUPPLIER_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPSUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPTOTALColumn",
					"group": null
				},
				{
					"text": "",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-FIGRP_SHIPCURRENCYColumn",
					"group": null
				},
				{
					"text": "Nro Doc",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS99800060DOC_NUMBERColumn",
					"group": null
				},
				{
					"text": "Fiscal Year",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS99800060FISCAL_YEARColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS99800060COMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060COMPANY_DESCColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS99800060SUPPLIER_IDColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS99800060SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060REFERENCEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060CREATE_BYColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS99800060PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS99800060CURRENCYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060DOC_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060DOC_TYPE_DESCColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060DOC_DATEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060MSGColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS99800060LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS99800060USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS99800060HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800060COUNTRYColumn",
					"group": null
				},
				{
					"text": "Nro Doc",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS00407862DOC_NUMBERColumn",
					"group": null
				},
				{
					"text": "Fiscal Year",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS00407862FISCAL_YEARColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS00407862COMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862COMPANY_DESCColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS00407862SUPPLIER_IDColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS00407862SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862REFERENCEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862CREATE_BYColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS00407862PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS00407862CURRENCYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862DOC_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862DOC_TYPE_DESCColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862DOC_DATEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862MSGColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS00407862LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS00407862USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS00407862HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00407862COUNTRYColumn",
					"group": null
				},
				{
					"text": "Nro Doc",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS99800061DOC_NUMBERColumn",
					"group": null
				},
				{
					"text": "Fiscal Year",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS99800061FISCAL_YEARColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS99800061COMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061COMPANY_DESCColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS99800061SUPPLIER_IDColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS99800061SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061REFERENCEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061CREATE_BYColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS99800061PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS99800061CURRENCYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061DOC_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061DOC_TYPE_DESCColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061DOC_DATEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061MSGColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS99800061LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS99800061USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS99800061HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS99800061COUNTRYColumn",
					"group": null
				},
				{
					"text": "Nro Doc",
					"order": 1,
					"visible": true,
					"id": "table-taskListTable-TS00007914DOC_NUMBERColumn",
					"group": null
				},
				{
					"text": "Fiscal Year",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS00007914FISCAL_YEARColumn",
					"group": null
				},
				{
					"text": "Sociedad",
					"order": 3,
					"visible": true,
					"id": "table-taskListTable-TS00007914COMPANY_CODEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914COMPANY_DESCColumn",
					"group": null
				},
				{
					"text": "N° proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS00007914SUPPLIER_IDColumn",
					"group": null
				},
				{
					"text": "Nombre del Proveedor",
					"order": 5,
					"visible": true,
					"id": "table-taskListTable-TS00007914SUPPLIER_NAMEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914REFERENCEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914CREATE_BYColumn",
					"group": null
				},
				{
					"text": "Valor total",
					"order": 7,
					"visible": true,
					"id": "table-taskListTable-TS00007914PRICEColumn",
					"group": null
				},
				{
					"text": "Moneda Local",
					"order": 6,
					"visible": true,
					"id": "table-taskListTable-TS00007914CURRENCYColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914DOC_TYPEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914DOC_TYPE_DESCColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914DOC_DATEColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914MSGColumn",
					"group": null
				},
				{
					"text": "Último Aprobador",
					"order": 9,
					"visible": true,
					"id": "table-taskListTable-TS00007914LAST_APPROVERColumn",
					"group": null
				},
				{
					"text": "Importe en USD",
					"order": 8,
					"visible": true,
					"id": "table-taskListTable-TS00007914USD_CURRENCYColumn",
					"group": null
				},
				{
					"text": "Título",
					"order": 2,
					"visible": true,
					"id": "table-taskListTable-TS00007914HEADER_TEXTColumn",
					"group": null
				},
				{
					"text": "",
					"order": 99,
					"visible": false,
					"id": "table-taskListTable-TS00007914COUNTRYColumn",
					"group": null
				}
			]
		}
	};


	const C_PERSO_PREDEFINED_COLUMNS = [
		"DOC_NUMBERColumn",
		"PO_NUMBERColumn",
		"PR_NUMBERColumn",
		"CONTRACT_NUMBERColumn",
		"HEADER_TEXTColumn",
		"COMPANY_CODEColumn",
		"COMPANYColumn",
		"SUPPLIERColumn",
		"SUPPLIER_NAMEColumn",
		"CURRENCYColumn",
		"PRICEColumn",
		"USD_CURRENCYColumn",
		"LAST_APPROVERColumn",
		"COMMENTColumn",
	];



	return sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.view.S2_TaskListCustom", {

		Conversions: Conversions,
		Resubmit: ResubmitPopUp,

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
			return aTaskDefinitions.reduce((oColumns, oTaskDefinition) => {
				oTaskDefinition.TaskDefinitionID = oTaskDefinition.TaskDefinitionID?.toUpperCase();
				oColumns[oTaskDefinition.TaskDefinitionID] = oTaskDefinition.CustomAttributeDefinitionData?.results;
				return oColumns;
			}, {});
		},

		/**
		 * Used to add those select properties in TaskCollection call that need to be checked in metadata first (i.e. "SubstitutedUser", "SubstitutedUserName")
		 */
		fnAddAditionalSelectPropertiesAndInitBinding: function () {
			var oDataManager = this.oDataManager;

			return oDataManager.oModel.getMetaModel().loaded().then(function () {
				oDataManager.oServiceMetaModel = oDataManager.oModel.getMetaModel();

				if (oDataManager.checkPropertyExistsInMetadata("SubstitutedUser"))
					this._aTaskPropertiesForSelect.push("SubstitutedUser");
				if (oDataManager.checkPropertyExistsInMetadata("SubstitutedUserName"))
					this._aTaskPropertiesForSelect.push("SubstitutedUserName");
				if (oDataManager.checkPropertyExistsInMetadata("ConfidenceLevel", "Task"))
					this._aTaskPropertiesForSelect.push("ConfidenceLevel");

				// Processor, ProcessorName, SubstitutedUser, SubstitutedUserName, ForwardedUser+
				if (oDataManager.checkPropertyExistsInMetadata("Processor"))
					this._aTaskPropertiesForSelect.push("Processor");
				if (oDataManager.checkPropertyExistsInMetadata("ProcessorName"))
					this._aTaskPropertiesForSelect.push("ProcessorName");
				if (oDataManager.checkPropertyExistsInMetadata("ForwardedUser"))
					this._aTaskPropertiesForSelect.push("ForwardedUser");
			}.bind(this));
		},



		_initTaskModel: async function () {

			// Get Task count
			this._oTable.setBusy(true);
			this._disableTableSetBusy();

			this._bUseSubIconTabBar = true;
			this._oGroupsMap = new Map();

			this._oFilterBarView ??= this.byId("taskListPage").getContent?.()[0];
			if (!this._oFilterBarView?.getControllerName?.())
				delete this._oFilterBarView;
			this._oFilterBar ??= this._oFilterBarView?.byId?.("filterBar");
			this._oFilterBar?.clear?.();

			this._oProgressIndicator ??= this.byId("idLoadingProgressIndicator");
			this._oMainIconTabBar ??= this.byId("idMainIconTabBar")
				.attachSelect(this.onSelectIconTabBar.bind(this));
			this._oSubIconTabBar ??= this.byId("idSubIconTabBar")
				.attachSelect(this.onSelectIconTabBar.bind(this));
			this._initTabBars();

			// Init taskList model
			const aTaskListModel = new JSONModel({
				TaskCollection: [],
				TaskCollectionAll: []
			});
			this.getView().setModel(aTaskListModel, "taskList");

			// show progress bar
			setTimeout(this._displayProgressIndicator.bind(this), 500);

			const [ProviderSystemData, _dummy] = await Promise.all([
				this.getProviderSystem(),
				this.fnAddAditionalSelectPropertiesAndInitBinding()
			]);

			this._oProgressIndicator.setPercentValue(Math.max(10, this._oProgressIndicator.getPercentValue()));

			// draw empty icon tab filters
			this._createTabFiltersDisabled(ProviderSystemData);

			// set up Request configuration
			const aFilters = [this._getinitialStatusFilters()];
			const oTaskDefinitionFilter = this._getTaskDefinitionFilters();

			if (oTaskDefinitionFilter)
				aFilters.push(oTaskDefinitionFilter);

			let oCurrentSorter = this._getCurrentSorter();
			let oSelect = this._getTaskPropertiesToFetch().join(",");
			let sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;

			this._iTaskCount = 0;
			this._aODataModelCountPromises = ProviderSystemData.map(function (oProviderSystem) {

				let sServiceUrlProv = sServiceUrl + ';o=' + oProviderSystem.SAP__Origin;
				const oSAPOriginFilter = this._getSAPOriginFilters(oProviderSystem.SAP__Origin);

				const oFilter = new Filter({
					filters: [...aFilters, oSAPOriginFilter],
					and: true
				});

				let oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrlProv, {
					useBatch: false
				});

				const oRequestConfiguration = {
					filters: [oFilter],
					sorters: oProviderSystem.SAP__Origin === C_ARIBA ? [] : [oCurrentSorter],
					urlParameters: {
						$select: oSelect
					}
				};

				if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
					oRequestConfiguration.urlParameters.$expand = "CustomAttributeData";

				const pDataCountRead = new Promise(function (resolve, reject) {
					oModel.read("/TaskCollection/$count", {
						filters: [oFilter],
						success: function (oData, oResponse) { return resolve([oData, oResponse]); },
						// success: this._handleProviderSystemCountResponse.bind(this, oRequestConfiguration, oModel, ProviderSystem.SAP__Origin),
						error: function (oError) {
							return MessageToast.show(oProviderSystem.SAP__Origin + ": " + oError.message + " " + oError.responseText);
						},
					});
				}.bind(this));

				// call partial OData read handler
				pDataCountRead
					.then(
						this._handleProviderSystemCountResponse.bind(this, oRequestConfiguration, oModel, oProviderSystem.SAP__Origin),
						function (oError) {
							return MessageToast.show(oProviderSystem.SAP__Origin + ": " + oError.message + " " + oError.responseText);
						}
					);

				return pDataCountRead;
			}.bind(this));

			Promise.all(this._aODataModelCountPromises)
				.then(this._handleProviderSystemCountResponsesAllFinished.bind(this))
		},

		_getSAPOriginFilters: function (sSAPOrigin) {
			return new Filter("SAP__Origin", FilterOperator.EQ, sSAPOrigin);
		},

		_handleProviderSystemCountResponsesAllFinished: function (aResponses) {
			console.log(">>> ALL COUNT FINISHED <<<");
			this._oProgressIndicator.setPercentValue(Math.max(30, this._oProgressIndicator.getPercentValue()));

			// set final Data read handler
			Promise.all(this._aODataModelReadPromises)
				.then(this.onSuccessTaskCollectionRequestComplete.bind(this))
				.then(function () {
					delete this._aODataModelReadPromises;
				}.bind(this))
		},
		_handleProviderSystemCountResponse: function (oRequestConfiguration, pDataModel, ProviderSystem, [iTaskCount, oResponse]) {

			this._oProgressIndicator.setPercentValue(this._oProgressIndicator.getPercentValue() + 3);

			this._aODataModelReadPromises ??= [];
			let _iTaskCount = Number(iTaskCount);
			let _iSkip = 0;

			console.log(">>> " + ProviderSystem + " GOT COUNT: " + _iTaskCount + " TASKS <<<");
			this._iTaskCount += _iTaskCount;

			const iTargetChunkSize = Math.min(200, this.oDataManager.getListSize());
			const iChunkSize = ProviderSystem === C_ARIBA
				? 10
				: Math.ceil(_iTaskCount / Math.max(Math.round(_iTaskCount / iTargetChunkSize), 1));

			let _iRemainingTaskCount = _iTaskCount;
			// fire chunks reads
			do {
				if (_iRemainingTaskCount <= 0)
					break;

				_iRemainingTaskCount -= iChunkSize;
				const pDataModelRead = new Promise(function (resolve, reject) {
					const sGroupId = Math.random().toString(36).slice(2, 8); // e.g.: 's5gzlj'
					pDataModel.read("/TaskCollection", {
						...oRequestConfiguration,
						success: function (oData, oResponse) { return resolve([oData, oResponse]); },
						error: function (oError) { return reject(oError); },
						groupId: sGroupId,
						urlParameters: {
							...oRequestConfiguration.urlParameters,
							$top: iChunkSize,
							$skip: _iSkip
						}
					});
					pDataModel.submitChanges({
						groupId: sGroupId
					});
				}.bind(this));

				// call partial OData read handler
				pDataModelRead.then(this.onSuccessTaskCollectionRequest.bind(this, ProviderSystem), function (oError) {
					return MessageToast.show(ProviderSystem + ": " + oError.message + " " + oError.responseText);
				});
				// collect Promises
				this._aODataModelReadPromises.push(pDataModelRead);

				_iSkip += iChunkSize;
			} while (_iRemainingTaskCount > 0);

		},

		onSuccessTaskCollectionRequest: function (ProviderSystem, [oData, oResponse]) {

			// Se ejecuta por cada CHUNK o BATCH de Tasks			
			if (oResponse.statusCode != 200)
				return MessageToast.show(oResponse.statusText + ":" + oResponse.body);

			console.log(`>>> ${ProviderSystem} GOT CHUNK WITH ${oData.results.length} TASKS. <<<`);
			let aTasks = oData.results;

			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
				aTasks = this._dataMassage(oData.results);

			// To remove PR above with firstAprovalName 'Buyer Procurement Desk Agent'
			aTasks = aTasks.filter(oTask => oTask.SAP__Origin === C_ARIBA
				? this._hasValidFirstApproverName(oTask)
				: true
			);

			// Add tasks to taskList model
			let aTaskListModel = this.getView().getModel("taskList");

			aTasks = [
				...aTaskListModel.getProperty("/TaskCollectionAll"),
				...aTasks
			];
			//Esto es una copia exacta para que no afecte cuando se seleccione algún Icon Tab que se modifica el TaskCollection
			aTaskListModel.setProperty("/TaskCollectionAll", aTasks);

			setTimeout(function () {
				const nCurrentLoadingProgress = 30 + (aTasks.length / this._iTaskCount) * 60;
				this._oProgressIndicator.setPercentValue(Math.max(nCurrentLoadingProgress, this._oProgressIndicator.getPercentValue()));
			}.bind(this), 0);
		},

		onSuccessTaskCollectionRequestComplete: function (oData, oResponse) {
			console.log(`>>> ALL TASKS RETRIEVED. <<<`);
			this._loadCustomAttributesDeferredForTasks?.resolve();
			this._filterDeferred?.resolve();

			const aTasks = this.getView().getModel("taskList").getProperty("/TaskCollectionAll");

			const oTaskListData = this._processTaskListData(aTasks);
			this._initTabBars();
			this._createTabFilters(oTaskListData);

			this._enableTableSetBusy();
			this._oTable.setBusy(false);

			// Set by default selected key
			this._restoreOrInitIconTabBarSelectedKey();

			this._oProgressIndicator.setPercentValue(100);
			setTimeout(this._hideProgressIndicator.bind(this), 1000);
		},

		_restoreOrInitIconTabBarSelectedKey: function () {
			// const bLastSelectedMainBar = localStorage?.getItem("LastSelectedMainIconTabBar") === "true";
			// const bLastSelectedSubBar = localStorage?.getItem("LastSelectedSubIconTabBar") === "true";
			const sLastSelectedMainIconTabFilterKey = localStorage?.getItem("LastSelectedMainIconTabFilterKey");
			const sLastSelectedSubIconTabFilterKey = localStorage?.getItem("LastSelectedSubIconTabFilterKey");
			const oLastSelectedMainIconTabFilter = this._oMainIconTabBar.getItems().find(oItem => oItem.getVisible() && (oItem.getKey() === sLastSelectedMainIconTabFilterKey));
			const oLastSelectedSubIconTabFilter = this._oSubIconTabBar.getItems().find(oItem => oItem.getVisible() && (oItem.getKey() === sLastSelectedSubIconTabFilterKey));

			if (oLastSelectedMainIconTabFilter)
				this._oMainIconTabBar.setSelectedKey(oLastSelectedMainIconTabFilter.getKey());
			if (oLastSelectedSubIconTabFilter)
				this._oSubIconTabBar.setSelectedKey(oLastSelectedSubIconTabFilter.getKey());

			// let oIconTabBarToSelect;
			// let oIconTabFilterToSelect;

			// if (bLastSelectedMainBar) {
			// 	oIconTabBarToSelect = this._oMainIconTabBar;
			// 	oIconTabFilterToSelect = oLastSelectedMainIconTabFilter;

			// } else if (bLastSelectedSubBar) {
			// 	oIconTabBarToSelect = this._oSubIconTabBar;
			// 	oIconTabFilterToSelect = oLastSelectedSubIconTabFilter;

			// } else {
			// 	oIconTabBarToSelect = this._oMainIconTabBar;
			// 	oIconTabFilterToSelect = this._oMainIconTabBar.getItems().find(oItem => oItem.getVisible?.());
			// }

			const oSelectEventMain = new sap.ui.base.Event("select", this._oMainIconTabBar, {
				item: oLastSelectedMainIconTabFilter,
				doNotSetSubIconTabBarItemSelected: true
			});
			this.onSelectIconTabBar(oSelectEventMain);
			const oSelectEventSub = new sap.ui.base.Event("select", this._oSubIconTabBar, {
				item: oLastSelectedSubIconTabFilter
			});
			this.onSelectIconTabBar(oSelectEventSub);
		},

		_displayProgressIndicator: function () {
			if (this._isProgressIndicatorDisplayed)
				return;
			this._oProgressIndicator.setPercentValue(0);
			this._oProgressIndicator.setVisible(true);
			this._isProgressIndicatorDisplayed = true;
		},

		_hideProgressIndicator: function () {
			this._oProgressIndicator.setVisible(false);
			this._oProgressIndicator.setPercentValue(0);
			delete this._isProgressIndicatorDisplayed;
		},

		_processTaskListData: function (aTasks) {

			const newTaskGroup = () => ({ count: 0, tasks: [] }); //Helper fn

			const oTaskListData = aTasks.reduce((oTaskListData, oTask) => {
				// Build  By source group
				oTaskListData.bySource[oTask.SAP__Origin] ||= newTaskGroup();
				oTaskListData.bySource[oTask.SAP__Origin].count++;
				oTaskListData.bySource[oTask.SAP__Origin].tasks.push(oTask);

				// Build  By source | TaskDefinition group
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinition ||= {};
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinition[oTask.TaskDefinitionID] ||= newTaskGroup();
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinition[oTask.TaskDefinitionID].count++;
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinition[oTask.TaskDefinitionID].tasks.push(oTask);
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinition[oTask.TaskDefinitionID].TaskDefinitionName ||= oTask.TaskDefinitionName;
				oTaskListData.bySource[oTask.SAP__Origin].byTaskDefinition[oTask.TaskDefinitionID].TaskDefinitionID ||= oTask.TaskDefinitionID;

				return oTaskListData;
			}, {
				allTasks: newTaskGroup(),
				bySource: {}
			});

			// Fill All Tasks group
			oTaskListData.allTasks.count = aTasks.length;
			oTaskListData.allTasks.tasks = [...aTasks];

			return oTaskListData;
		},

		_hasValidFirstApproverName: function (oTask) {
			var bIsValid = true;
			var aTask = oTask.CustomAttributeData.results.filter((task) => task.Name === C_FIRST_APROV_NAME_KEY);
			if (aTask && aTask[0] && aTask[0].Value === C_FIRST_APROV_NAME_VALUE)
				bIsValid = false;
			return bIsValid;
		},

		_createTabFiltersDisabled: function (aProviderSystemData) {
			aProviderSystemData.sort((oProviderSystemA, oProviderSystemB) => {
				const sSourceA = oProviderSystemA.SAP__Origin;
				const sSourceB = oProviderSystemB.SAP__Origin;
				const sSourceAText = this._getI18nCustomText(`Source.${sSourceA}`)
				const sSourceBText = this._getI18nCustomText(`Source.${sSourceB}`)
				return sSourceAText.localeCompare(sSourceBText);
			}).forEach(oProviderSystem => {
				const sSource = oProviderSystem.SAP__Origin;
				/// MAIN > (EACH) SOURCE ///
				const oBySourceIconTabFilter = new sap.m.IconTabFilter({
					key: "bySource__" + sSource,
					text: this._getI18nCustomText(`Source.${sSource}`),
					icon: this._getI18nCustomText(`Source.${sSource}.Icon`),
					enabled: false
				});
				oBySourceIconTabFilter.setTooltip(this._getI18nCustomText(`Source.${sSource}`));
				this._oMainIconTabBar.addItem(oBySourceIconTabFilter);
			});
		},

		_createTabFilters: function (oTaskListData) {

			// var oNewTaskListData = this._oCreateNewTaskListData(oTaskListData);

			for (const sSource in oTaskListData.bySource) {
				const oTaskGroupBySource = oTaskListData.bySource[sSource];
				/// MAIN > (EACH) SOURCE ///
				const oBySourceIconTabFilter = new sap.m.IconTabFilter({
					key: "bySource__" + sSource,
					text: this._getI18nCustomText(`Source.${sSource}`),
					icon: this._getI18nCustomText(`Source.${sSource}.Icon`),
					count: oTaskGroupBySource.count
				});
				oBySourceIconTabFilter.setTooltip(this._getI18nCustomText(`Source.${sSource}`));
				this._oMainIconTabBar.addItem(oBySourceIconTabFilter);
				this._oGroupsMap.set(oBySourceIconTabFilter, oTaskGroupBySource);

				for (const sKey in oTaskGroupBySource.byTaskDefinition) {
					const oTaskGroupByTaskDefinition = oTaskGroupBySource.byTaskDefinition[sKey];
					/// SUB > BY TASK DEFINITION ///
					const oByTaskDefinitionIconTabFilter = new sap.m.IconTabFilter({
						key: "bySource__" + sSource + "__byTaskDefinition__" + oTaskGroupByTaskDefinition.TaskDefinitionID,
						text: oTaskGroupByTaskDefinition.TaskDefinitionName,
						count: oTaskGroupByTaskDefinition.count,
						customData: [new sap.ui.core.CustomData({
							key: "TaskDefinitionID",
							value: oTaskGroupByTaskDefinition.TaskDefinitionID
						}), new sap.ui.core.CustomData({
							key: "TaskDefinitionName",
							value: oTaskGroupByTaskDefinition.TaskDefinitionName
						})]
					});
					if (this._bUseSubIconTabBar)
						this._oSubIconTabBar.addItem(oByTaskDefinitionIconTabFilter);
					else
						oBySourceIconTabFilter.addItem(oByTaskDefinitionIconTabFilter);
					this._oGroupsMap.set(oByTaskDefinitionIconTabFilter, oTaskGroupByTaskDefinition);
				}
			}
		},

		_oCreateNewTaskListData: function (oTasklistData) {
			var oNewBySource = {};

			var oCombinedTaskConcurMendelData = {
				count: 0,
				tasks: [],
				byTaskDefinition: {},
			};

			var oNewTaskListData = {
				allTask: {},
				bySource: {}
			}

			if (Object.keys(oTasklistData.bySource).length > 0) {

				for (const [oSourceKey, oSourceData] of Object.entries(oTasklistData.bySource)) {
					if (oSourceKey === C_MENDEL || oSourceKey === C_CONCUR) {
						oCombinedTaskConcurMendelData.count += oSourceData.count;
						oCombinedTaskConcurMendelData.tasks = oCombinedTaskConcurMendelData.tasks.concat(oSourceData.tasks);

						for (const [oDefKey, oDefData] of Object.entries(oSourceData.byTaskDefinition)) {
							if (!oCombinedTaskConcurMendelData.byTaskDefinition[oDefKey]) {
								oCombinedTaskConcurMendelData.byTaskDefinition[oDefKey] = { ...oDefData };
							} else {
								oCombinedTaskConcurMendelData.byTaskDefinition[oDefKey].count += oDefData.count;
								oCombinedTaskConcurMendelData.byTaskDefinition[oDefKey].tasks = oCombinedTaskConcurMendelData.byTaskDefinition[oDefKey].tasks.concat(oDefData.tasks);
							};
						}
					} else {
						oNewBySource[oSourceKey] = oSourceData;
					};
				}

				if (oCombinedTaskConcurMendelData.count > 0) {
					oNewBySource[C_CONCUR_MENDEL] = oCombinedTaskConcurMendelData;
				};

				oNewTaskListData = {
					...oTasklistData,
					bySource: oNewBySource
				};
			};

			return oNewTaskListData;
		},

		_initTabBars: function () {
			// Init Tab Bars
			this._oMainIconTabBar.destroyItems();
			this._oSubIconTabBar.destroyItems();
			this._oSubIconTabBar.setVisible(false);
			this._oGroupsMap.clear();
		},

		_disableTableSetBusy: function () {
			this._oTableSetBusy = this._oTable.setBusy;
			this._oTable.setBusy = () => { };
		},

		_enableTableSetBusy: function () {
			this._oTable.setBusy = this._oTableSetBusy.bind(this._oTable);
		},

		onSelectIconTabBar: function (oEvent) {

			const bMainBarSelected = oEvent.getSource() === this._oMainIconTabBar;
			const bSubBarSelected = oEvent.getSource() === this._oSubIconTabBar;

			const bDoNotSetSubIconTabBarItemSelected = oEvent.getParameter("doNotSetSubIconTabBarItemSelected");
			const oSelectedItem = oEvent.getParameter("item");
			if (!oSelectedItem)
				return;
			const sTaskKey = oSelectedItem.getKey();
			const oTaskGroup = this._oGroupsMap.get(oSelectedItem);

			// Store state for restoring later
			// localStorage?.setItem("LastSelectedMainIconTabBar", bMainBarSelected);
			// localStorage?.setItem("LastSelectedSubIconTabBar", bSubBarSelected);
			if (bMainBarSelected) {
				localStorage?.setItem("LastSelectedMainIconTabFilterKey", sTaskKey);
				localStorage?.removeItem("LastSelectedSubIconTabFilterKey");
			} else if (bSubBarSelected) {
				localStorage?.setItem("LastSelectedSubIconTabFilterKey", sTaskKey);
			}

			// Main IconTabBar
			if (this._bUseSubIconTabBar && bMainBarSelected) {
				this._updateSubIconTabBarItemsVisibility(oSelectedItem);
				if (!bDoNotSetSubIconTabBarItemSelected)
					this._setSubIconTabBarItemSelected(null);
			}

			// Sub IconTabBar
			if (this._bUseSubIconTabBar && bSubBarSelected) {
				this._setSelectedTaskKey(sTaskKey);
				// update filter for TaskDefinition
				this._updateFiltersOnTabSelected(oSelectedItem);

				this._updateTableItems(oTaskGroup.tasks);
				// this._updateTableColumns(sTaskKey);
				this._updatePersonalization(sTaskKey);
			}
		},

		_setSelectedTaskKey: function (sTaskKey) {
			this._selectedTaskKey = sTaskKey;
		},

		_getSelectedTaskKey: function () {
			return this._selectedTaskKey;
		},

		_updatePersonalization: function (sTaskKey) {
			let bRefresh = true;
			if (!this._oTablePersoController._oPersonalizations)
				return;

			if (C_PERSO_PREDEFINED.TaskSelectorsEnabled[sTaskKey]) {
				// let { aColumns } = this._oTablePersoController._oPersonalizations;
				this._oTablePersoController._oPersonalizations = C_PERSO_PREDEFINED["PersonalizationPayload"];
				// this._oTablePersoController._oPersonalizations = {
				// 	...this._oTablePersoController._oPersonalizations,
				// 	aColumns: aColumns
				// 		.map(oColumn => ({
				// 			...oColumn,
				// 			visible: false
				// 		}))
				// 		.reduce((aPredefColumns, oNewColConfig) => {
				// 			const idxPredefColConfig = aPredefColumns.findIndex(oPredefCol => oPredefCol.id === oNewColConfig.id)
				// 			if (idxPredefColConfig >= 0)
				// 				aPredefColumns[idxPredefColConfig].visible ||= oNewColConfig.visible;
				// 			else
				// 				aPredefColumns.push(oNewColConfig);

				// 			return aPredefColumns;
				// 		}, C_PERSO_PREDEFINED[sTaskKey].aColumns)
				// };
				this._oTable.getColumns().forEach(oCol => {
					const sColId = oCol.getId()
					const oColPerso = this._oTablePersoController._oPersonalizations.aColumns.find(oPerso => oPerso.id.includes(sColId));
					oCol.setVisible(oColPerso ? oColPerso.visible : false)
				});

				// this._oTablePersoController._oPersonalizations.aColumns.forEach(oPersoCol => {
				// 	const idx = C_PERSO_PREDEFINED_COLUMNS.findIndex(sCol => sCol.includes(oPersoCol.id));
				// 	if (idx > 0) {
				// 		oPersoCol.visible = true;
				// 		oPersoCol.order = idx;
				// 	} else {
				// 		oPersoCol.visible = false;
				// 	}
				// });
				// this._oTable.getColumns().forEach(oCol => {
				// 	const bVisible = C_PERSO_PREDEFINED_COLUMNS.some(sCol => sCol.includes(oCol.getId()));
				// 	oCol.setVisible(bVisible);
				// });
				this._oTablePersoController.getPersoService().setPersData(this._oTablePersoController._oPersonalizations);
			}
		},

		_updateTableItems: function (aTasks) {
			// update Task list items bound property
			this.getView().getModel("taskList").setProperty("/TaskCollection", aTasks);
		},

		_updateSubIconTabBarItemsVisibility: function (oMainIconTabBarSelectedItem) {
			// Toggle Sub IconTabFilters visibility
			const sMainIconTabBarSelectedKey = oMainIconTabBarSelectedItem.getKey();
			this._oSubIconTabBar.getItems().forEach(oItem => {
				const bShowSubIconTabFilter = (oItem.getKey() === "ALL") || oItem.getKey().startsWith(sMainIconTabBarSelectedKey);
				oItem.setVisible(bShowSubIconTabFilter);
			});

			// Toggle Sub IconTabBar visibility
			const bShowSubIconTabBar = this._oSubIconTabBar.getItems().some(oItem =>
				(oItem.getKey() !== "ALL") && oItem.getVisible() // Tab Bar gets visible if any Tab Filter (apart from ALL) is visible
			);
			this._oSubIconTabBar.setVisible(bShowSubIconTabBar);
		},

		_setSubIconTabBarItemSelected: function (oSubIconTabBarItemSelected) {
			// Set by default first element in Sub Tab Bar as selected
			const oSubIconTabBarItemToSelectByDefault = this._oSubIconTabBar.getItems()
				.filter(oItem => oItem.getVisible?.())[0];

			const oSubIconTabBarItemToSelect = oSubIconTabBarItemSelected ?? oSubIconTabBarItemToSelectByDefault;
			if (!oSubIconTabBarItemToSelect)
				return;

			const sSubIconTabBarItemToSelectKey = oSubIconTabBarItemToSelect.getKey();
			this._oSubIconTabBar.setSelectedKey(sSubIconTabBarItemToSelectKey);
			const oSelectEvent = new sap.ui.base.Event("select", this._oSubIconTabBar, { item: oSubIconTabBarItemToSelect });
			this.onSelectIconTabBar(oSelectEvent);
		},

		_updateFiltersOnTabSelected: function (oSubIconTabBarSelectedItem) {
			const sSubIconTabBarSelectedKey = oSubIconTabBarSelectedItem.getKey();
			this._oFilterBarView ??= this.byId("taskListPage").getContent()[0];
			if (!this._oFilterBarView && !this._oTaskDefinitionFilter)
				return console.error(".byId(\"taskListPage\") unreachable");

			this._oTaskDefinitionFilter ??= this._oFilterBarView?.byId?.("taskdefinitionFilter");
			if (!this._oTaskDefinitionFilter)
				return;
			this._oTaskDefinitionFilter.setSelectedItems([]); // reset selected items
			if (sSubIconTabBarSelectedKey.includes("__byTaskDefinition__"))
				this._updateTaskDefinitionFilterOnTaskDefinitionTabSelected(oSubIconTabBarSelectedItem);
			this._oTaskDefinitionFilter.fireSelectionFinish.call(this._oTaskDefinitionFilter);
		},

		_updateTaskDefinitionFilterOnTaskDefinitionTabSelected: function (oMainIconTabBarSelectedItem) {
			// update filter in FilterBar before fire SelectionFinish
			const sSelectedTaskDefinitionID = oMainIconTabBarSelectedItem.data("TaskDefinitionID");
			const aTaskDefinitionFilterItems = this._oTaskDefinitionFilter.getItems();
			const oSelectedTaskDefinitionFilterItem = aTaskDefinitionFilterItems.find(oItem => oItem.getKey().toUpperCase() === sSelectedTaskDefinitionID.toUpperCase());
			if (oSelectedTaskDefinitionFilterItem)
				this._oTaskDefinitionFilter.setSelectedItems([oSelectedTaskDefinitionFilterItem]);
		},

		_updateStatusFilterOnTaskDefinitionTabSelected: function (oMainIconTabBarSelectedItem) {
			// update filter in FilterBar before fire SelectionFinish
			const sSelectedStatus = oMainIconTabBarSelectedItem.data("Status");
			const aStatusFilterItems = this._oStatusFilter.getItems();
			const oSelectedStatusFilterItem = aStatusFilterItems.find(oItem => oItem.getKey() === sSelectedStatus.toUpperCase());
			this._oStatusFilter.setSelectedItems([oSelectedStatusFilterItem]);
		},

		_updatePriorityFilterOnTaskDefinitionTabSelected: function (oMainIconTabBarSelectedItem) {
			// update filter in FilterBar before fire SelectionFinish
			const sSelectedPriority = oMainIconTabBarSelectedItem.data("Priority");
			const aPriorityFilterItems = this._oPriorityFilter.getItems();
			const oSelectedPriorityFilterItem = aPriorityFilterItems.find(oItem => oItem.getKey() === sSelectedPriority.toUpperCase());
			this._oPriorityFilter.setSelectedItems([oSelectedPriorityFilterItem]);
		},

		onTaskSelected: function (oEvent) {
			const oBindingContext = oEvent.getSource().getBindingContext("taskList");
			const oParameters = {
				SAP__Origin: oBindingContext.getProperty("SAP__Origin"),
				InstanceID: oBindingContext.getProperty("InstanceID"),
				contextPath: "TaskCollection(SAP__Origin='" + oBindingContext.getProperty("SAP__Origin") + "',InstanceID='" + oBindingContext.getProperty("InstanceID") + "')"
			};
			this.selectedTaskPath = oBindingContext.getPath();

			try {
				// New PO display component registers a DirtyStateProvider method
				// this method throws an exception after 3 consecutive calls
				// so this workaround deregisters the failing method from listeners 
				if (sap.ushell.Container.getAsyncDirtyStateProviders().length > 1)
					sap.ushell.Container.deregisterDirtyStateProvider(sap.ushell.Container.getAsyncDirtyStateProviders()[1])
			} catch (error) { }

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

			const oColumns = this.getView().byId("taskListTable").getColumns();
			if (oColumns) {
				const UsdCurrencyAlign = oColumns.filter((field) => field.sId.includes("USD_CURRENCY"));
				if (UsdCurrencyAlign.length > 0) {
					UsdCurrencyAlign.forEach((column) => {
						column.setHAlign("Right");
					})
				}

				const priceAlign = oColumns.filter((field) => field.sId.includes("PRICE"));
				if (priceAlign.length > 0) {
					priceAlign.forEach((column) => {
						column.setHAlign("Right");
					})
				}

				const totalValueAlign = oColumns.filter((field) => field.sId.includes("MENDEL_EXPTOTAL"));
				if (totalValueAlign.length > 0) {
					totalValueAlign.forEach((column) => {
						column.setHAlign("Right");
					})
				}

			}
		},

		_refreshTask: function (channelId, eventId, data) {

			const oListModel = this.getOwnerComponent().getModel("LineItemModel");
			if (oListModel) {
				oListModel.setData({});
			}

			if (this.getOwnerComponent().oDataManager.isActionS3Custom) {
				this.getOwnerComponent().oDataManager.isActionS3Custom = false;
				this.onRefreshPressed();
				return;
			}
			var _handleTaskQueryResponse = function (oData, response) {
				if (response.statusCode === "200") {
					var tasks = [oData];
					if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
						tasks = this._dataMassage([oData]);
					}
					var jsonModel = this.getView().getModel("taskList");
					jsonModel.setProperty(this.selectedTaskPath, tasks[0]);
					this.selectedTaskPath = undefined;
					this.handleSelectionChange();
				}
			};
			var params;
			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
				params = {
					success: _handleTaskQueryResponse.bind(this),
					urlParameters: { $expand: "CustomAttributeData" }
				};
			}
			else {
				params = {
					success: _handleTaskQueryResponse.bind(this)
				};
			}
			this._oDataModel.read(data.contextPath, params);
		},

		handleActionPerformed: function (aSuccessList, aErrorList, aChangedItems) {
			if (aErrorList.length === 0) {
				// TODO show messages according to the type of the action ?
				// for now, showing a generic message.
				setTimeout(function () {
					MessageToast.show(this._oResourceBundle.getText(aSuccessList.length > 1 ? "dialog.success.multi_complete_plural" :
						"dialog.success.multi_complete", aSuccessList.length));
				}.bind(this), 500);

				this.updateTableOnActionComplete(aChangedItems);
				this.onRefreshPressed();
			}
			else {
				MultiSelectDialog.openMessageDialog(aSuccessList, aErrorList,
					this.updateTableOnActionComplete.bind(this, aChangedItems));
			}
		},


		createFooterButtonsForSelectedTasks: function (aDecisionsAvailable) {

			var iDisplayOrderPriorityTemp = 1;
			var iDisplayOrderPriorityValue = 0;

			// do not create decision buttons if any selected task is confirmable
			if (this.oSelectedTasksDetails.bContainsConfirmableItem && this.oSelectedTasksDetails.SupportsConfirm) {

				iDisplayOrderPriorityValue = iDisplayOrderPriorityTemp;
				iDisplayOrderPriorityTemp++;
				// create confirm button in case all selected tasks are confirmable
				var confirmButton = this.getPositiveButton(null);
				if (confirmButton) {
					confirmButton.iDisplayOrderPriority = iDisplayOrderPriorityValue;
				}
				this._oFullScreenPage.addCustomFooterContent(confirmButton);
			}

			else if (!this.oSelectedTasksDetails.bContainsConfirmableItem) {

				// create decision buttons
				for (var i = 0; i < aDecisionsAvailable.length; i++) {
					var oDecision = aDecisionsAvailable[i];
					var button = new Button({
						text: oDecision.DecisionText,
						press: this.showDecisionDialog.bind(this, oDecision)
					});
					if (!oDecision.Nature) {
						iDisplayOrderPriorityValue = 400 + iDisplayOrderPriorityTemp;
						iDisplayOrderPriorityTemp++;
					}
					else if (oDecision.Nature.toUpperCase() === "POSITIVE") {
						iDisplayOrderPriorityValue = iDisplayOrderPriorityTemp;
						iDisplayOrderPriorityTemp++;
						button.setType(ButtonType.Accept);
					}
					else if (oDecision.Nature.toUpperCase() === "NEGATIVE") {
						iDisplayOrderPriorityValue = 200 + iDisplayOrderPriorityTemp;
						iDisplayOrderPriorityTemp++;
						button.setType(ButtonType.Reject);
					}
					else {
						iDisplayOrderPriorityValue = 400 + iDisplayOrderPriorityTemp;
						iDisplayOrderPriorityTemp++;
					}
					button.iDisplayOrderPriority = iDisplayOrderPriorityValue;


					this._oFullScreenPage.addCustomFooterContent(button);
				}
			}

			// create standard buttons

			// claim button
			/*
			if (this.oSelectedTasksDetails.SupportsClaim) {
				iDisplayOrderPriorityValue = 1500 + iDisplayOrderPriorityTemp;
				iDisplayOrderPriorityTemp++;
				var claimButton = this.getClaimButton();
				if (claimButton) {
					claimButton.iDisplayOrderPriority = iDisplayOrderPriorityValue;
				}
				this._oFullScreenPage.addCustomFooterContent(claimButton);
			}
			*/

			// Release button
			if (this.oSelectedTasksDetails.SupportsRelease) {
				iDisplayOrderPriorityValue = 1500 + iDisplayOrderPriorityTemp;
				iDisplayOrderPriorityTemp++;
				var releaseButton = this.getReleaseButton();
				if (releaseButton) {
					releaseButton.iDisplayOrderPriority = iDisplayOrderPriorityValue;
				}
				this._oFullScreenPage.addCustomFooterContent(releaseButton);
			}

			// Forward button
			/*
			if (this.oSelectedTasksDetails.aSelectedTaskTypes.length === 1 && this.oSelectedTasksDetails.SupportsForward) {
				iDisplayOrderPriorityValue = 1500 + iDisplayOrderPriorityTemp;
				iDisplayOrderPriorityTemp++;
				var forwardButton = this.getForwardButton();
				if (forwardButton) {
					forwardButton.iDisplayOrderPriority = iDisplayOrderPriorityValue;
				}
				this._oFullScreenPage.addCustomFooterContent(forwardButton);
			}
			*/

			// Resubmit button
			/*
			if (this.oSelectedTasksDetails.SupportsResubmit) {
				iDisplayOrderPriorityValue = 1500 + iDisplayOrderPriorityTemp;
				iDisplayOrderPriorityTemp++;
				var resubmitButton = this.getResubmitButton();
				if (resubmitButton) {
					resubmitButton.iDisplayOrderPriority = iDisplayOrderPriorityValue;
				}
				this._oFullScreenPage.addCustomFooterContent(resubmitButton);
			}
			*/

			var oButtonList = {};
			oButtonList.aFooterButtons = this._oFullScreenPage.getCustomFooterContent();
			oButtonList.oPositiveAction = this._oFullScreenPage.getPositiveAction();
			oButtonList.oNegativeAction = this._oFullScreenPage.getNegativeAction();
			/**
			 * @ControllerHook Modify the footer buttons in table view
			 * This hook method can be used to add and change buttons for the table view footer
			 * It is called when the task is selected in the table view
			 * @callback cross.fnd.fiori.inbox.view.S2~extHookChangeFooterButtonsForExpertMode
			 * @param {object} oButtonList - contains the positive, negative buttons and the additional button list.
			 * @return {void}
			 */
			if (this.extHookChangeFooterButtonsForExpertMode) {
				this.extHookChangeFooterButtonsForExpertMode(oButtonList);

				this._oFullScreenPage.removeAllCustomFooterContent();

				if (oButtonList) {
					if (oButtonList.oPositiveAction) {
						if (!oButtonList.oPositiveAction.iDisplayOrderPriority) {
							iDisplayOrderPriorityValue = iDisplayOrderPriorityTemp;
							iDisplayOrderPriorityTemp++;
							oButtonList.oPositiveAction.iDisplayOrderPriority = iDisplayOrderPriorityValue;
						}
						this._oFullScreenPage.addCustomFooterContent(oButtonList.oPositiveAction);
					}
					if (oButtonList.oNegativeAction) {
						if (!oButtonList.oNegativeAction.iDisplayOrderPriority) {
							iDisplayOrderPriorityValue = iDisplayOrderPriorityTemp;
							iDisplayOrderPriorityTemp++;
							oButtonList.oNegativeAction.iDisplayOrderPriority = iDisplayOrderPriorityValue;
						}
						this._oFullScreenPage.addCustomFooterContent(oButtonList.oNegativeAction);
					}
					if (oButtonList.aFooterButtons) {
						var iButtonsLength = oButtonList.aFooterButtons.length;
						for (var j = 0; j < iButtonsLength; j++) {
							this._oFullScreenPage.addCustomFooterContent(oButtonList.aFooterButtons[j]);
						}
					}
				}
			}
			if (this._oFullScreenPage.getCustomFooterContent()) {
				this._oFullScreenPage.getCustomFooterContent().sort(CommonFunctions.compareButtons);
				var tempFooter = this._oFullScreenPage.getCustomFooterContent();
				this._oFullScreenPage.removeAllCustomFooterContent();
				if (tempFooter.length <= 0) {
					MessageBox.warning(this._oResourceBundle.getText("NO_COMMON_ACTIONS"));
					this._oFullScreenPage.setShowFooter(false);
				}
				for (var k = 0; k < tempFooter.length; k++) {
					this._oFullScreenPage.addCustomFooterContent(tempFooter[k]);
				}
			}
		},

		getProviderSystemOld: function () {
			const ProviderSystem = new JSONModel();
			let sRootPath = jQuery.sap.getModulePath("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2");
			let JSONProviderSystem = "/model/ProviderSystem.JSON";
			ProviderSystem.loadData(sRootPath + JSONProviderSystem, "", false);
			return ProviderSystem.getData().System;
		},

		getProviderSystem: function () {
			return new Promise(function (resolve, reject) {
				let oModel = this.getOwnerComponent().getModel();

				if (this.getOwnerComponent().getModel("ProviderSystem"))
					return resolve(this.getOwnerComponent().getModel("ProviderSystem").getData());

				const oProviderSystemModel = new JSONModel({});
				this.getOwnerComponent().setModel(oProviderSystemModel, "ProviderSystem");

				oModel.read("/SystemInfoCollection", {
					success: function (oData) {
						if (oData.results.length > 0) {
							oProviderSystemModel.setData(oData.results);
						}
						resolve(oProviderSystemModel.getData());
					}.bind(this),
					error: function (err) {
						try {
							let messageError = JSON.parse(err.responseText);
							MessageToast.show(messageError.error.message.value);
						} catch (error) {
							MessageToast.show(this.i18nBundle.getText("custom.meli.msj.SystemInfoCollection"));
						}
						resolve(oProviderSystemModel.getData());
					}.bind(this)
				})
			}.bind(this));
		},
	});
});