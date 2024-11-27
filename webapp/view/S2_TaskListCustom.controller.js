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
	const C_FIRST_APROV_NAME = "CUS_FIRST_APROV_NAME";
	const C_FIRST_APROV_NAME_VALUE = "Buyer Procurement Desk Agent";

	sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.view.S2_TaskListCustom", {

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

			const [ProviderSystemData, _dummy] = await Promise.all([
				this.getProviderSystem(),
				this.fnAddAditionalSelectPropertiesAndInitBinding()
			]);

			// set up Request configuration

			const aFilters = [this._getinitialStatusFilters()];
			const oTaskDefinitionFilter = this._getTaskDefinitionFilters();

			if (oTaskDefinitionFilter)
				aFilters.push(oTaskDefinitionFilter);

			let oCurrentSorter = this._getCurrentSorter();
			let oSelect = this._getTaskPropertiesToFetch().join(",");

			ProviderSystemData.forEach((ProviderSystem) => {
				let sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
				let ServiceUrlProv = sServiceUrl + ';o=' + ProviderSystem.SAP__Origin;

				const oSAPOriginFilter = this._getSAPOriginFilters(ProviderSystem.SAP__Origin);

				const oFilter = new Filter({
					filters: [...aFilters, oSAPOriginFilter],
					and: true
				});

				let oModel = new sap.ui.model.odata.v2.ODataModel(ServiceUrlProv, {
					useBatch: false
				});

				const oRequestConfiguration = {
					filters: [oFilter],
					sorters: ProviderSystem.SAP__Origin === C_ARIBA ? [] : [oCurrentSorter],
					success: this.onSuccessTaskCollectionRequest.bind(this),
					urlParameters: {
						$select: oSelect
					}
				};

				if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
					oRequestConfiguration.urlParameters.$expand = "CustomAttributeData";

				oModel.read("/TaskCollection/$count", {
					filters: [oFilter],
					success: this._retrieveTasksByChunks.bind(this, oRequestConfiguration, oModel, ProviderSystem.SAP__Origin),
					error: function (oError) {
						return MessageToast.show(ProviderSystem.SAP__Origin + ": " + oError.message + " " + oError.responseText);
					},
				});
			});

		},

		_getSAPOriginFilters: function (sSAPOrigin) {
			return new Filter("SAP__Origin", FilterOperator.EQ, sSAPOrigin);
		},

		_retrieveTasksByChunks: function (oRequestConfiguration, pDataModel, ProviderSystem, iTaskCount) {

			let _aODataModelReadPromises = [];

			console.log(">>> LOADING " + iTaskCount + " TASKS <<<");
			this._iTaskCount = iTaskCount;

			let iSkip = 0;
			const iTargetChunkSize = Math.min(200, this.oDataManager.getListSize());
			const iChunkSize = ProviderSystem === C_ARIBA
				? 10
				: Math.ceil(iTaskCount / Math.max(Math.round(iTaskCount / iTargetChunkSize), 1));

			// show progress bar if taskCount exceeds request pagination
			if (iTaskCount > iChunkSize)
				setTimeout(this._displayProgressIndicator.bind(this), 500);

			// fire chunks reads
			do {
				if (iTaskCount <= 0)
					break;

				iTaskCount -= iChunkSize;
				const pDataModelRead = new Promise(function (resolve, reject) {
					const sGroupId = Math.random().toString(36).slice(2, 8); // e.g.: 's5gzlj'
					pDataModel.read("/TaskCollection", {
						...oRequestConfiguration,
						success: function (oData, oResponse) { return resolve([oData, oResponse]) },
						error: function (oError) {
							return reject(oError)
						},
						groupId: sGroupId,
						urlParameters: {
							...oRequestConfiguration.urlParameters,
							$top: iChunkSize,
							$skip: iSkip
						}
					});
					pDataModel.submitChanges({
						groupId: sGroupId
					});
				}.bind(this));

				// call partial OData read handler
				pDataModelRead.then(this.onSuccessTaskCollectionRequest.bind(this), function (oError) {
					return MessageToast.show(ProviderSystem + ": " + oError.message + " " + oError.responseText);
				});
				// collect Promises
				_aODataModelReadPromises.push(pDataModelRead);

				iSkip += iChunkSize;
			} while (iTaskCount > 0);

			// set final OData read handler
			Promise.all(_aODataModelReadPromises)
				.then(this.onSuccessTaskCollectionRequestComplete.bind(this));
		},

		onSuccessTaskCollectionRequest: function ([oData, oResponse]) {
			var validFirstAprovName;
			if (oResponse.statusCode != 200)
				return MessageToast.show(oResponse.statusText + ":" + oResponse.body);

			console.log(`>>> GOT ${oData.results.length} TASKS. <<<`);
			let aTasks = oData.results;

			if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData"))
				aTasks = this._dataMassage(oData.results);

			// To remove PR above with firstAprovalName 'Buyer Procurement Desk Agent'
			aTasks = aTasks.filter(oTask => oTask.SAP__Origin === C_ARIBA
				? this._validFirtsApproverName(oTask)
				: true
			);

			// Add tasks to taskList model
			let aTaskListModel = this.getView().getModel("taskList");

			aTaskListModel.setProperty("/TaskCollection", [
				...aTaskListModel.getProperty("/TaskCollectionAll"),
				...aTasks
			]);

			//Esto es una copia exacta para que no afecte cuando se seleccione algún Icon Tab que se modifica el TaskCollection
			aTaskListModel.setProperty("/TaskCollectionAll", [
				...aTaskListModel.getProperty("/TaskCollectionAll"),
				...aTasks
			]);

			aTasks = aTaskListModel.getProperty("/TaskCollection");
			setTimeout(function () {
				const nCurrentLoadingProgress = (aTasks.length / this._iTaskCount) * 100;
				const nLastLoadingProgress = this._oProgressIndicator.getPercentValue();
				const sLastDisplayValue = this._oProgressIndicator.getDisplayValue();
				this._oProgressIndicator.setPercentValue(nCurrentLoadingProgress > nLastLoadingProgress
					? nCurrentLoadingProgress
					: nLastLoadingProgress);
				this._oProgressIndicator.setDisplayValue(nCurrentLoadingProgress > nLastLoadingProgress
					? `${aTasks.length}/${this._iTaskCount}`
					: sLastDisplayValue);
			}.bind(this), 0);
		},

		onSuccessTaskCollectionRequestComplete: function (oData, oResponse) {
			console.log(`>>> ALL TASKS RETRIEVED. <<<`);
			this._loadCustomAttributesDeferredForTasks?.resolve();
			this._filterDeferred?.resolve();

			const aTasks = this.getView().getModel("taskList").getProperty("/TaskCollection");

			const oTaskListData = this._processTaskListData(aTasks);
			this._initTabBars();
			this._createTabFilters(oTaskListData);

			this._enableTableSetBusy();
			this._oTable.setBusy(false);

			// Set by default selected key
			const oMainIconTabBarByDefaultSelectedItem = this._oMainIconTabBar.getItems()
				.filter(oItem => oItem.getVisible?.())[0];
			const sMainIconTabBarByDefaultSelectedKey = oMainIconTabBarByDefaultSelectedItem?.getKey();
			this._oMainIconTabBar.setSelectedKey(sMainIconTabBarByDefaultSelectedKey);
			const oSelectEvent = new sap.ui.base.Event("select", this._oMainIconTabBar, { item: oMainIconTabBarByDefaultSelectedItem });
			setTimeout(() => this.onSelectIconTabBar(oSelectEvent), 0);

			setTimeout(this._hideProgressIndicator.bind(this), 1000);
		},

		_displayProgressIndicator: function () {
			this._oProgressIndicator.setPercentValue(0);
			this._oProgressIndicator.setDisplayValue("");
			this._oProgressIndicator.setVisible(true);
		},

		_hideProgressIndicator: function () {
			this._oProgressIndicator.setVisible(false);
			this._oProgressIndicator.setPercentValue(0);
			this._oProgressIndicator.setDisplayValue("");
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

		_validFirtsApproverName: function (oTask) {
			var bIsValid = true;
			var aTask = oTask.CustomAttributeData.results.filter((task) => task.Name === C_FIRST_APROV_NAME);
			if (aTask && aTask[0] && aTask[0].Value === C_FIRST_APROV_NAME_VALUE)
				bIsValid = false;
			return bIsValid;
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

			const oSelectedItem = oEvent.getParameter("item");
			if (!oSelectedItem)
				return;
			const oTaskGroup = this._oGroupsMap.get(oSelectedItem);

			// update Sub IconTabBar items visibility according to Main IconTabBar selected item
			if (this._bUseSubIconTabBar && (oEvent.getSource() === this._oMainIconTabBar))
				this._updateSubIconTabBarItemsVisibility(oSelectedItem);

			// update Task list items bound property
			this.getView().getModel("taskList").setProperty("/TaskCollection", oTaskGroup.tasks);

			// update filter for TaskDefinition
			this._updateFiltersOnTabSelected(oSelectedItem);
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

			// Set by default selected key
			const sSubIconTabBarByDefaultSelectedKey = this._oSubIconTabBar.getItems()[0].getKey();
			this._oSubIconTabBar.setSelectedKey(sSubIconTabBarByDefaultSelectedKey);
		},

		_updateFiltersOnTabSelected: function (oMainIconTabBarSelectedItem) {
			const sMainIconTabBarSelectedKey = oMainIconTabBarSelectedItem.getKey();
			this._oFilterBarView ??= this.byId("taskListPage").getContent()[0];

			this._oTaskDefinitionFilter ??= this._oFilterBarView?.byId("taskdefinitionFilter");
			this._oTaskDefinitionFilter.setSelectedItems([]); // reset selected items
			if (sMainIconTabBarSelectedKey.includes("__byTaskDefinition__"))
				this._updateTaskDefinitionFilterOnTaskDefinitionTabSelected(oMainIconTabBarSelectedItem);
			this._oTaskDefinitionFilter.fireSelectionFinish.call(this._oTaskDefinitionFilter);

			// if (this._oTablePersoController._oPersonalizations !== null) {
			// 	let ColumItemsPosition = this._oTablePersoController._oPersonalizations.aColumns.find(({ id }) => id === "table-taskListTable-TS20000166ITEMOVERVIEWColumn");
			// 	if (ColumItemsPosition) {
			// 		ColumItemsPosition.visible = false;
			// 		this._oTablePersoController.getPersoService().setPersData(this._oTablePersoController._oPersonalizations)
			// 	}
			// }

		},

		_updateTaskDefinitionFilterOnTaskDefinitionTabSelected: function (oMainIconTabBarSelectedItem) {
			// update filter in FilterBar before fire SelectionFinish
			const sSelectedTaskDefinitionID = oMainIconTabBarSelectedItem.data("TaskDefinitionID");
			const aTaskDefinitionFilterItems = this._oTaskDefinitionFilter.getItems();
			const oSelectedTaskDefinitionFilterItem = aTaskDefinitionFilterItems.find(oItem => oItem.getKey() === sSelectedTaskDefinitionID.toUpperCase());
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
						if (this.isJsonString(err.responseText)) {
							let messageError = JSONModel.parse(err.responseText);
							MessageToast.show(messageError.error.message.value);
						} else {
							MessageToast.show(this.i18nBundle.getText("custom.meli.msj.SystemInfoCollection"));
						}
						resolve(oProviderSystemModel.getData());
					}.bind(this)
				})
			}.bind(this));
		},
	});
});