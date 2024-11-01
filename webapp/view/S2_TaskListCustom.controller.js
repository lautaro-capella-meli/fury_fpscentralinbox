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



		_initTaskModel: function () {
			let vGetData = true;

			// Get Task count
			this._oTable.setBusy(true);
			this._disableTableSetBusy();

			this._bUseSubIconTabBar ??= true;
			this._oGroupsMap ??= new Map();

			this._oProgressIndicator ??= this.byId("idLoadingProgressIndicator");
			this._oMainIconTabBar ??= this.byId("idMainIconTabBar")
				.attachSelect(this.onSelectMainIconTabBar.bind(this));
			this._oSubIconTabBar ??= this.byId("idSubIconTabBar")
				.attachSelect(this.onSelectMainIconTabBar.bind(this));

			// Init taskList model
			const aTaskListModel = new JSONModel({
				TaskCollection: [],
				TaskCollectionAll: []
			});
			this.getView().setModel(aTaskListModel, "taskList");

			this.getProviderSystem(function (ProviderSystemModel) {
				// set up Request configuration
				this.fnAddAditionalSelectPropertiesAndInitBinding()
					.then(function () {
						const aFilters = [this._getinitialStatusFilters()];
						const oTaskDefinitionFilter = this._getTaskDefinitionFilters();

						if (oTaskDefinitionFilter)
							aFilters.push(oTaskDefinitionFilter);

						let oCurrentSorter = this._getCurrentSorter();
						let oSelect = this._getTaskPropertiesToFetch().join(",");

						if (vGetData) {
							vGetData = false;
							ProviderSystemModel.forEach((ProviderSystem) => {
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
						}


					}.bind(this));
			}.bind(this));
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
			const iChunkSize = ProviderSystem === C_ARIBA ? 10 : Math.ceil(iTaskCount / Math.max(Math.round(iTaskCount / iTargetChunkSize), 1));

			// show progress bar if taskCount exceeds request pagination
			this._oProgressIndicator.setVisible(iTaskCount > iChunkSize);

			// fire chunks reads
			do {
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

				if (_aODataModelReadPromises.length === 5) {
					Promise.all(_aODataModelReadPromises)
						.then(this.onSuccessTaskCollectionRequestComplete.bind(this));
					_aODataModelReadPromises = [];
				}

				iSkip += iChunkSize;
			} while (iTaskCount > 0);

			// set final OData read handler
			if (_aODataModelReadPromises.length > 0) {
				Promise.all(_aODataModelReadPromises)
					.then(this.onSuccessTaskCollectionRequestComplete.bind(this));
			}
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
				for (let i = aTasks.length - 1; i >= 0; i--) {
					
					if(aTasks[i].SAP__Origin === C_ARIBA){
						validFirstAprovName = this._validFirtsApproverName(aTasks[i]);

						if(validFirstAprovName){
							aTasks.splice(i,1);
						}
					}
					
				}

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
				const nLoadingProgress = (aTasks.length / this._iTaskCount) * 100;
				this._oProgressIndicator.setDisplayValue(`${aTasks.length}/${this._iTaskCount}`);
				this._oProgressIndicator.setPercentValue(nLoadingProgress);
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
			setTimeout(function () {
				this._oProgressIndicator.setVisible(false);
			}.bind(this), 500);
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

				/* //Definieron que no querían estos Iconos 25/04/2024
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
				*/

				return oTaskListData;
			}, {
				allTasks: newTaskGroup(),
				bySource: {}
				//byStatus: {},
				//byPriority: {},
				//withCompletionDeadLine: newTaskGroup()
			});

			// Fill All Tasks group
			oTaskListData.allTasks.count = aTasks.length;
			oTaskListData.allTasks.tasks = [...aTasks];

			return oTaskListData;
		},

		_validFirtsApproverName: function(oTask){
			var oValid = false;
			var aTask = oTask.CustomAttributeData.results.filter((task) => task.Name === C_FIRST_APROV_NAME);
			if(aTask[0].Value === C_FIRST_APROV_NAME_VALUE) {
				oValid = true;
			}
			return oValid;
		},

		_createTabFilters: function (oTaskListData) {

			// Se define que no quieren ICON TAB de totales (ALL)
			/// MAIN > ALL TASKS ///
			// const oAllTasksIconTabFilter = new sap.m.IconTabFilter({
			// 	key: "ALL",
			// 	text: this._getI18nCustomText("All"),
			// 	showAll: true,
			// 	count: oTaskListData.allTasks.count
			// });
			// this._oMainIconTabBar.addItem(oAllTasksIconTabFilter);
			// this._oGroupsMap.set(oAllTasksIconTabFilter, oTaskListData.allTasks);

			// /// SUB > ALL TASKS ///
			// const oAllSubIconTabFilter = new sap.m.IconTabFilter({
			// 	key: "ALL",
			// 	text: this._getI18nCustomText("All")
			// });
			// this._oSubIconTabBar.addItem(oAllSubIconTabFilter);
			// this._oGroupsMap.set(oAllSubIconTabFilter, oTaskListData.allTasks);

			// var oNewTaskListData = this._oCreateNewTaskListData(oTaskListData);

			if (Object.keys(oTaskListData.bySource).length) {
				/// MAIN > |SEPARATOR| ///
				// this._oMainIconTabBar.addItem(new sap.m.IconTabSeparator);

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
				this.getView().getModel("taskList").setProperty("/TaskCollection", {});
				this.getView().getModel("taskList").setProperty("/TaskCollection", Array.from(this._oGroupsMap)[0][1].tasks);
			}
			this.getView().getModel("taskList").setProperty("/TaskCollection", Array.from(this._oGroupsMap)[0][1].tasks);

			/* //Definieron que no querían estos Iconos 25/04/2024
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
					count: oTaskGroupByStatus.count,
					customData: [new sap.ui.core.CustomData({
						key: "Status",
						value: sStatus
					})]
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
					count: oTaskGroupByPriority.count,
					customData: [new sap.ui.core.CustomData({
						key: "Priority",
						value: sPriority
					})]
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
			*/
		},

		_oCreateNewTaskListData: function(oTasklistData) {
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

			if(Object.keys(oTasklistData.bySource).length > 0){

				for (const [oSourceKey, oSourceData] of Object.entries(oTasklistData.bySource)) {
					if(oSourceKey === C_MENDEL || oSourceKey === C_CONCUR) {
						oCombinedTaskConcurMendelData.count += oSourceData.count;
						oCombinedTaskConcurMendelData.tasks = oCombinedTaskConcurMendelData.tasks.concat(oSourceData.tasks);

						for (const [oDefKey, oDefData] of Object.entries(oSourceData.byTaskDefinition)) {
							if(!oCombinedTaskConcurMendelData.byTaskDefinition[oDefKey]){
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

				if(oCombinedTaskConcurMendelData.count > 0) {
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

		onSelectMainIconTabBar: function (oEvent) {

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
			this._oSubIconTabBar.setSelectedKey("ALL");

		},

		_updateFiltersOnTabSelected: function (oMainIconTabBarSelectedItem) {
			const sMainIconTabBarSelectedKey = oMainIconTabBarSelectedItem.getKey();
			this._oFilterBarView ??= this.byId("taskListPage").getContent()[0];

			/* //Definieron que no querían estos Iconos 25/04/2024
			this._oStatusFilter ??= this._oFilterBarView?.byId("statusFilter");
			this._oStatusFilter.setSelectedItems([]); // reset selected items
			if (sMainIconTabBarSelectedKey.includes("byStatus__"))
				this._updateStatusFilterOnTaskDefinitionTabSelected(oMainIconTabBarSelectedItem);
			// this._oStatusFilter.fireSelectionFinish.call(this._oStatusFilter); // avoid multiple calls as it will be called at this._oTaskDefinitionFilter.fireSelectionFinish.call(this._oTaskDefinitionFilter)

			this._oPriorityFilter ??= this._oFilterBarView?.byId("priorityFilter");
			this._oPriorityFilter.setSelectedItems([]); // reset selected items
			if (sMainIconTabBarSelectedKey.includes("byPriority__"))
				this._updatePriorityFilterOnTaskDefinitionTabSelected(oMainIconTabBarSelectedItem);
			// this._oPriorityFilter.fireSelectionFinish.call(this._oPriorityFilter); // avoid multiple calls as it will be called at this._oTaskDefinitionFilter.fireSelectionFinish.call(this._oTaskDefinitionFilter)
			*/

			this._oTaskDefinitionFilter ??= this._oFilterBarView?.byId("taskdefinitionFilter");
			this._oTaskDefinitionFilter.setSelectedItems([]); // reset selected items
			if (sMainIconTabBarSelectedKey.includes("__byTaskDefinition__"))
				this._updateTaskDefinitionFilterOnTaskDefinitionTabSelected(oMainIconTabBarSelectedItem);
			this._oTaskDefinitionFilter.fireSelectionFinish.call(this._oTaskDefinitionFilter);

			if(this._oTablePersoController._oPersonalizations !== null){
				let ColumItemsPosition = this._oTablePersoController._oPersonalizations.aColumns.find(({ id }) => id === "table-taskListTable-TS20000166ITEMOVERVIEWColumn");
				if (ColumItemsPosition) {
					ColumItemsPosition.visible = false;
					this._oTablePersoController.getPersoService().setPersData(this._oTablePersoController._oPersonalizations)
				}
			}

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

		getProviderSystem: function (callback) {
			let oModel = this.getOwnerComponent().getModel();

			if (this.getOwnerComponent().getModel("ProviderSystem")) {
				callback(this.getOwnerComponent().getModel("ProviderSystem").getData());
			}

			this.getOwnerComponent().setModel(new JSONModel({}), "ProviderSystem");

			const SystemModel = this.getOwnerComponent().getModel("ProviderSystem");
			SystemModel.setData({});

			oModel.read("/SystemInfoCollection", {
				success: function (oData) {
					if (oData.results.length > 0) {
						SystemModel.setData(oData.results);
					}
					callback(SystemModel.getData());
				},
				error: function (err) {
					if (this.isJsonString(err.responseText)) {
						let messageError = JSONModel.parse(err.responseText);
						MessageToast.show(messageError.error.message.value);
					} else {
						MessageToast.show(this.i18nBundle.getText("custom.meli.msj.SystemInfoCollection"));
					}
					callback(SystemModel.getData());
				}.bind(this)
			})
		},
	});
});