sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"org/fater/app/model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("org.fater.app.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-widget");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-mouse");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-draggable");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-sortable");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.parseUserInfo();
			
			this.getRouter().initialize();
		},
		
		parseUserInfo: function() {
			var id = null;
			var language= null;
			
			try {
				var userShell = sap.ushell.Container.getService("UserInfo").getUser();
				id = userShell.getId().toUpperCase();
				language = userShell.getLanguage();
			} catch ( err ) {
				id = "CO_UNISYS2";
				language = "IT";
			}
			
			var oUtilsModel = this.getModel("utils");
			var surveysList = [{
				"ClusterId" : "",
				"Ekorg" : "",
				"Bukrs": "",
				"Type": ""	
			}];
			if( !oUtilsModel ) {
				oUtilsModel = new JSONModel();
				oUtilsModel.setProperty("/Id", id);
				oUtilsModel.setProperty("/SurveysList", surveysList);
				oUtilsModel.setProperty("/Language", language);
				oUtilsModel.setProperty("/LogonLanguage", language);
				oUtilsModel.setProperty("/IsQualityVisible", false);
				oUtilsModel.setProperty("/ScoreManagement", false);
				this.setModel(oUtilsModel, "utils");
			}
		}		
	});

});