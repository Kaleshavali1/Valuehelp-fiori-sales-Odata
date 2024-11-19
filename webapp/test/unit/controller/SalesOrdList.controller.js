/*global QUnit*/

sap.ui.define([
	"ustsdsalesord/salesord/controller/SalesOrdList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SalesOrdList Controller");

	QUnit.test("I should test the SalesOrdList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
