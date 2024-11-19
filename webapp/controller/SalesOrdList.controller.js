sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ust.sd.salesord.salesord.controller.SalesOrdList", {
        onInit: function () {
            var that = this;
            this._loadTableData(20, 0, "");
        },

        onSearch: function(oEvent) {
            var aFilter = [];
            var oInput = this.getView().byId("idSalesOrderInput").getValue();
            var oFilter = new sap.ui.model.Filter("SalesOrder", sap.ui.model.FilterOperator.EQ, oInput);
            aFilter.push(oFilter);
            this._loadTableData(20, 0, aFilter);
        },

        _loadTableData: function(top, skip, aFilter) {
            var that = this;
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/A_SalesOrder", {
                filters: aFilter,
                urlParameters: { "$top": top, "$skip": skip , "$select": "SalesOrder,SalesOrderType,OverallDeliveryStatus,PurchaseOrderByCustomer,SalesDistrict"},
                success: function(oData, response) {
                    var oJSONModel = new JSONModel();
                    oJSONModel.setData(oData);
                    that.getView().setModel(oJSONModel, "salesOrd");
                }, error: function(err) {

                }
            })
        },

        onCreatePressed: function(oEvent) {
            var that = this;
            var oView = this.getView();
            this._pDialog = this.loadFragment({
                name: "ust.sd.salesord.salesord.fragments.CreateOrder"
                }).then(function (oDialog) {
                oView.addDependent(oDialog);
                that._createOrdJSON();
                oDialog.open();
            }.bind(this));
        },

        onCancelPressed: function(oEvent) {
            var oDialog = this.getView().byId("idCreateOrder");
            oDialog.close();
            oDialog.destroy();
        },

        onUpdatePressed: function(oEvent) {
            var that = this;
            var oView = this.getView();
            this._pDialog = this.loadFragment({
                name: "ust.sd.salesord.salesord.fragments.UpdateOrder"
                }).then(function (oDialog) {
                oView.addDependent(oDialog);
                that._updateOrdJSON();
                oDialog.open();
            }.bind(this));
        },

        onCancelUpPressed: function(oEvent) {
            var oDialog = this.getView().byId("idUpdateOrder");
            oDialog.close();
            oDialog.destroy();
        },

        onSubmitPressed: function(oEvent) {
            var that = this;
            var oEnteredData = this.getView().getModel("createOrd").getData();
            var oPayload = {};
            if(oEnteredData.salesOrd) {
                oPayload.SalesOrder = oEnteredData.salesOrd
            }
            if(oEnteredData.salesOrdType) {
                oPayload.SalesOrderType = oEnteredData.salesOrdType
            }
            if(oEnteredData.overallDelivStat) {
                oPayload.OverallDeliveryStatus = oEnteredData.overallDelivStat
            }
            if(oEnteredData.purchaseOrdByCust) {
                oPayload.PurchaseOrderByCustomer = oEnteredData.purchaseOrdByCust
            }
            if(oEnteredData.salesDist) {
                oPayload.SalesDistrict = oEnteredData.salesDist
            }

            var oModel = this.getOwnerComponent().getModel();
            oModel.create("/A_SalesOrder", oPayload, {
                success: function(oData, response) {
                    that._loadTableData(20, 0, "");
                    new sap.m.MessageToast("Sales Order Created Successfully");                    
                }, error: function(err) {
                    new sap.m.MessageToast("Sales Order Creation Failed");
                }
            });
        },

        _createOrdJSON: function() {
            var oJSONModel = new JSONModel();
            this.getView().setModel(oJSONModel, "createOrd");
        },

        _updateOrdJSON: function() {
            var oTable = this.getView().byId("idSalesOrdTable");
            var oSelectedData = oTable.getSelectedContexts()[0].getObject();
            var oJSONModel = new JSONModel();
            oJSONModel.setData(oSelectedData);
            this.getView().setModel(oJSONModel, "updateOrd");
        },

        onSubmitUpPressed: function() {
            var that = this;
            var oEnteredData = this.getView().getModel("updateOrd").getData();
            var oPayload = {};
            // if(oEnteredData.SalesOrder) {
            //     oPayload.SalesOrder = oEnteredData.SalesOrder
            // }
            if(oEnteredData.SalesOrderType) {
                oPayload.SalesOrderType = oEnteredData.SalesOrderType
            }
            if(oEnteredData.OverallDeliveryStatus) {
                oPayload.OverallDeliveryStatus = oEnteredData.OverallDeliveryStatus
            }
            if(oEnteredData.PurchaseOrderByCustomer) {
                oPayload.PurchaseOrderByCustomer = oEnteredData.PurchaseOrderByCustomer
            }
            if(oEnteredData.SalesDistrict) {
                oPayload.SalesDistrict = oEnteredData.SalesDistrict
            }

            var oModel = this.getOwnerComponent().getModel();
            oModel.update("/A_SalesOrder('" + oEnteredData.SalesOrder + "')", oPayload, {
                success: function(oData, response) {
                    that._loadTableData(20, 0, "");
                    // new sap.m.MessageToast("Sales Order Updated Successfully");   
                    that.onCancelUpPressed();
                }, error: function(err) {
                    new sap.m.MessageToast("Sales Order Updation Failed");
                }
            });            
        },

        onSalesOrderF4: function(oEvent) {
            var oInput = this.getView().byId("idSalesOrderInput");
            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                    key: "SalesOrder",
                    supportMultiselect: false,
                    descriptionKey: "SalesOrderType",
                    ok: function (oEvent) {
                        var oInputVal = oEvent.getParameter("tokens")[0].getProperty("key");
                        oInput.setValue(oInputVal);
                        this.close();
                    },
                    cancel: function () {
                        this.close();
                    }
                });
            }
            var oDialog = this._oValueHelpDialog;
            oDialog.setTitle("Sales Order");

            var oColModel = new sap.ui.model.json.JSONModel();
                oColModel.setData({
                    cols: [
                        { label: "Sales Order", template: "SalesOrder" },
                        { label: "Sales Order Type", template: "SalesOrderType" }
                    ]
                });

            var oTable = oDialog.getTable();
            oTable.setModel(oColModel, "columns");

            //creating row model and binding it to row aggregation of table
            var oModel = this.getOwnerComponent().getModel();
            oModel.read('/A_SalesOrder', {
                urlParameters: { "$select": "SalesOrder,SalesOrderType", "$top": 20 },
                success: function (oData, response) {
                    var oRowModel = new JSONModel();
                    oRowModel.setData(oData);
                    oTable.setModel(oRowModel);
                    oTable.bindRows("/results");
                    oDialog.update();
                    oDialog.open();
                }, error: function (err) {

                }
            });
        }
    });
});
