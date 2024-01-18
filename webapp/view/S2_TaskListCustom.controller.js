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

		_initTaskModel: function () {

			this._bUseSubIconTabBar ??= true;
			this._oGroupsMap ??= new Map();
			this._oDataModelReadPromises = [];

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

			const iListSize = this.oDataManager.getListSize();
			const oRequestConfiguration = {
				filters: [new Filter({
					filters: aFilters,
					and: true
				})],
				sorters: [this._getCurrentSorter()],
				success: this.onSuccessTaskCollectionRequest.bind(this),
				urlParameters: {
					$top: iListSize,
					$select: this._getTaskPropertiesToFetch().join(",")
				}
			};

			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
				oRequestConfiguration.urlParameters.$expand = "CustomAttributeData";

			// Init taskList model
			const aTaskListModel = new JSONModel({ TaskCollection: [] });
			this.getView().setModel(aTaskListModel, "taskList");

			// Get Task count
			this._oDataModel.setUseBatch(false);
			this._oDataModel.read("/TaskCollection/$count", {
				filters: [new Filter({
					filters: aFilters,
					and: true
				})],
				async: false,
				success: function (iTaskCount) {
					var iSkip = 0;
					this._iTaskCount = iTaskCount;
					console.log(">>> LOADING " + iTaskCount + " TASKS <<<");
					do {
						iTaskCount -= iListSize;
						const pDataModelRead = new Promise(function (resolve, reject) {
							this._oDataModel.read("/TaskCollection", {
								...oRequestConfiguration,
								success: function (oData, oResponse) { return resolve([oData, oResponse]) },
								error: function (oError) { return reject(oError) },
								groupId: Date.now().toString(),
								urlParameters: {
									...oRequestConfiguration.urlParameters,
									$top: iListSize,
									$skip: iSkip
								}
							});
						}.bind(this));

						// call partial OData read handler
						pDataModelRead.then(this.onSuccessTaskCollectionRequest.bind(this));
						// collect Promises
						this._oDataModelReadPromises.push(pDataModelRead);

						iSkip += iListSize;
					} while (iTaskCount > 0);

					// set final OData read handler
					Promise.all(this._oDataModelReadPromises)
						.then(this.onSuccessTaskCollectionRequestComplete.bind(this));
				}.bind(this)
			});
		},

		onSuccessTaskCollectionRequest: function ([oData, oResponse]) {
			if (oResponse.statusCode != 200)
				return MessageToast.show(oResponse.statusText + ":" + oResponse.body);

			console.log(`>>> GOT ${oData.results.length} TASKS. <<<`);
			var aTasks = oData.results;

			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
				aTasks = this._dataMassage(oData.results);

			// Add tasks to taskList model
			var aTaskListModel = this.getView().getModel("taskList");
			aTaskListModel.setProperty("/TaskCollection", [
				...aTaskListModel.getProperty("/TaskCollection"),
				...aTasks
			]);
		},

		onSuccessTaskCollectionRequestComplete: function (oData, oResponse) {
			console.log(`>>> ALL TASKS RETRIEVED. <<<`);
			this._oDataModel.setUseBatch(true);
			this._loadCustomAttributesDeferredForTasks?.resolve();
			this._filterDeferred?.resolve();

			const aTasks = this.getView().getModel("taskList").getProperty("/TaskCollection");
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