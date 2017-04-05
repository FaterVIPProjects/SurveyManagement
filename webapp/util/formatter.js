sap.ui.define([
	], function () {
		"use strict";

		return {
			
			stringToBoolean: function(string){
				return (string === true || string === "true");
			},
			
			/**
			 * Rounds the formatted date from timestamp
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted 
			 */
			timestampToDate : function (expireString, date) {
				if (!date) {
					return "";
				}
				var sLocale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
				
				switch (sLocale){
					case "it":
						return expireString + " " + date.substr(8,2) + "/" + date.substr(5,2) + "/" + date.substr(2,2);
					
					case "en":
						return expireString + " " + date.substr(5,2) + "/" + date.substr(8,2) + "/" + date.substr(2,2);
				}
			},
			
			/**
			 * Convert date to js object
			 *
			 * @public
			 * @param {string} date 
			 * @returns {[object Date]} 
			 */			
			jsDate : function(date){
				return new Date(date);
			},
			
			/**
			 * Convert date to millisecond Date
			 *
			 * @public
			 * @param {string} date 
			 * @returns {string} "Date(date)"
			 */			
			jsDateMillisecond : function(date){
				var dateJS = new Date(date);
				return "Date(" + dateJS.getTime() + ")";
			},			
			
			/**
			 * Rounds the formatted date from timestamp
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * No prefix needed 
			 */
			timestampToDatev2 : function (date) {
				if (!date) {
					return "";
				}
				var sLocale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
				
				switch (sLocale){
					case "it":
						return date.substr(8,2) + "/" + date.substr(5,2) + "/" + date.substr(2,2);
					
					case "en":
						return date.substr(5,2) + "/" + date.substr(8,2) + "/" + date.substr(2,2);
				}
			},	
			
			/**
			 * Return Purchase Organization based on Society 
			 *
			 * @public
			 * @param {int} societyValue Society Number
			 * @returns {int} Purchase Organization value  
			 */			
			purchasingOrganization : function(societyValue){
				switch(societyValue){
					case "20": 
						return "10";
					case "30": 
						return "30";
					case "40": 
						return "40";
					case "50": 
						return "50";
					default: 
						return "";
				}
			},
			
			groupTitle: function(string){
				var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				return bundle.getText(string); 
			},
			
			getVisible: function(string){
				
			}
		};
	}
);