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

	sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.view.S2_TaskListCustom", {

		_initTaskModel: function () {
			var fOnSuccess = function (oData, oResponse) {
				if (oResponse.statusCode === "200") {
					var aTasks = oData.results;

					if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
						aTasks = this._dataMassage(oData.results);
					}

					console.log("S2_TaskListCustom _initTaskModel H", aTasks);
					var oTaskListModel = new JSONModel({ TaskCollection: aTasks });
					this.getView().setModel(oTaskListModel, "taskList");
					this._loadCustomAttributesDeferredForTasks.resolve();
					if (this._filterDeferred) {
						this._filterDeferred.resolve();
					}
					//############ Custom Gabriel Inicio #######
					//Custom Gabriel
					let iTotal = 0;
					let iDue = 0;
					let oStatus = {};
					let oPriorities = {};
					let oSources = {
						"LOCAL_TGW": {
							count: 0,
							get countColor() { return this.count == 0 ? "Standard" : 'Critical' },
							tasks: {}
						},
						"ARIBA_TGW": {
							count: 7,
							get countColor() { return this.count == 0 ? "Standard" : 'Critical' },
							tasks: {}
						},
						"CONCUR_TGW": {
							count: 2,
							get countColor() { return this.count == 0 ? "Standard" : 'Critical' },
							tasks: {}
						}
					};

					aTasks.forEach(oTask => {
						const sTaskSource = oTask.SAP__Origin;
						const sTaskStatus = oTask.Status;
						const sTaskPriority = oTask.Priority;
						const oSource = oSources[sTaskSource];

						oSource.count++;
						oSource.tasks[oTask.TaskDefinitionName] ||= 0;
						oSource.tasks[oTask.TaskDefinitionName]++;


						oStatus[sTaskStatus] ||= 0;
						oStatus[sTaskStatus]++;


						oPriorities[sTaskPriority] ||= 0;
						oPriorities[sTaskPriority]++;

						oTask.CompletionDeadLine && iDue++;
						iTotal++;
					});

					this.getView().getModel("taskListView").setProperty("/allTaskCount", iTotal);
					this.getView().getModel("taskListView").setProperty("/DueCount", iDue);

					for (var key in oSources) {
						console.log("minhas tasks", key, oSources[key])
						var propTab = "/" + key + "Count"
						this.getView().getModel("taskListView").setProperty(propTab, oSources[key].count);

						if (oSources[key].tasks) {
							var tabFilterSource = this.byId("tabFilter" + key + "Id");
							tabFilterSource.removeAllItems();
							for (var key2 in oSources[key].tasks) {
								tabFilterSource.addItem(new sap.m.IconTabFilter({
									key: "TaskDefinitionName>>" + key2,
									text: key2,
									count: oSources[key].tasks[key2]
								}));
							};
						}
					};

					var tabFilterStatus = this.byId("tabFilterStatusId");
					tabFilterStatus.removeAllItems();
					for (var key in oStatus) {
						tabFilterStatus.addItem(new sap.m.IconTabFilter({
							key: "Status>>" + key,
							text: key,
							count: oStatus[key]
						}));
					};

					var tabFilterPriority = this.byId("tabFilterPriorityId");
					tabFilterPriority.removeAllItems();
					for (var key in oPriorities) {
						tabFilterPriority.addItem(new sap.m.IconTabFilter({
							key: "Priority>>" + key,
							text: key,
							count: oPriorities[key]
						}));
					};

					var iconTabBar = this.byId("idIconTabBar");
					var that = this;
					iconTabBar.attachSelect(function (oEvent) {
						var oBinding = that.byId("taskListTable").getBinding("items");
						console.log()
						var aFilters = [];
						var sKey = oEvent.getParameter("key");
						console.log("onFilterSelect", sKey);

						if (sKey === "DUE") {
							aFilters.push(
								new sap.ui.model.Filter("CompletionDeadLine", "NE", undefined)
							);
						} else if (sKey !== "ALL" && sKey !== "STATUS" && sKey !== "PRIORITY") {
							const filter = sKey.split(">>", 2);
							console.log("onFilterSelect split", filter[0], filter[1]);
							aFilters.push(
								new sap.ui.model.Filter(filter[0], "EQ", filter[1])
							);
						}
						oBinding.filter(aFilters);
						that.byId("taskListTable").getColumns()[8].setVisible(true);
						that.byId("taskListTable").getColumns()[9].setVisible(true);
					});
					//############ Custom Gabriel Fim ##########

				} else {
					MessageToast.show(oResponse.statusText + ":" + oResponse.body);
				}
			};
			var aFilters = [this._getinitialStatusFilters()];
			var oTaskDefinitionFilter = this._getTaskDefinitionFilters();

			if (oTaskDefinitionFilter) {
				aFilters.push(oTaskDefinitionFilter);
			}
			var oRequestConfiguration;
			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
				oRequestConfiguration = {
					filters: [new Filter({
						filters: aFilters,
						and: true
					})],
					sorters: [this._getCurrentSorter()],
					success: fOnSuccess.bind(this),
					urlParameters: {
						$top: this.oDataManager.getListSize(),
						$select: this._getTaskPropertiesToFetch().join(","),
						$expand: "CustomAttributeData"
					}
				};
			} else {
				oRequestConfiguration = {
					filters: [new Filter({
						filters: aFilters,
						and: true
					})],
					sorters: [this._getCurrentSorter()],
					success: fOnSuccess.bind(this),
					urlParameters: {
						$top: this.oDataManager.getListSize(),
						$select: this._getTaskPropertiesToFetch().join(",")
					}
				};
			}
			this._oDataModel.read("/TaskCollection", oRequestConfiguration);
		},

		_dataMassage: function (aTasks) {
			return aTasks.map(oTask => {
				const oCustomAttrData = oTask.CustomAttributeData;
				const aCustomAttrs = oCustomAttrData?.results;

				if (aCustomAttrs && aCustomAttrs.length)
					aCustomAttrs.forEach(oCustomAttr => {
						oTask[encodeURIComponent(oCustomAttr.Name)] = oCustomAttr.Value;
					});

				return oTask;
			});
		},

		onTaskSelected: function (oEvent) {
			var oNav = {
				SAP__Origin: oEvent.getSource().getBindingContext("taskList").getProperty("SAP__Origin"),
				InstanceID: oEvent.getSource().getBindingContext("taskList").getProperty("InstanceID"),
				contextPath: "TaskCollection(SAP__Origin='" + oEvent.getSource().getBindingContext("taskList").getProperty("SAP__Origin") + "',InstanceID='" + oEvent.getSource().getBindingContext("taskList").getProperty("InstanceID") + "')"
			};
			this.selectedTaskPath = oEvent.getSource().getBindingContext("taskList").getPath();
			this.oRouter.navTo("detail_deep", oNav, false);
			return;
		},

		onUpdateFinished: function (oEvent) {
			const oTaskListViewModel = this.getView().getModel("taskListView");

			this.mainViewModel.setProperty("/busy", false);
			if (Device.system.phone) {
				return;
			}
			var iTotal = oEvent.getParameter("total");
			console.log("## S2_TaskListCustom onUpdateFinished - iItemCount", iTotal);
			console.log("## S2_TaskListCustom onUpdateFinished - getParameters", oEvent.getParameters());

			oTaskListViewModel.setProperty("/taskListCount", iTotal);

			oTaskListViewModel.setProperty("/taskListTitle", iTotal ?
				this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME_COUNT", [iTotal]) :
				this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME"));

			oTaskListViewModel.setProperty("/noDataText", this._oResourceBundle.getText("view.Workflow.noDataTasks"));
		}
	});
});