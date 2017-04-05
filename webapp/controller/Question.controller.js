sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"org/fater/app/util/formatter",
	"sap/ui/core/routing/History",	
	"sap/m/MessageToast"
], function(Controller, formatter, History, MessageToast) {
	"use strict";

	return Controller.extend("org.fater.app.controller.Question", {
		
		formatter: formatter,
		
		onInit: function(){
			this.getRouter().attachRouteMatched(function(oEvent) {
            	if (oEvent.getParameter("name") === "question") {
            		this.getView().invalidate();
            		var oList = this.getView().byId("answerList");
            		var logonLanguage = this.getView().getModel("utils").getProperty("/LogonLanguage");
            		var description = this.getView().getModel().getProperty(("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "Text/results/0/Description"));
            		this._questionModel = this.getView().getModel();
            		this._id = oEvent.getParameter("arguments").question_id;
            		this._realId = this.getView().getModel().getProperty(("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/QuestionId"));
            		this._groupId = oEvent.getParameter("arguments").group_id;
            		this.getView().bindElement("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/");
            		if (description === '' || description === undefined){
            			this.getView().getModel().setProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/DescriptionBool", false);	
            		} else {
            			this.getView().getModel().setProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/DescriptionBool", true);
            		}
            		if (!this._questionModel.getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS")){
            			this._answerCount = 0;
            			oList.setMode("None");
            		} else {
             			this._answerCount = this._questionModel.getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS").length;           			
            			oList.setMode("Delete");
            		}
					
					this._oldQuestion = JSON.stringify(this.getView().getModel().getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id));
					this.getView().byId("questionInput").bindElement("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/Text/results/0/");
					this.getView().byId("titleQuestion").bindElement("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/Text/results/0/");
					for (var i = 0; i < oList.getItems().length; i++){
						oList.getItems()[i].bindElement("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS/" + i +"/Text/results/0/");						
					}
					this.getView().byId("languageSelect").setSelectedKey(logonLanguage);
					this.getView().byId("languagesButtons").setSelectedKey(logonLanguage);
					this.getView().byId("descriptionArea").bindProperty("value", "/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/Text/results/0/Description");
            	}
        	}, this);
		},
		
		onAfterRendering: function(){
			this.getView().byId("charButton").setEnabled(false);
			this.getView().byId("charButton").setEnabled(true);
		},
		
		onNavBack: function(){
			if (this._oldQuestion !== JSON.stringify(this.getView().getModel().getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id))){
				this._dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ConfirmBackDialog", this);
				this.getView().addDependent(this._dialog);
				this._dialog.open();				
			} else {
				var logonLanguage = this.getView().getModel("utils").getProperty("/LogonLanguage");
				this.getView().getModel("utils").setProperty("/Language", logonLanguage);
				this.getRouter().navTo("Main");	
			}
		},
		
		confirmNavBack: function(){
			var logonLanguage = this.getView().getModel("utils").getProperty("/LogonLanguage");
			this.getView().getModel().setProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id, JSON.parse(this._oldQuestion));
			this.getView().getModel("utils").setProperty("/Language", logonLanguage);
			this._dialog.close();
			this._dialog.destroy();
			this.getRouter().navTo("Main");				
		},

		cancelNavBack: function(){
			this._dialog.close();
			this._dialog.destroy();			
		},
		
		onWritingAnswer: function(oEvent){
			var input = oEvent.getSource();
			if (input.getValue()){
				input.setValueState("None");
			} else {
				input.setValueState("Error");
			}
		},
		
		onInsertAnswerPress : function(){
			if (this._answerCount === 0){
				this._answerCount++;
			}
			
			var newAnswer = {
					Title: "",
					AnswerId: this._answerCount,
					Mandatory: false
				},
				oList = this.getView().byId("answerList");
			this._questionModel.setProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS/" +  this._answerCount + "/", newAnswer);
			if (this._answerCount > 1){
				oList.setMode("Delete");
			}
			this._answerCount++;
		},
		
		handleDeleteAnswerPress: function(oEvent){
			var oItem = oEvent.getParameter("listItem"),
				oList = this.getView().byId("answerList"),
				sIndex = oItem.getBindingContext().getPath().substr(oItem.getBindingContext().getPath().lastIndexOf("/") + 1);

			this._questionModel.getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS").splice(sIndex, 1);
			this._answerCount--;
			if (this._answerCount === 1){
				oList.setMode("None");
			}			
			this._questionModel.refresh();
		},
		
		handleSaveQuestion: function(){
			var newConstraints = [];
			var answers = this.getView().getModel().getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS");
			var translations =  this.getView().getModel().getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/Text");
			var logonLanguage = this.getView().getModel("utils").getProperty("/LogonLanguage");
			var question = this.getView().getModel().getProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id);
			var check = true;
			var checkTranslation = [];
			
			//Check answers
			if (question.Type === "TEXT_MULTI_CHOICE" || question.Type === "TEXT_SINGLE_CHOICE" || question.Type === "SINGLE_CHECKBOX"){
				for (var i = 0; answers[i]; i++){
					for (var j = 0; answers[i].Text.results[j]; j++){
						if (checkTranslation[j] === undefined){
							checkTranslation[j] = true;							
						}
						if(!answers[i].Text.results[j].Title){
							//this.getView().byId("answerList").getItems()[i].getContent()[0].setValueState("Error");
							//this.getView().getModel().setProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/AnswerS/" + i + "/Text/results/" + j + "/ValueState", "Error");
							this.getView().byId("languagesButtons").getButtons()[j].addStyleClass("errorSegmentedButton");
							checkTranslation[j] = false;
							check = false;
						} else {
							if (checkTranslation[j]){
								this.getView().byId("languagesButtons").getButtons()[j].removeStyleClass("errorSegmentedButton");								
							}
						}						
					}
					if (translations[i] && translations[i].Title === ""){
						translations.splice(i,1);
					}
				}				
			}
			if (!check){
				MessageToast.show(this.getTranslation("fieldError"));
				return;
			}
			
			//Check max_length constraint
			if (this.getView().byId("charButton").getSelectedKey() === "true"){
				newConstraints.push(this.createConstraint("MAX_LENGTH"));
			}
			this.getView().getModel().setProperty("/GroupS/" + this._groupId + "/QuestionS/" + this._id + "/Constraints",newConstraints);

			this.getView().getModel("utils").setProperty("/Language", logonLanguage);
			this.getRouter().navTo("Main");	
		},
		
		createConstraint: function(type){
			var constraint = {
				"scenario" : "",
				"group_id" : this._groupId,
				"question_id": this._realId,
				"type": type,
				"value": ""
			};
			
			switch (type){
				case "MAX_LENGTH":
					constraint.scenario = "VALIDATE";
					if (!this.getView().byId("charInput").getValue()){
						this.getView().byId("charInput").setValueState("Error");
						return;
					} else {
						constraint.value = this.getView().byId("charInput").getValue();
					}
					break;
					
				default:
					break;
		
			}
			return JSON.stringify(constraint);	
		},
		
		onDescriptionWriting: function(oEvent){
			if (oEvent.getSource.getValue() === ""){
				this.getView().byId("descriptionButton").setSelectedKey("false");
			} else {
				this.getView().byId("descriptionButton").setSelectedKey("true");				
			}
		},
		
		onChangeQuestionLanguage: function(oEvent){
			var oView = this.getView();
			var oUtilsModel = oView.getModel("utils");
			var currentQuestionLanguage = oUtilsModel.getProperty("/Language");	
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var question = oView.getModel().getProperty(sPath);			
			var answers = JSON.parse(JSON.stringify(oView.getModel().getProperty(sPath + "/AnswerS")));			
			var translations = oView.getModel().getProperty(sPath + "/Text/results");
			for (var i = 0; i < translations.length; i++){
				if (translations[i].Langu === currentQuestionLanguage){
					break;
				}
			}
			//if translation not exist add it to the list
			if (i === translations.length){
				var translationItemQuestion = {
					"SurveyId" : oUtilsModel.getProperty("/SurveyId"),
					"GroupId" : (parseInt(this._groupId, 10) + 1).toString(),
					"QuestionId" : (parseInt(this._id, 10) + 1).toString(),
					"Langu": currentQuestionLanguage,
					"Description": "",
					"Title": currentQuestionLanguage + " " + translations[0].Title
				};				
				translations.push(translationItemQuestion);						
			}
			
			//Answer Translation are added only for some question type
			if (question.Type === "TEXT" || question.Type === "TEXT_AREA"){
				for (var j = 0; j < answers.length; j++){
					var answersTranslations = oView.getModel().getProperty(sPath + "/AnswerS/" + j +"/Text/results");
					for (var x = 0; x < answersTranslations.length; x++){
						if (answersTranslations[x].Langu === currentQuestionLanguage){
							break;
						}
					}
					//if translation not exist add it to the list
					if (x === answersTranslations.length){
						var translationItemAnswer = {
							"SurveyId" : oUtilsModel.getProperty("/SurveyId"),
							"GroupId" : this._groupId,
							"QuestionId" : this._id,
							"Langu": currentQuestionLanguage,
							"Title": answers[j].Text.results[0].Title
						};							
						answersTranslations.push(translationItemAnswer);						
					}
					oView.getModel().refresh();
					oView.byId("answerList").getItems()[j].bindElement(sPath + "/AnswerS/" + j + "/Text/results/" + x);
				}				
			}

			oView.getModel().refresh();
			oView.byId("questionInput").bindElement(sPath + "/Text/results/" + i);
			oView.byId("titleQuestion").bindElement(sPath + "/Text/results/" + i);
			oView.byId("descriptionArea").bindProperty("value", sPath + "/Text/results/" + x + "/Description");
			oView.byId("languagesButtons").setSelectedKey(currentQuestionLanguage);
		},
		
		onSelectLanguage: function(oEvent){
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var selectedKey = oEvent.getSource().getSelectedKey();
			var translations = oView.getModel().getProperty(sPath + "/Text/results");
			var answers = oView.getModel().getProperty(sPath + "/AnswerS");			
			var languageIndex = 0;
			for (var i = 0; i < translations.length; i++){
				if (translations[i].Langu === selectedKey){
					languageIndex = i;
					break;
				}			
			}
			for (var j = 0; j < answers.length; j++){			
				oView.byId("answerList").getItems()[j].bindElement(sPath + "/AnswerS/" + j + "/Text/results/" + languageIndex);
			}
			oView.byId("questionInput").bindElement(sPath + "/Text/results/" + languageIndex);
			oView.byId("titleQuestion").bindElement(sPath + "/Text/results/" + languageIndex);
			oView.byId("descriptionArea").bindProperty("value", sPath + "/Text/results/" + languageIndex + "/Description");	
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		/**
		 * Get the translation for sKey
		 * @public
		 * @param {string} sKey the translation key
		 * @param {array} aParameters translation paramets (can be null)
		 * @returns {string} The translation of sKey
		 */
		getTranslation: function (sKey, aParameters) {
			if( aParameters === undefined || aParameters === null ) {
				return this.getResourceBundle().getText(sKey);
			} else {
				return this.getResourceBundle().getText(sKey, aParameters);
			}
			
		},

		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});

});