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
], function(U, X, S, F, a, J, C, M, b, T, G, c, d, e, f, D, B, P, N, g, h, m, n, R, o, A, p, q, r, s, t, u, v, w, x, y, Q, CustomFormatters) {
	"use strict";
	var z = v.ButtonType;
	sap.ui.controller("cross.fnd.fiori.inbox.CA_FIORI_INBOXExtension2.view.S2_TaskListCustom", {
		//    ClaimFunctionImport: "Claim",
		//    ReleaseFunctionImport: "Release",
		//    DecisionFunctionImport: "Decision",
		//    ConfirmFunctionImport: "Confirm",
		//    GUILinkProperty: "GUI_Link",
		//    extHookChangeFooterButtonsForExpertMode: null,
		//    onInit: function () {
		//        this.mainViewModel = new J({
		//            busy: true,
		//            delay: 0
		//        });
		//        this.getView().setModel(this.mainViewModel, "mainView");
		//        var i = cross.fnd.fiori.inbox.util.tools.Application.getImpl().getComponent();
		//        this.oDataManager = i.getDataManager();
		//        this.oDataManager.setModel(i.getModel());
		//        i.getEventBus().subscribe("cross.fnd.fiori.inbox", "refreshTask", this._refreshTask.bind(this));
		//        i.getEventBus().subscribe("cross.fnd.fiori.inbox", "refreshListInternal", this.onRefreshPressed.bind(this));
		//        this.oRouter = this.getOwnerComponent().getRouter();
		//        this._oResourceBundle = this.getResourceBundle();
		//        var V = new J({
		//            personalizationActive: false,
		//            taskListTitle: this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME"),
		//            noDataText: this._oResourceBundle.getText("XMSG_LOADING")
		//        });
		//        this.getView().setModel(V, "taskListView");
		//        this._oTable = this.byId("taskListTable");
		//        this._oTable.setBusyIndicatorDelay(0);
		//        this._oFullScreenPage = this.getView().byId("taskListPage");
		//        this._oFullScreenPage.setShowFooter(false);
		//        this.getView().setModel(i.getModel());
		//        this._oDataModel = this.getView().getModel();
		//        this._initPersonalization();
		//        this._aTaskPropertiesForSelect = [
		//            "SAP__Origin",
		//            "InstanceID",
		//            "TaskDefinitionID",
		//            "TaskDefinitionName",
		//            "TaskTitle",
		//            "Priority",
		//            "PriorityNumber",
		//            "Status",
		//            "StatusText",
		//            "CreatedBy",
		//            "CreatedByName",
		//            "CreatedOn",
		//            "CompletionDeadLine",
		//            "HasAttachments",
		//            "TaskSupports",
		//            "SupportsComments",
		//            "SupportsAttachments",
		//            "CustomAttributeData",
		//            "SupportsClaim",
		//            "SupportsRelease",
		//            "SupportsForward"
		//        ];
		//        this.fnAddAditionalSelectPropertiesAndInitBinding();
		//        this._oTableOperations = new c(this._oTable, this.getView(), [
		//            "TaskTitle",
		//            "Priority",
		//            "Status",
		//            "CreatedByName",
		//            "CompletionDeadLine",
		//            "CreatedOn"
		//        ]);
		//        this._oGrouping = new d(this._oTableOperations, this.getView());
		//        this._oSorting = new e(this._oTableOperations, this.getView());
		//        this._tableHelper = new f(this, this.getView(), this._oTable, this._oGrouping, this._oSorting, this._oTableOperations);
		//        this._actionHelper = new A(this, this.getView());
		//        this._oConfirmationDialogManager = m;
		//        this.sResubmitUniqueId = this.createId() + "DLG_RESUBMIT";
		//        this._oDataModel.attachRequestSent(function () {
		//            this._oTable.setShowNoData(false);
		//            this._oTable.setBusy(true);
		//        }.bind(this));
		//        this._oDataModel.attachRequestCompleted(function () {
		//            this._oTable.setBusy(false);
		//            this._oTable.setShowNoData(true);
		//        }.bind(this));
		//        this._oDataModel.attachRequestFailed(function () {
		//            this.mainViewModel.setProperty("/busy", false);
		//            this._oTable.setShowNoData(true);
		//        }.bind(this));
		//        if (!this.oDataManager.oModel.getServiceMetadata()) {
		//            this.oDataManager.oModel.attachMetadataLoaded(function () {
		//                this._loadInitialAppData();
		//            }.bind(this));
		//        } else {
		//            this._loadInitialAppData();
		//        }
		//        this._loadCustomAttributesDeferredForTasks = Q.Deferred();
		//        this._loadCustomAttributesDeferredForTaskDefs = Q.Deferred();
		//        this._initFBSubView().then(function (j) {
		//            this.byId("taskListPage").insertContent(j, 0);
		//        }.bind(this));
		//        if (this.oDataManager.bIsMassActionEnabled === false) {
		//            this._oTable.setMode("SingleSelectLeft");
		//        }
		//    },
		//    onExit: function () {
		//        this._tableHelper.destroy();
		//    },
		//    _loadInitialAppData: function () {
		//        this._loadScenrioDeferred = Q.Deferred();
		//        if (this.oDataManager.sScenarioId || this.oDataManager.sClientScenario) {
		//            this.oDataManager.loadInitialAppData(function (j) {
		//                if (!j) {
		//                    return;
		//                }
		//                this._oScenario = j;
		//                this._scenarioServiceInfos = j.ScenarioServiceInfos;
		//                var i = this.oDataManager.getScenarioConfig();
		//                if (j.ScenarioServiceInfos.length === 1 || i.AllItems === true) {
		//                    this._displaySortOption = true;
		//                }
		//                this._displayMultiSelectButton = i.IsMassActionEnabled;
		//                this._defaultSortKey = i.SortBy;
		//                this._loadScenrioDeferred.resolve();
		//            }.bind(this));
		//        } else {
		//            var i = this.oDataManager.getScenarioConfig();
		//            if (i.AllItems === true) {
		//                this._displayMultiSelectButton = i.IsMassActionEnabled ? true : false;
		//                this._displaySortOption = true;
		//                this._defaultSortKey = i.SortBy;
		//            }
		//            this._loadScenrioDeferred.resolve();
		//        }
		//        Q.when(this._loadScenrioDeferred).then(function () {
		//            this._oTableOperations.addSorter(this._getDefaultSorter());
		//            this._initTaskDefintionModel();
		//            this.oDataManager.oModel.getMetaModel().loaded().then(function () {
		//                this._setOnBehalfOfColumnVisibility();
		//                this._setConfidenceLevelColumnVisibility();
		//                this._storeMetaModel();
		//                this._initTaskModel();
		//            }.bind(this));
		//        }.bind(this));
		//    },
		//    _initTaskDefintionModel: function () {
		//        var _ = function (k, l) {
		//            if (l.statusCode === "200") {
		//                this.oDataManager.storeTaskDefinitionModel(k.results);
		//                var E = this._identifyColumnsTobeAdded(k.results);
		//                var H = new J({
		//                    TaskDefinitionCollection: k.results,
		//                    Columns: E
		//                });
		//                this.getView().setModel(H, "taskDefinitions");
		//                this._loadCustomAttributesDeferredForTaskDefs.resolve();
		//            } else {
		//                M.show(l.statusText + ":" + l.body);
		//            }
		//        };
		//        var i = this._getTaskDefinitionFilters();
		//        if (i) {
		//            i = [i];
		//        }
		//        var j = {
		//            filters: i,
		//            success: _.bind(this),
		//            urlParameters: {
		//                $select: "SAP__Origin,TaskDefinitionID,TaskName,CustomAttributeDefinitionData",
		//                $expand: "CustomAttributeDefinitionData"
		//            }
		//        };
		//        this._oDataModel.read("/TaskDefinitionCollection", j);
		//    },
		    _initTaskModel: function () {
		        var _ = function (l, E) {
		            if (E.statusCode === "200") {
		                var H = l.results;
		                if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
		                    H = this._dataMassage(l.results);
		                }
		                console.log("S2_TaskListCustom _initTaskModel H", H);
		                var I = new J({ TaskCollection: H });
		                this.getView().setModel(I, "taskList");
		                this._loadCustomAttributesDeferredForTasks.resolve();
		                if (this._filterDeferred) {
		                    this._filterDeferred.resolve();
		                }
		                //############ Custom Gabriel Inicio #######
		                //Custom Gabriel
		        		const tasks = H;
		        		let total=0, due=0, status={}, priorities={}, sources={"LOCAL_TGW":{count:0, tasks:{}}, "ARIBA_TGW":{count:0, tasks:{}}, "CONCUR_TGW":{count:0, tasks:{}}};
		        
		        		tasks.forEach(c => {
			        		const src = c.SAP__Origin, stt = c.Status, prt = c.Priority;
			        
			        		sources[src].count++;
					        if(!sources[src].tasks.hasOwnProperty(c.TaskDefinitionName)) {
					             sources[src].tasks[c.TaskDefinitionName] = 0;
					        }
					        sources[src].tasks[c.TaskDefinitionName]++
			        
					        if (!status.hasOwnProperty(stt)) {
					            status[stt] = 0;
					        }
					        status[stt]++;
			        
					        if (!priorities.hasOwnProperty(prt)) {
					            priorities[prt] = 0;
					        }
					        
					        if(c.CompletionDeadLine){
					        	due++;
					        }
					        priorities[prt]++;
			        		total++;
			    		});
			
			    		this.getView().getModel("taskListView").setProperty("/allTaskCount", total);
			    		this.getView().getModel("taskListView").setProperty("/DueCount", due);
			    		
					    for(var key in sources){
					        console.log("minhas tasks", key, sources[key]) 
					        var propTab = "/"+ key +"Count" 
							this.getView().getModel("taskListView").setProperty(propTab, sources[key].count);
							
							if(sources[key].tasks){
								var tabFilterSource = this.byId("tabFilter"+key+"Id");
						        tabFilterSource.removeAllItems();
						        for(var key2 in sources[key].tasks){
							        tabFilterSource.addItem(new sap.m.IconTabFilter({
										key: "TaskDefinitionName>>"+key2,
										text : key2,
										count: sources[key].tasks[key2]
									}));
							    };
							}
					    };
		        
				        var tabFilterStatus = this.byId("tabFilterStatusId");
				        tabFilterStatus.removeAllItems();
				        for(var key in status){
					        tabFilterStatus.addItem(new sap.m.IconTabFilter({
								key: "Status>>"+key,
								text : key,
								count: status[key]
							}));
					    };
			     
					    var tabFilterPriority = this.byId("tabFilterPriorityId");
				        tabFilterPriority.removeAllItems();
				        for(var key in priorities){
					        tabFilterPriority.addItem(new sap.m.IconTabFilter({
							key: "Priority>>"+key,
								text : key,
								count: priorities[key]
							}));
					    };
			   
						var iconTabBar = this.byId("idIconTabBar");
						var that = this;
						iconTabBar.attachSelect(function(oEvent){
							var oBinding = that.byId("taskListTable").getBinding("items");
							console.log()
			    			var aFilters = [];
			    			var sKey = oEvent.getParameter("key");
			    			console.log("onFilterSelect", sKey);
					
			    			if(sKey === "DUE"){
			    				aFilters.push(
									new sap.ui.model.Filter("CompletionDeadLine", "NE", undefined)
								);
			    			}else if(sKey !== "ALL" && sKey !== "STATUS" && sKey !== "PRIORITY"){
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
		                M.show(E.statusText + ":" + E.body);
		            }
		        };
		        var i = [this._getinitialStatusFilters()];
		        var j = this._getTaskDefinitionFilters();
		        if (j) {
		            i.push(j);
		        }
		        var k;
		        if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
		            k = {
		                filters: [new F({
		                        filters: i,
		                        and: true
		                    })],
		                sorters: [this._getCurrentSorter()],
		                success: _.bind(this),
		                urlParameters: {
		                    $top: this.oDataManager.getListSize(),
		                    $select: this._getTaskPropertiesToFetch().join(","),
		                    $expand: "CustomAttributeData"
		                }
		            };
		        } else {
		            k = {
		                filters: [new F({
		                        filters: i,
		                        and: true
		                    })],
		                sorters: [this._getCurrentSorter()],
		                success: _.bind(this),
		                urlParameters: {
		                    $top: this.oDataManager.getListSize(),
		                    $select: this._getTaskPropertiesToFetch().join(",")
		                }
		            };
		        }
		        this._oDataModel.read("/TaskCollection", k);
		    },
		//    _refreshTask: function (i, j, k) {
		//        var _ = function (E, H) {
		//            if (H.statusCode === "200") {
		//                var I = [E];
		//                if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
		//                    I = this._dataMassage([E]);
		//                }
		//                var K = this.getView().getModel("taskList");
		//                K.setProperty(this.selectedTaskPath, I[0]);
		//                this.selectedTaskPath = undefined;
		//                this.handleSelectionChange();
		//            }
		//        };
		//        var l;
		//        if (this.oDataManager.checkPropertyExistsInMetadata("CustomAttributeData")) {
		//            l = {
		//                success: _.bind(this),
		//                urlParameters: { $expand: "CustomAttributeData" }
		//            };
		//        } else {
		//            l = { success: _.bind(this) };
		//        }
		//        this._oDataModel.read(k.contextPath, l);
		//    },
		//    _storeMetaModel: function () {
		//        if (!this.oDataManager.oServiceMetaModel) {
		//            this.oDataManager.oServiceMetaModel = this.oDataManager.oModel.getMetaModel();
		//        }
		//    },
		//    _getTaskPropertiesToFetch: function () {
		//        var j = this._aTaskPropertiesForSelect.concat();
		//        if (!j.indexOf(this.GUILinkProperty) >= 0) {
		//            j.push(this.GUILinkProperty);
		//        }
		//        for (var i = 0; i < j.length; i++) {
		//            if (!this.oDataManager.checkPropertyExistsInMetadata(j[i])) {
		//                j.splice(i, 1);
		//            }
		//        }
		//        return j;
		//    },
		//    _getinitialStatusFilters: function () {
		//        var i = [];
		//        i.push(new F({
		//            path: "Status",
		//            operator: a.EQ,
		//            value1: "READY"
		//        }));
		//        i.push(new F({
		//            path: "Status",
		//            operator: a.EQ,
		//            value1: "RESERVED"
		//        }));
		//        i.push(new F({
		//            path: "Status",
		//            operator: a.EQ,
		//            value1: "IN_PROGRESS"
		//        }));
		//        i.push(new F({
		//            path: "Status",
		//            operator: a.EQ,
		//            value1: "EXECUTED"
		//        }));
		//        return new F({
		//            filters: i,
		//            and: false
		//        });
		//    },
		//    _getTaskDefinitionFilters: function () {
		//        if (this._scenarioServiceInfos) {
		//            var i = [];
		//            for (var j = 0; j < this._scenarioServiceInfos.length; j++) {
		//                for (var k = 0; k < this._scenarioServiceInfos[j].TaskDefinitionIDs.length; k++) {
		//                    i.push(new F({
		//                        path: "TaskDefinitionID",
		//                        operator: a.EQ,
		//                        value1: this._scenarioServiceInfos[j].TaskDefinitionIDs[k]
		//                    }));
		//                }
		//            }
		//            return new F({
		//                filters: i,
		//                and: false
		//            });
		//        }
		//    },
		//    _getTaskDefinitionFiltersForFilterBar: function () {
		//        if (this._scenarioServiceInfos) {
		//            var i = [];
		//            var E = new F({
		//                filters: i,
		//                and: false
		//            });
		//            if (this.getView().getModel("taskDefinitions")) {
		//                var H = this.getView().getModel("taskDefinitions").getData().TaskDefinitionCollection;
		//                for (var j = 0; j < this._scenarioServiceInfos.length; j++) {
		//                    for (var k = 0; k < this._scenarioServiceInfos[j].TaskDefinitionIDs.length; k++) {
		//                        for (var l = 0; l < H.length; l++) {
		//                            if (H[l].TaskDefinitionID.toUpperCase().indexOf(this._scenarioServiceInfos[j].TaskDefinitionIDs[k].toUpperCase()) === 0) {
		//                                i.push(new F({
		//                                    path: "TaskDefinitionID",
		//                                    operator: a.EQ,
		//                                    value1: H[l].TaskDefinitionID
		//                                }));
		//                            }
		//                        }
		//                    }
		//                }
		//            } else {
		//                E = this._getTaskDefinitionFilters();
		//            }
		//            return E;
		//        }
		//    },
		//    _getDefaultSorter: function () {
		//        var i = false;
		//        var j = this._defaultSortKey;
		//        if (j === "CreatedOn") {
		//            i = true;
		//        }
		//        if (j === "Priority") {
		//            j = "PriorityNumber";
		//        }
		//        if (j === "CreatedBy") {
		//            j = "CreatedByName";
		//        }
		//        return new S(j, i);
		//    },
		//    _getCurrentSorter: function () {
		//        var i = this._oTableOperations.getSorter()[0];
		//        if ([
		//                "TaskTitle",
		//                "Status",
		//                "PriorityNumber",
		//                "CreatedOn",
		//                "CompletionDeadLine",
		//                "CreatedByName"
		//            ].indexOf(i.sPath) !== -1) {
		//            return i;
		//        } else {
		//            return this._getDefaultSorter();
		//        }
		//    },
		//    _getTaskDefinitions: function () {
		//        var i = [];
		//        if (this._scenarioServiceInfos) {
		//            for (var j = 0; j < this._scenarioServiceInfos.length; j++) {
		//                for (var k = 0; k < this._scenarioServiceInfos[j].TaskDefinitionIDs.length; k++) {
		//                    i = i.concat(this._scenarioServiceInfos[j].TaskDefinitionIDs[k]);
		//                }
		//            }
		//        }
		//        return i;
		//    },
		//    _getTaskDefinitionsForFilterBar: function () {
		//        var i = [];
		//        if (this.getView().getModel("taskDefinitions")) {
		//            var E = this.getView().getModel("taskDefinitions").getData().TaskDefinitionCollection;
		//            if (this._scenarioServiceInfos) {
		//                for (var j = 0; j < this._scenarioServiceInfos.length; j++) {
		//                    for (var k = 0; k < this._scenarioServiceInfos[j].TaskDefinitionIDs.length; k++) {
		//                        for (var l = 0; l < E.length; l++) {
		//                            if (E[l].TaskDefinitionID.toUpperCase().indexOf(this._scenarioServiceInfos[j].TaskDefinitionIDs[k].toUpperCase()) == 0) {
		//                                i = i.concat(E[l].TaskDefinitionID);
		//                            }
		//                        }
		//                    }
		//                }
		//            }
		//        } else {
		//            i = this._getTaskDefinitions();
		//        }
		//        return i;
		//    },
		//    _getScenrio: function () {
		//        return this._oScenario ? this._oScenario.DisplayName : this._oResourceBundle.getText("ALL_ITEMS_SCENARIO_DISPLAY_NAME");
		//    },
		//    _getScenrioId: function () {
		//        var i = "";
		//        if (this.oDataManager.sScenarioId) {
		//            i = this.oDataManager.sScenarioId;
		//        } else if (this.oDataManager.sClientScenario) {
		//            i = "clntScenario";
		//        } else {
		//            i = "allItems";
		//        }
		//        return i;
		//    },
		//    _identifyColumnsTobeAdded: function (j) {
		//        var k = {};
		//        for (var i = 0; i < j.length; i++) {
		//            j[i].TaskDefinitionID = j[i].TaskDefinitionID.toUpperCase();
		//            k[j[i].TaskDefinitionID] = j[i].CustomAttributeDefinitionData.results;
		//        }
		//        return k;
		//    },
		//    _dataMassage: function (k) {
		//        var l;
		//        for (var i = 0; i < k.length; i++) {
		//            l = k[i];
		//            if (l.CustomAttributeData && l.CustomAttributeData.results) {
		//                for (var j = 0; j < l.CustomAttributeData.results.length; j++) {
		//                    l[encodeURIComponent(l.CustomAttributeData.results[j].Name)] = l.CustomAttributeData.results[j].Value;
		//                }
		//                k[i] = l;
		//            }
		//        }
		//        return k;
		//    },
		//    _initFBSubView: function () {
		//        return X.create({
		//            viewName: "cross.fnd.fiori.inbox.view.S2_FilterBar",
		//            viewData: {
		//                oTable: this._oTable,
		//                oTableOperations: this._oTableOperations,
		//                oTableHelper: this._tableHelper,
		//                parentController: this
		//            }
		//        }).catch(function () {
		//            h.error("Filterbar subview was not created successfully");
		//        });
		//    },
		//    _initPersonalization: function () {
		//        if (sap.ushell.Container) {
		//            var i = sap.ushell.Container.getService("Personalization");
		//            var j = i.getPersonalizer({
		//                container: "cross.fnd.fiori.inbox.table." + this._getScenrioId(),
		//                item: "taskListTable"
		//            });
		//            this._oTablePersoController = new T({
		//                table: this._oTable,
		//                componentName: "table",
		//                showResetAll: false,
		//                persoService: j
		//            }).activate();
		//        }
		//        this.getView().getModel("taskListView").setProperty("/personalizationActive", !!sap.ushell.Container);
		//    },
		    onTaskSelected: function (E) {
		        var i = {
		            SAP__Origin: E.getSource().getBindingContext("taskList").getProperty("SAP__Origin"),
		            InstanceID: E.getSource().getBindingContext("taskList").getProperty("InstanceID"),
		            contextPath: "TaskCollection(SAP__Origin='" + E.getSource().getBindingContext("taskList").getProperty("SAP__Origin") + "',InstanceID='" + E.getSource().getBindingContext("taskList").getProperty("InstanceID") + "')"
		        };
		        this.selectedTaskPath = E.getSource().getBindingContext("taskList").getPath();
		        this.oRouter.navTo("detail_deep", i, false);
		        return;
		    },
		//    onTaskTitlePressed: function (E) {
		//        var i = E.getSource().getBindingContext("taskList").getProperty();
		//        this.oDataManager.fetchUIExecutionLink(i, this._actionHelper.openTaskInNewWindow.bind(this._actionHelper), this._actionHelper.showErrorOnOpenTask.bind(this._actionHelper));
		//    },
		    onUpdateFinished: function (E) {
		        this.mainViewModel.setProperty("/busy", false);
		        if (t.system.phone) {
		            return;
		        }
		        var i = E.getParameter("total");
		        console.log("## S2_TaskListCustom onUpdateFinished - iItemCount", i);
				console.log("## S2_TaskListCustom onUpdateFinished - getParameters", E.getParameters());
				
				this.getView().getModel("taskListView").setProperty("/taskListCount", i);
				
		        this.getView().getModel("taskListView").setProperty("/taskListTitle", i ? this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME_COUNT", [i]) : this._oResourceBundle.getText("ITEMS_SCENARIO_DISPLAY_NAME"));
		        this.getView().getModel("taskListView").setProperty("/noDataText", this._oResourceBundle.getText("view.Workflow.noDataTasks"));
		        
		        
		  //      var tasks = this.getView().getModel("taskList").oData;
		  //      console.log("## S2_TaskListCustom onUpdateFinished - taskList", tasks)
		        
		        
		  //      let sources = {"LOCAL_TGW":{count:0, tasks:{}}, "ARIBA_TGW":{count:0, tasks:{}}, "CONCUR_TGW":{count:0, tasks:{}}}
		  //      let status = {};
		  //      let priorities = {}
			    
			 //   tasks.TaskCollection.forEach(c => {
			 //       const src = c.SAP__Origin;
			 //       const stt = c.Status;
			 //       const prt = c.Priority;
			        
			 //       sources[src].count++;
			 //       if(!sources[src].tasks.hasOwnProperty(c.TaskDefinitionName)) {
			 //            sources[src].tasks[c.TaskDefinitionName] = 0;
			 //       }
			 //       sources[src].tasks[c.TaskDefinitionName]++
			        
			 //       if (!status.hasOwnProperty(stt)) {
			 //           status[stt] = 0;
			 //       }
			 //       status[stt]++;
			        
			 //        if (!priorities.hasOwnProperty(prt)) {
			 //           priorities[prt] = 0;
			 //       }
			 //       priorities[prt]++;
			 //   });
			
			 //   console.log("minhas origens", sources);
			 //   console.log("meus status", status);   
			    
			 //   for(var key in sources){
			 //       console.log("minhas tasks", key, sources[key]) 
			 //       var propTab = "/"+ key +"Count" 
				// 	this.getView().getModel("taskListView").setProperty(propTab, sources[key].count);
					
				// 	if(sources[key].tasks){
				// 		var tabFilterSource = this.byId("tabFilter"+key+"Id");
				//         tabFilterSource.removeAllItems();
				//         for(var key2 in sources[key].tasks){
				// 	        tabFilterSource.addItem(new sap.m.IconTabFilter({
				// 				key: key2,
				// 				text : key2,
				// 				count: sources[key].tasks[key2]
				// 			}));
				// 	    };
				// 	}
			 //   };
		        
		  //      var tabFilterStatus = this.byId("tabFilterStatusId");
		  //      tabFilterStatus.removeAllItems();
		  //      for(var key in status){
			 //       tabFilterStatus.addItem(new sap.m.IconTabFilter({
				// 		key: key,
				// 		text : key,
				// 		count: status[key]
				// 	}));
			 //   };
			     
			 //   var tabFilterPriority = this.byId("tabFilterPriorityId");
		  //      tabFilterPriority.removeAllItems();
		  //      for(var key in priorities){
			 //       tabFilterPriority.addItem(new sap.m.IconTabFilter({
				// 		key: key,
				// 		text : key,
				// 		count: priorities[key]
				// 	}));
			 //   };
			    
		  //      var ov = this.getView().getModel("taskListView").oData;
		  //      console.log("## S2_TaskListCustom onUpdateFinished - taskListView", ov)
				
				// var iconTabBar = this.byId("idIconTabBar");
				// console.log("## S2_TaskListCustom onUpdateFinished - iconTabBar", iconTabBar)
				
				// var that = this;
				// iconTabBar.attachSelect(function(oEvent){
				// 	console.log("onFilterSelect", sKey, oEvent);
					
				// 	var oBinding = that.byId("taskListTable").getBinding("items");
			 //   	var sKey = oEvent.getParameter("key");
			 //   	var aFilters = [];
			    	
			 //   	if (sKey === "READY") {
				// 		aFilters.push(
				// 			new sap.ui.model.Filter("Status", "EQ", "READY")
				// 		);
				// 	}else if (sKey === "IN_PROGRESS") {
				// 		aFilters.push(
				// 			new sap.ui.model.Filter("Status", "EQ", "IN_PROGRESS")
				// 		);
				// 	}else if (sKey === "EXECUTED") {
				// 		aFilters.push(
				// 			new sap.ui.model.Filter("Status", "EQ", "EXECUTED")
				// 		);
				// 	}
					
			 //   	oBinding.filter(aFilters);
			 //   });
				     
		    },
		    // onFilterSelect: function(oEvent){
		    // 	var sKey = oEvent.getParameter("key"),
		    // 	console.log("onFilterSelect", sKey, oEvent);
		    // },
		//    onPersonalizationPressed: function () {
		//        this._oTablePersoController.openDialog();
		//    },
		//    createGroupHeader: function (i) {
		//        return new G({
		//            title: i.text,
		//            upperCase: false
		//        });
		//    },
		//    onGroupPressed: function () {
		//        this._oGrouping.openGroupingDialog();
		//    },
		//    onSortPressed: function () {
		//        this._oSorting.openSortingDialog();
		//    },
		//    attachControl: function (i) {
		//        var j = this.getOwnerComponent().getContentDensityClass();
		//        s(j, this.getView(), i);
		//        this.getView().addDependent(i);
		//    },
		//    onMessagesButtonPress: function (E) {
		//        if (!this._oMessagePopover) {
		//            this._oMessagePopover = new w({
		//                items: {
		//                    path: "message>/",
		//                    template: new u({
		//                        description: "{message>description}",
		//                        type: "{message>type}",
		//                        title: "{message>message}"
		//                    })
		//                }
		//            });
		//            this._oMessagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
		//            this.attachControl(this._oMessagePopover);
		//        }
		//        this._oMessagePopover.openBy(E.getSource());
		//    },
		//    setFilterBar: function (i) {
		//        this._oFilterBar = i;
		//    },
		//    onRefreshPressed: function (E) {
		//        this.selectedTaskPath = undefined;
		//        this._filterDeferred = Q.Deferred();
		//        this._initTaskDefintionModel();
		//        this._initTaskModel();
		//        Q.when(this._filterDeferred).then(function () {
		//            this._oFilterBar.fireSearch();
		//        }.bind(this));
		//        this._oFullScreenPage.setShowFooter(false);
		//    },
		//    onNavBack: function (E) {
		//        window.history.go(-1);
		//    },
		//    handleSelectionChange: function (E) {
		//        this.clearFooterButtons();
		//        var i = this._oTable.getSelectedContexts();
		//        this.findCommonButtonsForSelectedTasks(i);
		//    },
		//    clearFooterButtons: function () {
		//        this._oFullScreenPage.setPositiveAction(null);
		//        this._oFullScreenPage.setNegativeAction(null);
		//        this._oFullScreenPage.removeAllCustomFooterContent();
		//        this.oSelectedTasksDetails = null;
		//        this.oPositiveButton = null;
		//        this.oNegativeButton = null;
		//    },
		//    findCommonButtonsForSelectedTasks: function (i) {
		//        if (i.length === 0) {
		//            this._oFullScreenPage.setShowFooter(false);
		//            return;
		//        }
		//        this._oFullScreenPage.setShowFooter(true);
		//        this.oSelectedTasksDetails = this._actionHelper.getSelectedTasksDetails(i);
		//        if (this.oSelectedTasksDetails.bContainsConfirmableItem || this.oDataManager.getScenarioConfig().AllItems && this.oSelectedTasksDetails.aSelectedTaskTypes.length > 1) {
		//            this.createFooterButtonsForSelectedTasks([]);
		//        } else if (this.oDataManager.getScenarioConfig().AllItems) {
		//            this.oDataManager.readDecisionOptions(this.oSelectedTasksDetails.aItems[0].SAP__Origin, this.oSelectedTasksDetails.aItems[0].InstanceID, this.oSelectedTasksDetails.aSelectedTaskTypes[0], this.createFooterButtonsForSelectedTasks.bind(this), null, false);
		//        } else {
		//            this.oDataManager.massReadDecisionOptions(this.oSelectedTasksDetails.oSelectedTaskTypes, this.createFooterButtonsWithScenario.bind(this));
		//        }
		//    },
		//    createFooterButtonsWithScenario: function (i) {
		//        this.createFooterButtonsForSelectedTasks(this._actionHelper.getCommonDecisionsForMultipleTasks(i));
		//    },
		//    createFooterButtonsForSelectedTasks: function (l) {
		//        var E = 1;
		//        var H = 0;
		//        if (this.oSelectedTasksDetails.bContainsConfirmableItem && this.oSelectedTasksDetails.SupportsConfirm) {
		//            H = E;
		//            E++;
		//            var I = this.getPositiveButton(null);
		//            if (I) {
		//                I.iDisplayOrderPriority = H;
		//            }
		//            this._oFullScreenPage.addCustomFooterContent(I);
		//        } else if (!this.oSelectedTasksDetails.bContainsConfirmableItem) {
		//            for (var i = 0; i < l.length; i++) {
		//                var K = l[i];
		//                var L = new g({
		//                    text: K.DecisionText,
		//                    press: this.showDecisionDialog.bind(this, K)
		//                });
		//                if (!K.Nature) {
		//                    H = 400 + E;
		//                    E++;
		//                } else if (K.Nature.toUpperCase() === "POSITIVE") {
		//                    H = E;
		//                    E++;
		//                    L.setType(z.Accept);
		//                } else if (K.Nature.toUpperCase() === "NEGATIVE") {
		//                    H = 200 + E;
		//                    E++;
		//                    L.setType(z.Reject);
		//                } else {
		//                    H = 400 + E;
		//                    E++;
		//                }
		//                L.iDisplayOrderPriority = H;
		//                this._oFullScreenPage.addCustomFooterContent(L);
		//            }
		//        }
		//        if (this.oSelectedTasksDetails.SupportsClaim) {
		//            H = 1500 + E;
		//            E++;
		//            var O = this.getClaimButton();
		//            if (O) {
		//                O.iDisplayOrderPriority = H;
		//            }
		//            this._oFullScreenPage.addCustomFooterContent(O);
		//        }
		//        if (this.oSelectedTasksDetails.SupportsRelease) {
		//            H = 1500 + E;
		//            E++;
		//            var V = this.getReleaseButton();
		//            if (V) {
		//                V.iDisplayOrderPriority = H;
		//            }
		//            this._oFullScreenPage.addCustomFooterContent(V);
		//        }
		//        if (this.oSelectedTasksDetails.aSelectedTaskTypes.length === 1 && this.oSelectedTasksDetails.SupportsForward) {
		//            H = 1500 + E;
		//            E++;
		//            var W = this.getForwardButton();
		//            if (W) {
		//                W.iDisplayOrderPriority = H;
		//            }
		//            this._oFullScreenPage.addCustomFooterContent(W);
		//        }
		//        if (this.oSelectedTasksDetails.SupportsResubmit) {
		//            H = 1500 + E;
		//            E++;
		//            var Y = this.getResubmitButton();
		//            if (Y) {
		//                Y.iDisplayOrderPriority = H;
		//            }
		//            this._oFullScreenPage.addCustomFooterContent(Y);
		//        }
		//        var Z = {};
		//        Z.aFooterButtons = this._oFullScreenPage.getCustomFooterContent();
		//        Z.oPositiveAction = this._oFullScreenPage.getPositiveAction();
		//        Z.oNegativeAction = this._oFullScreenPage.getNegativeAction();
		//        if (this.extHookChangeFooterButtonsForExpertMode) {
		//            this.extHookChangeFooterButtonsForExpertMode(Z);
		//            this._oFullScreenPage.removeAllCustomFooterContent();
		//            if (Z) {
		//                if (Z.oPositiveAction) {
		//                    if (!Z.oPositiveAction.iDisplayOrderPriority) {
		//                        H = E;
		//                        E++;
		//                        Z.oPositiveAction.iDisplayOrderPriority = H;
		//                    }
		//                    this._oFullScreenPage.addCustomFooterContent(Z.oPositiveAction);
		//                }
		//                if (Z.oNegativeAction) {
		//                    if (!Z.oNegativeAction.iDisplayOrderPriority) {
		//                        H = E;
		//                        E++;
		//                        Z.oNegativeAction.iDisplayOrderPriority = H;
		//                    }
		//                    this._oFullScreenPage.addCustomFooterContent(Z.oNegativeAction);
		//                }
		//                if (Z.aFooterButtons) {
		//                    var $ = Z.aFooterButtons.length;
		//                    for (var j = 0; j < $; j++) {
		//                        this._oFullScreenPage.addCustomFooterContent(Z.aFooterButtons[j]);
		//                    }
		//                }
		//            }
		//        }
		//        if (this._oFullScreenPage.getCustomFooterContent()) {
		//            this._oFullScreenPage.getCustomFooterContent().sort(p.compareButtons);
		//            var _ = this._oFullScreenPage.getCustomFooterContent();
		//            this._oFullScreenPage.removeAllCustomFooterContent();
		//            if (_.length <= 0) {
		//                b.warning(this._oResourceBundle.getText("NO_COMMON_ACTIONS"));
		//                this._oFullScreenPage.setShowFooter(false);
		//            }
		//            for (var k = 0; k < _.length; k++) {
		//                this._oFullScreenPage.addCustomFooterContent(_[k]);
		//            }
		//        }
		//    },
		//    getPositiveButton: function (i) {
		//        if (!this.oPositiveButton) {
		//            this.oPositiveButton = new P();
		//        }
		//        if (i) {
		//            this.oPositiveButton.setText(i.DecisionText).attachPress(this.showDecisionDialog.bind(this, i));
		//        } else {
		//            this.oPositiveButton.setText(this._oResourceBundle.getText("XBUT_CONFIRM")).attachPress(this.showConfirmDialog.bind(this));
		//        }
		//        return this.oPositiveButton;
		//    },
		//    getNegativeButton: function (i) {
		//        if (!this.oNegativeButton) {
		//            this.oNegativeButton = new N();
		//        }
		//        this.oNegativeButton.setText(i.DecisionText).attachPress(this.showDecisionDialog.bind(this, i));
		//        return this.oNegativeButton;
		//    },
		//    getClaimButton: function () {
		//        if (!this.oClaimButton) {
		//            this.oClaimButton = new g({
		//                text: this._oResourceBundle.getText("XBUT_CLAIM"),
		//                press: this.sendActionForSelectedTasks.bind(this, this.ClaimFunctionImport)
		//            });
		//        }
		//        return this.oClaimButton;
		//    },
		//    getReleaseButton: function () {
		//        if (!this.oReleaseButton) {
		//            this.oReleaseButton = new g({
		//                text: this._oResourceBundle.getText("XBUT_RELEASE"),
		//                press: this.sendActionForSelectedTasks.bind(this, this.ReleaseFunctionImport)
		//            });
		//        }
		//        return this.oReleaseButton;
		//    },
		//    getForwardButton: function () {
		//        if (!this.oForwardButton) {
		//            this.oForwardButton = new g({
		//                text: this._oResourceBundle.getText("XBUT_FORWARD"),
		//                press: this.onForwardPopUp.bind(this)
		//            });
		//        }
		//        return this.oForwardButton;
		//    },
		//    getResubmitButton: function () {
		//        if (!this.oResubmitButton) {
		//            this.oResubmitButton = new g({
		//                text: this._oResourceBundle.getText("XBUT_RESUBMIT"),
		//                press: this.showResubmitPopUp.bind(this)
		//            });
		//        }
		//        return this.oResubmitButton;
		//    },
		//    showConfirmDialog: function () {
		//        this._oConfirmationDialogManager.showDecisionDialog({
		//            question: this._oResourceBundle.getText(this.oSelectedTasksDetails.aItems.length > 1 ? "XMSG_CONFIRM_QUESTION_PLURAL" : "XMSG_CONFIRM_QUESTION", [this.oSelectedTasksDetails.aItems.length]),
		//            showNote: false,
		//            title: this._oResourceBundle.getText("XTIT_SUBMIT_CONFIRM"),
		//            confirmButtonLabel: this._oResourceBundle.getText("XBUT_CONFIRM"),
		//            confirmActionHandler: function () {
		//                this.sendActionForSelectedTasks(this.ConfirmFunctionImport);
		//            }.bind(this)
		//        });
		//    },
		//    showDecisionDialog: function (i) {
		//        this._oConfirmationDialogManager.showDecisionDialog({
		//            question: this._oResourceBundle.getText(this.oSelectedTasksDetails.aItems.length > 1 ? "XMSG_MULTI_DECISION_QUESTION_PLURAL" : "XMSG_MULTI_DECISION_QUESTION", [
		//                i.DecisionText,
		//                this.oSelectedTasksDetails.aItems.length
		//            ]),
		//            textAreaLabel: this._oResourceBundle.getText("XFLD_TextArea_Decision"),
		//            showNote: true,
		//            title: this._oResourceBundle.getText("XTIT_SUBMIT_DECISION"),
		//            confirmButtonLabel: this._oResourceBundle.getText("XBUT_SUBMIT"),
		//            noteMandatory: i.CommentMandatory,
		//            confirmActionHandler: function (j, k) {
		//                this.sendActionForSelectedTasks(this.DecisionFunctionImport, j, k);
		//            }.bind(this, i)
		//        });
		//    },
		//    sendActionForSelectedTasks: function (i, j, k) {
		//        this.oDataManager.sendMultiAction(i, this.oSelectedTasksDetails.aItems, j, k, null, this.handleActionPerformed.bind(this), null);
		//    },
		//    onForwardPopUp: function () {
		//        var i = this.oSelectedTasksDetails.aItems[0];
		//        var O = i.SAP__Origin;
		//        var I = i.InstanceID;
		//        var j = this.oSelectedTasksDetails.aItems.length;
		//        if (this.oDataManager.userSearch) {
		//            n.open(this.startForwardFilter.bind(this), this.closeForwardPopUp.bind(this), j);
		//            this.oDataManager.readPotentialOwners(O, I, this._PotentialOwnersSuccess.bind(this));
		//        } else {
		//            q.open(this.closeForwardPopUp.bind(this), j);
		//        }
		//    },
		//    _PotentialOwnersSuccess: function (i) {
		//        n.setAgents(i.results);
		//        n.setOrigin(this.oSelectedTasksDetails.aItems[0].SAP__Origin);
		//    },
		//    startForwardFilter: function (l, i) {
		//        i = i.toLowerCase();
		//        var j = l.getBindingContext().getProperty("DisplayName").toLowerCase();
		//        var k = l.getBindingContext().getProperty("Department").toLowerCase();
		//        return j.indexOf(i) !== -1 || k.indexOf(i) !== -1;
		//    },
		//    closeForwardPopUp: function (j) {
		//        if (j && j.bConfirmed) {
		//            var k = this.oSelectedTasksDetails.aItems;
		//            var I = [];
		//            for (var i = 0; i < k.length; i++) {
		//                var l = k[i];
		//                I.push(l);
		//            }
		//            var E = this.oSelectedTasksDetails.aItems.length;
		//            var H = I.length === E ? true : false;
		//            this.oDataManager.doMassForward(I, j.oAgentToBeForwarded, j.sNote, this.sendMultiSelectForwardSuccess.bind(this, H), null);
		//        } else {
		//            this.refreshTaskListAfterActionExecution();
		//        }
		//    },
		//    sendMultiSelectForwardSuccess: function (i, j, E, k) {
		//        if (E.length == 0) {
		//            var l = this.getView().getModel("i18n").getResourceBundle();
		//            setTimeout(function () {
		//                M.show(l.getText(j.length > 1 ? "dialog.success.multi_forward_complete_plural" : "dialog.success.multi_forward_complete", [
		//                    j.length,
		//                    k.DisplayName
		//                ]));
		//            }.bind(this), 500);
		//            this.refreshTaskListAfterActionExecution();
		//        } else {
		//            o.openMessageDialog(j, E, this.refreshTaskListAfterActionExecution.bind(this, i, E));
		//        }
		//    },
		//    refreshTaskListAfterActionExecution: function () {
		//        this.onRefreshPressed();
		//    },
		//    showResubmitPopUp: function () {
		//        R.open(this.sResubmitUniqueId, this, this.getView());
		//    },
		//    handleResubmitPopOverOk: function () {
		//        var i = x.byId(this.sResubmitUniqueId, "DATE_RESUBMIT");
		//        var j = i.getSelectedDates();
		//        var k = j[0].getStartDate();
		//        var l = y.getDateInstance({ pattern: "yyyy-MM-ddTHH:mm:ss" });
		//        this.oDataManager.doMassResubmit(this.oSelectedTasksDetails.aItems, "datetime'" + l.format(k) + "'", this.handleActionPerformed.bind(this), null);
		//        R.close();
		//    },
		//    handleActionPerformed: function (i, E, j) {
		//        if (E.length === 0) {
		//            setTimeout(function () {
		//                M.show(this._oResourceBundle.getText(i.length > 1 ? "dialog.success.multi_complete_plural" : "dialog.success.multi_complete", i.length));
		//            }.bind(this), 500);
		//            this.updateTableOnActionComplete(j);
		//        } else {
		//            o.openMessageDialog(i, E, this.updateTableOnActionComplete.bind(this, j));
		//        }
		//    },
		//    updateTableOnActionComplete: function (k) {
		//        if (k && k.length > 0) {
		//            var l = this.getView().getModel("taskList"), E;
		//            var i;
		//            for (i = 0; i < k.length; i++) {
		//                E = k[i];
		//                var H = l.getProperty(this.oSelectedTasksDetails.aItems[E.index].sContextPath);
		//                var I = Object.keys(H);
		//                for (var j = 0; j < I.length; j++) {
		//                    var K = I[j];
		//                    if (H.hasOwnProperty(K) && E.oData.hasOwnProperty(K)) {
		//                        H[K] = E.oData[K];
		//                    }
		//                }
		//                l.setProperty(this.oSelectedTasksDetails.aItems[E.index].sContextPath, H);
		//            }
		//        }
		//        this._oTable.removeSelections(true);
		//        this.handleSelectionChange();
		//    },
		//    fnAddAditionalSelectPropertiesAndInitBinding: function () {
		//        var i = this;
		//        var j = i.oDataManager;
		//        j.oModel.getMetaModel().loaded().then(function () {
		//            j.oServiceMetaModel = j.oModel.getMetaModel();
		//            if (j.checkPropertyExistsInMetadata("SubstitutedUser")) {
		//                i._aTaskPropertiesForSelect.push("SubstitutedUser");
		//            }
		//            if (j.checkPropertyExistsInMetadata("SubstitutedUserName")) {
		//                i._aTaskPropertiesForSelect.push("SubstitutedUserName");
		//            }
		//            if (j.checkPropertyExistsInMetadata("ConfidenceLevel", "Task")) {
		//                i._aTaskPropertiesForSelect.push("ConfidenceLevel");
		//            }
		//        });
		//    },
		//    _setOnBehalfOfColumnVisibility: function () {
		//        if (!this.oDataManager.areSubstitutionsAvailable()) {
		//            this.byId("taskListTable").removeColumn(this.byId("onBehalfOfColumn"));
		//            this.byId("columnListItem").removeCell(this.byId("onBehalfOfTxt"));
		//        }
		//    },
		//    _setConfidenceLevelColumnVisibility: function () {
		//        if (!this.oDataManager.isConfidenceLevelAvailable()) {
		//            this.byId("taskListTable").removeColumn(this.byId("confidenceLevelColumn"));
		//            this.byId("columnListItem").removeCell(this.byId("confidenceLevelTxt"));
		//        }
		//    }
	});
});