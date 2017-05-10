sap.ui.define([
	"org/fater/app/framework/BaseController",
	"org/fater/app/util/formatter",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function(Controller, formatter, Filter, MessageToast) {
	"use strict";

	return Controller.extend("org.fater.app.controller.Main", {
		
		formatter: formatter,
		__targetName: "Main",
		
		
		onRouteMatched: function(){
			var oView = this.getView();
		    var sPath = "/GetSurveyId";
            if (!oView.getModel("utils").getProperty("/SurveyId")){
            	oView.setBusy(true);
				oView.getModel("oDataModel").read(sPath, {  
					success: function(oData, response) {  
						var string = "00000000000";
						var surveyId = string.substr(0, 10 - oData.SurveyId.length) + oData.SurveyId;
	                	oView.getModel("utils").setProperty("/SurveyId", surveyId);
						oView.setBusy(false);
					},  
					error: function(oData, response) {  
	                    jQuery.sap.log.info("Odata Error occured");
	                    oView.setBusy(false);  
					} 
				});	            	
            }
			this._count = 0;
			this._realOrderByGroup = [];
			this._questionModel = this.getView().getModel();
			
        	var groupLists = oView.byId("detailPage").getSections(),
        		idArray = [],
        		a = 0;	
        	for (var x = 0; x < groupLists.length; x++){
				var oSortableList = groupLists[x].getSubSections()[0].getBlocks()[0].getContent()[1],
				    listId = oSortableList.getId(),
					listUlId = listId + "-listUl";
					idArray.push(listUlId);
					oSortableList.onAfterRendering = function(){
						$("#" + idArray[a]).addClass("ui-sortable");
						$("#" + idArray[a]).sortable({
							connectWith : "-ui-sortable"
						}).disableSelection();	
						a++;
					};		
        	}
		},

		//Order is for left List. The real question's Id is calculated at runtime on survey send  
		onAddQuestionPress: function(oEvent){
			if (!this.questionModel){
				this._questionModel = this.getView().getModel();
			}
			var oView = this.getView(),
				selectedKeyGroup = oView.byId("groupSelect").getSelectedKey(),
				questionGroup = parseInt(selectedKeyGroup, 10),
				questionType = this.getType(oEvent.getSource().getId().substr(oEvent.getSource().getId().lastIndexOf("-") + 1)),
				questionPageTitle = oEvent.getSource().getText(),
				currentGroup = 0,
				selectedCluster = oView.byId("clusterSelect").getSelectedKey(),
				selectedType = oView.byId("surveyTypeSelect").getSelectedKey(),	
				selectedClusterCom = oView.byId("surveyClusterComSelect").getSelectedKey(),
				selectedPurchOrg = oView.byId("purchOrgSelect").getSelectedKey(),
				oUtilsModel = this.getView().getModel("utils"),
				surveyId = oUtilsModel.getProperty("/SurveyId"),
				logonLanguage = oUtilsModel.getProperty("/LogonLanguage"),				
				check = true;
				
			//check selects			
			if (!selectedCluster){
				oView.byId("clusterSelect").addStyleClass("selectError");
				check = false;
			}
			if (!selectedType){
				oView.byId("surveyTypeSelect").addStyleClass("selectError");
				check = false;
			}
			if (!selectedClusterCom && selectedCluster !== "0"){
				oView.byId("surveyClusterComSelect").addStyleClass("selectError");
				check = false;
			}
			if (!selectedPurchOrg && selectedCluster !== "0"){
				oView.byId("purchOrgSelect").addStyleClass("selectError");
				check = false;
			}
			if (!selectedKeyGroup){
				this.getView().byId("groupSelect").addStyleClass("selectError");
				check = false;
			}
			if (!check){
				MessageToast.show(this.getTranslation("fieldError"));
				return;
			}
			
			var	groupQuestionCount = this._questionModel.getProperty("/GroupS/" + questionGroup + "/QuestionS").length,
				count = groupQuestionCount;
				
			for (currentGroup; currentGroup < questionGroup; currentGroup++){
				count += parseInt(this._questionModel.getProperty("/GroupS/" + currentGroup + "/QuestionS").length, 10);
			}
			
			//Create array answer based on type
			var arrayAnswer = this.createArrayAnswers(questionType, groupQuestionCount, questionGroup, logonLanguage);
			
			var	newItem = {
					Title: "New Question Title",
					Constraints: "",
					Order: groupQuestionCount,
					QuestionId: (groupQuestionCount + 1).toString(),
					GroupId: (questionGroup + 1).toString(),
					Height: "50px",
					Type: questionType,
					PageTitle: questionPageTitle,
					Mandatory: false,
					DescriptionBool: false,
					Description: "",
					CharLimit: false,
					Text: {
						results : [{
							Title: "New Question Title",
							Description: "",
							GroupId: (questionGroup + 1).toString(),
							QuestionId: (groupQuestionCount + 1).toString(),
							SurveyId: surveyId,
							Langu: logonLanguage						
						}]
					},
					AnswerS: arrayAnswer
				};
			
			this._questionModel.setProperty("/GroupS/" + questionGroup + "/QuestionS/" + groupQuestionCount + "/", newItem);
			this.getRouter().navTo("question", {group_id: questionGroup, question_id: groupQuestionCount} );
		},
		
		createArrayAnswers : function (type, questionId, questionGroup, logonLanguage){
			var arrayAnswer = [];
			var surveyId = this.getView().getModel("utils").getProperty("/SurveyId");
			var answer1 = {
		        AnswerId: "0000000001",
		        Constraints: "",
		        Description: "",
		        GroupId: (questionGroup + 1).toString(),
		        HsnePoints: 0,
		        Mandatory: false,
		        QuestionId: (questionId + 1).toString(),
		        Selected: false,
		        SurveyId: surveyId,
		        Title: "New Answer Title",
		        Text : {
					results : [{
						"Langu" : logonLanguage
					}]
		        },
		        Type: type,
		    	Value: "",
		        valueState: "",
		        valueStateText: ""
		    };
			
			switch (type) {
					
				case "FILE"	:
					answer1.Title = "";
					var answer2 = JSON.parse(JSON.stringify(answer1));
					answer2.AnswerId = "0000000002";
					answer2.Type = "TEXT";
				    arrayAnswer.push(answer1);
				    arrayAnswer.push(answer2);
					break;
					
				case "DATEPICKER"	:
					answer1.Title = "";
					answer1.Type = "DATEPICKER";
				    arrayAnswer.push(answer1);
					break;					

				case "FILE_CERTIFICATION"	:
					answer1.Title = "";
					answer1.Type = "FILE";
					var answer2 = JSON.parse(JSON.stringify(answer1));
					answer2.AnswerId = "0000000002";
					answer2.Type = "TEXT";
					var answer3 = JSON.parse(JSON.stringify(answer1));
					answer3.AnswerId = "0000000003";
					answer3.Type = "DATEPICKER";					
					var answer4 = JSON.parse(JSON.stringify(answer1));
					answer4.AnswerId = "0000000004";
					answer4.Type = "SINGLE_CHECKBOX";					
				    arrayAnswer.push(answer1);
				    arrayAnswer.push(answer2);
				    arrayAnswer.push(answer3);
				    arrayAnswer.push(answer4);				    
					break;					

				case "MONEY"	:
					answer1.Title = "";
					answer1.Type = "TEXT";
					var answer2 = JSON.parse(JSON.stringify(answer1));
					answer2.AnswerId = "0000000002";
					answer2.Type = "CURRENCY";
				    arrayAnswer.push(answer1);
				    arrayAnswer.push(answer2);
					break;
					
				case "YEAR_REVENUE"	:
					answer1.Title = "";
					answer1.Type = "TEXT";
					answer1.Mandatory = true;					
					var answer2 = JSON.parse(JSON.stringify(answer1));
					answer2.AnswerId = "0000000002";
					answer2.Mandatory = true;
					answer2.Type = "CURRENCY";
					var answer3 = JSON.parse(JSON.stringify(answer1));
					answer3.AnswerId = "0000000003";
					answer3.Type = "TEXT";					
					answer3.Mandatory = true;
				    arrayAnswer.push(answer1);
				    arrayAnswer.push(answer2);
				    arrayAnswer.push(answer3);
					break;	

				case "YEAR_REVENUE_3"	:
					answer1.Title = "";
					answer1.Type = "TEXT";
					answer1.Mandatory = true;
					var answer2 = JSON.parse(JSON.stringify(answer1));
					answer2.AnswerId = "0000000002";
					answer1.Mandatory = true;
					answer2.Type = "CURRENCY";
					var answer3 = JSON.parse(JSON.stringify(answer1));
					answer3.Mandatory = true;
					answer3.Type = "TEXT";
					answer3.AnswerId = "0000000003";
					var answer4 = JSON.parse(JSON.stringify(answer1));
					answer4.Mandatory = true;
					answer4.Type = "TEXT";
					answer4.AnswerId = "0000000004";
					var answer5 = JSON.parse(JSON.stringify(answer2));
					answer5.Mandatory = true;
					answer5.Type = "CURRENCY";
					answer5.AnswerId = "0000000005";
					var answer6 = JSON.parse(JSON.stringify(answer3));
					answer6.Mandatory = true;
					answer6.Type = "TEXT";
					answer6.AnswerId = "0000000006";
					var answer7 = JSON.parse(JSON.stringify(answer1));
					answer7.Mandatory = true;
					answer7.Type = "TEXT";
					answer7.AnswerId = "0000000007";
					var answer8 = JSON.parse(JSON.stringify(answer2));
					answer8.Mandatory = true;
					answer8.Type = "CURRENCY";
					answer8.AnswerId = "0000000008";
					var answer9 = JSON.parse(JSON.stringify(answer3));
					answer9.Mandatory = true;
					answer9.Type = "TEXT";
					answer9.AnswerId = "0000000009";
				    arrayAnswer.push(answer1);
				    arrayAnswer.push(answer2);
				    arrayAnswer.push(answer3);
				    arrayAnswer.push(answer4);
				    arrayAnswer.push(answer5);
				    arrayAnswer.push(answer6);
				    arrayAnswer.push(answer7);
				    arrayAnswer.push(answer8);
				    arrayAnswer.push(answer9);				    
					break;						
					
				case "default" :
					var results = { 
							results: [{
								Title: "New Answer Title",
								AnswerId:"0000000001",
								GroupId: questionGroup,
								QuestionId: questionId,
								SurveyId: surveyId,
								Langu: logonLanguage
							}]
						};
					answer1.Text = results;	
					arrayAnswer.push(answer1);
					break;
			}
			return 	arrayAnswer;		
		},
		
		getType: function(string){
			switch (string){
				
				case "textArea":
					return "TEXT_AREA";
					
				case "text":
					return "TEXT";
				
				case "textMultiChoice":
					return "TEXT_MULTI_CHOICE";
					
				case "textSingleChoice":
					return "TEXT_SINGLE_CHOICE";
					
				case "datePicker":
					return "DATEPICKER";
					
				case "money":
					return "MONEY";					
					
				case "singleCheckBox":
					return "SINGLE_CHECKBOX";	

				case "fileCertification":
					return "FILE_CERTIFICATION";
					
				case "file":
					return "FILE";
					
				case "yearRevenue":
					return "YEAR_REVENUE";
					
				case "yearRevenue3":
					return "YEAR_REVENUE_3";	
					
				default: 
					return "Other";
			}	
		},
		
		onQuestionPress: function(oEvent){
			var itemPressed = oEvent.getSource();
			var sIndex = itemPressed.getBindingContextPath().substr(itemPressed.getBindingContextPath().lastIndexOf("/") + 1);
			var questionGroup = itemPressed.getBindingContextPath().match(/\d+/)[0];
			this.getRouter().navTo("question", {group_id: questionGroup, question_id: sIndex} );
		},
		
		handleJumpLogic: function(oEvent){
			var questionPath = oEvent.getSource().getBindingContext().getPath(),
				questionTitle = this.getView().getModel().getProperty(questionPath + "/Title"),
				questionId = this.getView().getModel().getProperty(questionPath + "/Order");
			
			this._oldConstraint = JSON.parse(JSON.stringify(this.getView().getModel().getProperty(questionPath + "/Constraints")));
			this._groupSelectedForBranching	= questionPath.substr(0, questionPath.indexOf("Question"));
			this._questionSelectedForBranching = questionPath;
			this._dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.JumpLogicDialog", this);
			this._dialog.bindElement(questionPath);
			// Filter all question that are not choices and the one that is selected
			var aFilters = [];
			aFilters.push(new Filter("Order", sap.ui.model.FilterOperator.NE, questionId)); 
			aFilters.push(new Filter([
				new Filter("Type", sap.ui.model.FilterOperator.EQ, "TEXT_MULTI_CHOICE"),
				new Filter("Type", sap.ui.model.FilterOperator.EQ, "TEXT_SINGLE_CHOICE")
			]), false); 
			this.getView().addDependent(this._dialog);
			this._dialog.setTitle(questionTitle);
			this._dialog.open();
			
			var	listItems = sap.ui.getCore().byId("constraintsList").getItems();
			for (var i = 0; listItems[i]; i++){
				var	newListItem = listItems[i],
					selects = newListItem.getContent(),
					oItemTemplateQuestion = new sap.ui.core.Item({
						text:"{Title}",
						key:"{Order}"
					}),
					oItemTemplateAnswer = new sap.ui.core.Item({
						text:"{Title}",
						key:"{AnswerId}"
					});	
				selects[0].bindItems(this._groupSelectedForBranching + "QuestionS", oItemTemplateQuestion);
				selects[0].getBinding("items").filter(aFilters);
				var selectedKey = selects[0].getSelectedKey();
				selects[2].bindItems(this._groupSelectedForBranching + "QuestionS/" + selectedKey + "/AnswerS", oItemTemplateAnswer);
			}
		},
		
		onSelectQuestionBranching: function(oEvent){
			var selectedKey = oEvent.getSource().getSelectedKey(),
				constraintIndex = oEvent.getSource().getBindingContext().getPath().substr(oEvent.getSource().getBindingContext().getPath().lastIndexOf("/") + 1), 
				listItems = sap.ui.getCore().byId("constraintsList").getItems(),
				newListItem = listItems[constraintIndex],
				selects = newListItem.getContent(),
				oItemTemplateAnswer = new sap.ui.core.Item({
					text:"{Title}",
					key:"{AnswerId}"
				});	
			selects[2].bindItems(this._groupSelectedForBranching + "QuestionS/" + selectedKey + "/AnswerS", oItemTemplateAnswer);
			oEvent.getSource().addStyleClass("selectError");
		},
		
		onAddConstraint: function(){
			var	existentConstraints = this.getView().getModel().getProperty(this._questionSelectedForBranching + "/ConstraintsJumpLogic"),
				groupId = this._questionSelectedForBranching.substr(this._questionSelectedForBranching.lastIndexOf("GroupS/" + 1, 1));

			var constraint = {
				"scenario" : "FLOW",
				"groupId" : groupId,
				"questionId": "",
				"answerId": "", 
				"type": ""
			};
			if (!existentConstraints){
				this.getView().getModel().setProperty(this._questionSelectedForBranching + "/ConstraintsJumpLogic",[constraint]);	
			} else {
				this.getView().getModel().getProperty(this._questionSelectedForBranching + "/ConstraintsJumpLogic").push(constraint);
			}			
			
			this.getView().getModel().refresh();			
			var	listItems = sap.ui.getCore().byId("constraintsList").getItems(),
				newListItem = listItems[listItems.length - 1],
				selects = newListItem.getContent(),
				oItemTemplateQuestion = new sap.ui.core.Item({
					text:"{Title}",
					key:"{Order}"
				});
			selects[0].bindItems(this._groupSelectedForBranching + "QuestionS", oItemTemplateQuestion);
			
			// Filter all question that are not choices and the one that is selected
			var aFilters = [];
			aFilters.push(new Filter("Order", sap.ui.model.FilterOperator.NE, this.getView().getModel().getProperty(this._questionSelectedForBranching + "/Order"))); 
			aFilters.push(new Filter([
				new Filter("Type", sap.ui.model.FilterOperator.EQ, "TEXT_MULTI_CHOICE"),
				new Filter("Type", sap.ui.model.FilterOperator.EQ, "TEXT_SINGLE_CHOICE")
			]), false); 
			selects[0].getBinding("items").filter(aFilters); 
		},
		
		onDeleteConstraint: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext().getPath(),
				constraints = this._questionModel.getProperty(sPath.substr(0,sPath.lastIndexOf("/"))),
				sIndex = sPath.substr(sPath.lastIndexOf("/") + 1);
				
			constraints.splice(sIndex, 1);
			this._questionModel.refresh();
		},
		
		onCancelBranching: function(){
			this._questionModel.setProperty(this._questionSelectedForBranching + "/Constraints", this._oldConstraint);
			this.closeDialog();
		},
		
		onConfirmBranching: function(){
//			existentConstraints = this.getView().getModel().getProperty(this._questionSelectedForBranching + "/Constraints"),
			var	listItems = sap.ui.getCore().byId("constraintsList").getItems(),
				check = true;
			
			for (var i = 0; listItems[i]; i++){
				var	newListItem = listItems[i],
					selects = newListItem.getContent();

				for(var j = 0; j < 3; j++){
					if (!selects[j].getSelectedKey()){
						check = false;
						selects[j].addStyleClass("selectError");
					}
				}
			}
			
			if (check){
				this.closeDialog();			
			} else {
				MessageToast.show(this.getTranslation(""));	
			}
		},

		handleDelete: function(oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				sIndex = oItem.getBindingContext().getPath().substr(oItem.getBindingContext().getPath().lastIndexOf("/") + 1),
				questionGroup = oItem.getBindingContextPath().match(/\d+/)[0];	
 
			if (!this.questionModel){
				this._questionModel = this.getView().getModel();
			}		
			this._questionModel.getProperty("/GroupS/" + questionGroup + "/QuestionS").splice(sIndex, 1);
			
			//Update all questions in the same group after the one deleted 
			var questionGroupLastQuestion = this._questionModel.getProperty("/GroupS/" + questionGroup + "/QuestionS").length - 1;
			if (questionGroupLastQuestion >= 0){
				for (var i = sIndex; i <= questionGroupLastQuestion; i++){
					var newOrder = this._questionModel.getProperty("/GroupS/" + questionGroup + "/QuestionS/" + i + "/Order") - 1;
					this._questionModel.setProperty("/GroupS/" + questionGroup + "/QuestionS/" + i + "/Order", newOrder);
				}
			}
			this._questionModel.refresh();
		},
		
		handleScoreDialog: function(){
			this._dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ScoreDialog", this);
			this.getView().addDependent(this._dialog);
			this._dialog.open();			
		},
		
		handleSaveSurvey: function(){
			var oView = this.getView(),
				selectedKeySurveyType = oView.byId("surveyTypeSelect").getSelectedKey(),
				selectedKeyCluster = oView.byId("clusterSelect").getSelectedKey(),
				selectedClusterCom = oView.byId("surveyClusterComSelect").getSelectedKey(),
				selectedClusterPurchOrg = oView.byId("purchOrgSelect").getSelectedKey();
				
			this.saveSurvey(selectedKeyCluster, selectedClusterCom, selectedClusterPurchOrg, selectedKeySurveyType);
		},

		handleSaveQuestion: function(){
			this.getRouter().navTo("home");
		},
		
		onSelectGroup: function(oEvent){
			this.getView().byId("groupSelect").removeStyleClass("selectError");
		},
		
		onSelectSurveyType: function(){
			this.getView().byId("surveyTypeSelect").removeStyleClass("selectError");
			this.loadExistentSurvey();
		},
		
		onSelectClusterCom: function(){
			this.getView().byId("surveyClusterComSelect").removeStyleClass("selectError");
			this.loadExistentSurvey();
		},		
		
		onSelectPurchOrg: function(){
			this.getView().byId("purchOrgSelect").removeStyleClass("selectError");
			this.loadExistentSurvey();
		},
		
		setValueStateNone: function(oEvent){
			oEvent.getSource().setValueState("None");
		},
		
		setValueStateNoneSelect: function(oEvent){
			oEvent.getSource().removeStyleClass("selectError");
		},		
		
		onSelectCluster: function(){
			var that = this;
			var oView = this.getView();
			var selectedCluster = oView.byId("clusterSelect").getSelectedKey();
			var sPath = "oDataModel>/ClusterSet('" + selectedCluster + "')";
			oView.byId("groupSelect").setSelectedKey("");
			if (selectedCluster === "0"){
				oView.byId("surveyClusterComSelect").setVisible(false);
				oView.byId("purchOrgSelect").setVisible(false);
				oView.getModel("utils").setProperty("/IsQualityVisible", false);
				oView.getModel("utils").setProperty("/ScoreManagement", false);	
				oView.getModel("utils").setProperty("/isHSE", false);					
			} else {
				oView.byId("surveyClusterComSelect").bindElement({ 
					path: sPath, 
				    parameters:{
				    	expand: "ClusterCom"
				    }
				});
				oView.byId("surveyClusterComSelect").setVisible(true);
				oView.byId("purchOrgSelect").bindElement({ 
					path: sPath, 
				    parameters:{
				    	expand: "ClusterCom"
				    }
				});
				oView.byId("purchOrgSelect").setVisible(true);
			}
			this.getView().byId("clusterSelect").removeStyleClass("selectError");
			oView.byId("surveyTypeSelect").setSelectedKey("");	
			oView.byId("surveyClusterComSelect").setSelectedKey("");
			oView.byId("purchOrgSelect").setSelectedKey("");	
			
			//This read shouldn't be here. Cannot retrieve Hse and other parameters with getObject 
			var	mParameters = {
                urlParameters:{
                	"$expand" : "ClusterCom"
                },				
                success : function (oData) {
                	that.getView().getModel("utils").setProperty("/ClusterComSelectedArray",oData.ClusterCom.results);
                	oView.setBusy(false);
                },
                error: function (oError) {
                    jQuery.sap.log.info("Odata Error occured");
                    oView.setBusy(false);
                }
            };
            oView.setBusy(true);
			oView.getModel("oDataModel").read("/ClusterSet('" + selectedCluster + "')", mParameters);				
			
		},
		
		loadExistentSurvey: function(){
			var oView = this.getView();
			var that = this;
			var oModel = oView.getModel();
			var selectedCluster = oView.byId("clusterSelect").getSelectedKey();	
			var selectedType = oView.byId("surveyTypeSelect").getSelectedKey();	
			var selectedClusterCom = oView.byId("surveyClusterComSelect").getSelectedKey();
			var selectedPurchOrg = oView.byId("purchOrgSelect").getSelectedKey();
	        var idArray = [];
			
			if (selectedCluster && selectedType && selectedPurchOrg && (selectedClusterCom || selectedCluster === "0")){
				
				//Set Quality and other paramaters for selected combination
				if (selectedCluster !== "0"){
					var clusterComArray = oView.getModel("utils").getProperty("/ClusterComSelectedArray");
					for (var k = 0; clusterComArray[k]; k++){
						if (clusterComArray[k].Bukrs === selectedClusterCom && clusterComArray[k].Ekorg === selectedPurchOrg){
							oView.getModel("utils").setProperty("/IsQualityVisible", clusterComArray[k].Quality);
							oView.getModel("utils").setProperty("/ScoreManagement", clusterComArray[k].ScoreManagement);	
							oView.getModel("utils").setProperty("/isHSE", clusterComArray[k].Hse);	
						}
					}
				}
				
				var aFilter = [];
				aFilter.push(new sap.ui.model.Filter("ClusterId", sap.ui.model.FilterOperator.EQ, selectedCluster ));
	    		aFilter.push(new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, selectedType ));
	    		aFilter.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "A"));
				if (selectedCluster !== "0"){
			    	aFilter.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, selectedClusterCom ));
			    	aFilter.push(new sap.ui.model.Filter("Ekorg", sap.ui.model.FilterOperator.EQ, selectedPurchOrg ));
				}	

			    var sPath = "/SurveySet";
				var	mParameters = {
					filters : aFilter,
	                urlParameters:{
	                	"$expand" : "GroupS,GroupS/QuestionS,GroupS/QuestionS/Text,GroupS/QuestionS/AnswerS,GroupS/QuestionS/AnswerS/Text"
	                },							
	                success : function (oData) {
	                	if (oData.results[0] && oData.results[0].GroupS){
	                		var GroupS = oData.results[0].GroupS.results;
		                	for (var i = 0; GroupS[i]; i++){
		                		GroupS[i].QuestionS = GroupS[i].QuestionS.results;
			                	for (var j = 0; GroupS[i].QuestionS[j]; j++){
			                		if (GroupS[i].QuestionS[j].Mandatory){
			                			GroupS[i].QuestionS[j].Mandatory = "true";
			                		} else {
			                			GroupS[i].QuestionS[j].Mandatory = "false";
			                		}
			                		if (GroupS[i].QuestionS[j].Description === ""){
			                			GroupS[i].QuestionS[j].DescriptionBool = false;
			                		} else {
			                			GroupS[i].QuestionS[j].DescriptionBool = true;
			                		}
			                		
			                		//Reformatting constraints for survey
			                		var constraints = GroupS[i].QuestionS[j].Constraints;
			                		
			                		if (constraints && constraints.length > 0) {
			                			
			                			constraints = JSON.parse(constraints);
			                			var flowConstraint = [];
			                			
			                			for (var s = 0; constraints[s]; s++){
			                				//try catch for early stage inconsistency
			                				try {
			                					
				                				var singleConstraint = JSON.parse(constraints[s]);
					                			if (singleConstraint.type === "MAX_LENGTH"){
						                			GroupS[i].QuestionS[j].CharLimit = "true";
						                			GroupS[i].QuestionS[j].CharLimitValue = singleConstraint.value;
					                			}		
					                			
					                			if (singleConstraint.scenario === "FLOW"){
						                			flowConstraint.push(singleConstraint);
						                			constraints.splice(s,1);
						                			s--;
					                			}			
					                			
			                				} catch (e) {}
			                			}
			                			GroupS[i].QuestionS[j].ConstraintsJumpLogic = flowConstraint;
			                			GroupS[i].QuestionS[j].Constraints = constraints;
			                		}
			                		
			                		GroupS[i].QuestionS[j].AnswerS = GroupS[i].QuestionS[j].AnswerS.results;
			                		GroupS[i].QuestionS[j].Height = "50px";
			                		GroupS[i].QuestionS[j].SurveyId = oView.getModel("utils").getProperty("/SurveyId");
			                		GroupS[i].QuestionS[j].Order = j;
			                	}	                		
		                	}
		                	oModel.setProperty("/GroupS",GroupS);	
	                	} else {
	                		var sRootPath = jQuery.sap.getModulePath("org.fater.app"); 
	                		var questionModelPath = sRootPath + "/model/questions.json";
	                		oModel.loadData(questionModelPath);
	                	}
	                	var groupLists = oView.byId("detailPage").getSections(),
	                		a = 0;	
	                	for (var x = 0; x < groupLists.length; x++){
							var oSortableList = groupLists[x].getSubSections()[0].getBlocks()[0].getContent()[1],
							    listId = oSortableList.getId(),
								listUlId = listId + "-listUl";
								idArray.push(listUlId);
								
							oSortableList.onAfterRendering = function(){
								$("#" + idArray[a]).addClass("ui-sortable");
								$("#" + idArray[a]).sortable({
									connectWith : "-ui-sortable",
									update: function(event, ui) {
										var indexGroupId = [];
										var groupId = this.id.replace("-listUl", "");
										groupId = groupId.substr(groupId.lastIndexOf("-") + 1);
						            	$('#'+ this.id +' li').each( function(e) {
						            		var id = $(this).attr('id');
						            		var index = id.substr(id.lastIndexOf("-") + 1);
						            		indexGroupId.push(index);
						            	});
						            	that._realOrderByGroup[groupId] = indexGroupId;
						            }
								}).disableSelection();	
								a++;
							};		
								
	                	}
						oView.setBusy(false);
	                },
	                error: function (oError) {
	                    jQuery.sap.log.info("Odata Error occured");
	                    oView.setBusy(false);
	                }
	            };
	            oView.setBusy(true);
				oView.getModel("oDataModel").read(sPath, mParameters);				   
			}
		},
		
		handleSaveSurveyOnOtherClusters: function(){
			this._dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.SaveOtherClustersDialog", this);
			this.getView().addDependent(this._dialog);
			this._dialog.open();		
		},
		
/*		onAddSurvey: function(){
			var	existentSurveys = this.getView().getModel("utils").getProperty("/SurveysList");

			var survey = {
				"ClusterId" : "",
				"Ekorg" : "",
				"Bukrs": "",
				"Type": ""
			};
			if (!existentSurveys){
				this.getView().getModel("utils").getProperty("/SurveysList",[survey]);	
			} else {
				this.getView().getModel("utils").getProperty("/SurveysList").push(survey);
			}			
			this.getView().getModel("utils").refresh();			
		},*/
		
/*		onDeleteSurveys: function(oEvent){
			var sPath = oEvent.getSource().getBindingContext("utils").getPath(),
				clusters = this.getView().getModel("utils").getProperty(sPath.substr(0,sPath.lastIndexOf("/"))),
				sIndex = sPath.substr(sPath.lastIndexOf("/") + 1);
				
			clusters.splice(sIndex, 1);
			this.getView().getModel("utils").refresh();
		},	*/	
		
		onSelectOtherCluster: function(oEvent){
			var selectedCluster = oEvent.getSource().getSelectedKey();
			var selectCompany = sap.ui.getCore().byId("otherBukrs");
			var selectPurchOrg = sap.ui.getCore().byId("otherEkorg");
			var selectType = sap.ui.getCore().byId("otherType");
/*			var sContextPath = oEvent.getSource().getBindingContext("utils").getPath();
			var selectedRow = sContextPath.substr(sContextPath.lastIndexOf("/") + 1);*/
			var sPath = "oDataModel>/ClusterSet('" + selectedCluster + "')";
			if (selectedCluster === "0"){
				selectCompany.setVisible(false);
				selectPurchOrg.setVisible(false);
/*				oView.getModel("utils").setProperty(sContextPath + "/VisibleBukrs", false);
				oView.getModel("utils").setProperty(sContextPath + "/VisibleEkorg", false);*/
			} else {
				
/*			var selectBukrs = sap.ui.getCore().byId("surveysList").getItems()[selectedRow].getContent()[1],
				selectEkorg = sap.ui.getCore().byId("surveysList").getItems()[selectedRow].getContent()[2];*/
				selectCompany.bindElement({ 
					path: sPath, 
				    parameters:{
				    	expand: "ClusterCom"
				    }
				});
				selectPurchOrg.bindElement({ 
					path: sPath, 
				    parameters:{
				    	expand: "ClusterCom"
				    }
				});
				selectCompany.setVisible(true);
				selectPurchOrg.setVisible(true);				
/*				oView.getModel("utils").setProperty(sContextPath + "/VisibleBukrs", true);
				oView.getModel("utils").setProperty(sContextPath + "/VisibleEkorg", true);	*/
			}
			selectCompany.setSelectedKey("");
			selectPurchOrg.setSelectedKey("");
			selectType.setSelectedKey("");			
			oEvent.getSource().removeStyleClass("selectError");	
		},
		
		onConfirmSaveSurveys: function(){
			var oView = this.getView(),
				oUtilsModel = oView.getModel("utils"),
				selectedClusterId = oUtilsModel.getProperty("/OtherClusterId"), 
				selectedClusterBukrs = oUtilsModel.getProperty("/OtherBukrs"), 
				selectedClusterEkorg = oUtilsModel.getProperty("/OtherEkorg"), 
				selectedClusterType = oUtilsModel.getProperty("/OtherType"),			
				check = true;
				
			//check selects			
			if (!selectedClusterId){
				sap.ui.getCore().byId("otherClusterId").addStyleClass("selectError");
				check = false;
			}
			if (!selectedClusterType){
				sap.ui.getCore().byId("otherType").addStyleClass("selectError");
				check = false;
			}
			if (!selectedClusterBukrs && selectedClusterId !== "0"){
				sap.ui.getCore().byId("otherBukrs").addStyleClass("selectError");
				check = false;
			}
			if (!selectedClusterEkorg && selectedClusterId !== "0"){
				sap.ui.getCore().byId("otherEkorg").addStyleClass("selectError");
				check = false;
			}
			if (!check){
				MessageToast.show(this.getTranslation(""));
				return;
			} 		
			this.checkIfSurveyExist(selectedClusterId, selectedClusterBukrs, selectedClusterEkorg, selectedClusterType);
			this.closeDialog();				
/*			var oView = this.getView(),
				selectedClusters = oView.getModel("utils").getProperty("/SurveysList");
			this._batchChanges = [];
			this.checkIfSurveyExist(selectedClusters);				*/		
		},
		
/*		checkIfSurveyExistOld: function(selectedKeyCluster, selectedClusterCom, selectedClusterPurchOrg, selectedKeySurveyType){
			var that = this;
			var aFilter = [];
			var oView = this.getView();
			
			aFilter.push(new sap.ui.model.Filter("ClusterId", sap.ui.model.FilterOperator.EQ, selectedKeyCluster));
    		aFilter.push(new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, selectedKeySurveyType));						
			if (selectedKeyCluster !== "0"){
		    	aFilter.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, selectedClusterCom ));
		    	aFilter.push(new sap.ui.model.Filter("Ekorg", sap.ui.model.FilterOperator.EQ, selectedClusterPurchOrg));
			}	

		    var sPath = "/SurveySet";
			var	mParameters = {
				filters : aFilter,
                success : function (oData) {
                	if (oData.results.length !== 0){
                		// This is used to pass parameters to dialog (dirty way)
                		var text = new sap.m.Text("parametersText", {
						    text : selectedKeyCluster + "/" + selectedClusterCom + "/" + selectedClusterPurchOrg + "/" 
						    	+ selectedKeySurveyType + "/"
						});
						text.setVisible(false);
						var dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ConfirmOverrideSurvey", that);
				        var oBundle = that.getView().getModel("i18n").getResourceBundle();
				        var sMsg = oBundle.getText("confirmOverride", [selectedKeyCluster, selectedClusterCom, selectedClusterPurchOrg, selectedKeySurveyType]);							
						sap.ui.getCore().byId("overrideText").setText(sMsg);
						that.getView().addDependent(that._dialog);
						dialog.addContent(text);
						dialog.open();			                		
                	} else {
                		that._counterCheckExistentSurvey++;
                  		that.addSurveyBatch(selectedKeyCluster, selectedClusterCom, selectedClusterPurchOrg, selectedKeySurveyType);              		
                	}
                },
                error: function (oError) {
                    jQuery.sap.log.info("Odata Error occured");
                    oView.setBusy(false);
                }
            };
            oView.setBusy(true);
			oView.getModel("oDataModel").read(sPath, mParameters);			
		},*/


/*		checkIfSurveyExist: function(selectedClusters){
			var that = this;
			var filters = [];
			var oView = this.getView();

			for (var i = 0; i < selectedClusters.length; i++){
				var singleCluster = [];
				singleCluster.push(new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, selectedClusters[i].Type));
				singleCluster.push(new sap.ui.model.Filter("ClusterId", sap.ui.model.FilterOperator.EQ, selectedClusters[i].ClusterId));
				singleCluster.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, selectedClusters[i].Bukrs));
				singleCluster.push(new sap.ui.model.Filter("Ekorg", sap.ui.model.FilterOperator.EQ, selectedClusters[i].Ekorg));
				var singleClusterFilter = new sap.ui.model.Filter(singleCluster);				
				filters.push(singleClusterFilter);
			}

			var aFilter = new sap.ui.model.Filter(filters,false); 
		    var sPath = "/SurveySet";
			var	mParameters = {
//				filters : aFilter,
                success : function (oData) {
                	if (oData.results.length !== 0){
						that._dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ConfirmOverrideSurvey", that);
						that.getView().addDependent(that._dialog);
						that._dialog.open();			                		
                	} else {
                		for (var j = 0; j < selectedClusters.length; j++ ){
                    		that.addSurveyBatch(selectedClusters[j].ClusterId, selectedClusters[j].Bukrs,
                    							selectedClusters[j].Ekorg, selectedClusters[j].Type);                			
                		}
					    that.sendBatch();	
                	}
                },
                error: function (oError) {
                    jQuery.sap.log.info("Odata Error occured");
                    oView.setBusy(false);
                }
            };
            oView.setBusy(true);
			oView.getModel("oDataModel").read(sPath, mParameters);			
		},*/

		checkIfSurveyExist: function(selectedClusterId, selectedClusterBukrs, selectedClusterEkorg, selectedClusterType){
			var that = this;
			var oView = this.getView();
			var aFilter = [
				new sap.ui.model.Filter([
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, selectedClusterType),
					new sap.ui.model.Filter("ClusterId", sap.ui.model.FilterOperator.EQ, selectedClusterId),
					new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, selectedClusterBukrs),
					new sap.ui.model.Filter("Ekorg", sap.ui.model.FilterOperator.EQ, selectedClusterEkorg)
				], true)
			];

		    var sPath = "/SurveySet";
			var	mParameters = {
				filters : aFilter,
                success : function (oData) {
                	if (oData.results.length !== 0){
						that._dialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ConfirmOverrideSurvey", that);
						that.getView().addDependent(that._dialog);
						that._dialog.open();			                		
                	} else {
						that.saveSurvey(selectedClusterId, selectedClusterBukrs, selectedClusterEkorg, selectedClusterType);
                	}
                },
                error: function (oError) {
                    jQuery.sap.log.info("Odata Error occured");
                    oView.setBusy(false);
                }
            };
            oView.setBusy(true);
			oView.getModel("oDataModel").read(sPath, mParameters);			
		},
		
		//Retrieve hidden text to get parameters to add to batch
		confirmOverride: function(oEvent){
			var oUtilsModel = this.getView().getModel("utils");
			var selectedClusterId = oUtilsModel.getProperty("/OtherClusterId"), 
				selectedClusterBukrs = oUtilsModel.getProperty("/OtherBukrs"), 
				selectedClusterEkorg = oUtilsModel.getProperty("/OtherEkorg"), 
				selectedClusterType = oUtilsModel.getProperty("/OtherType");
			this.saveSurvey(selectedClusterId, selectedClusterBukrs, selectedClusterEkorg, selectedClusterType);
			this.closeDialog();
/*			var selectedClusters = this.getView().getModel("utils").getProperty("/SurveysList");
			for (var i = 0; i < selectedClusters.length; i++){
				var selectedKeySurveyTypeFilters = selectedClusters[i].Type,
					selectedKeyClusterFilters = selectedClusters[i].ClusterId,
					selectedClusterComFilters = selectedClusters[i].Bukrs,
					selectedClusterPurchOrgFilters = selectedClusters[i].Ekorg;
				this.addSurveyBatch(selectedKeyClusterFilters[i], selectedClusterComFilters[i], 
      								selectedClusterPurchOrgFilters[i], selectedKeySurveyTypeFilters[i]); 
			}
		    this.sendBatch();	*/
		},
		
		cancelOverride: function(){
			this.getView().setBusy(false);
			this.closeDialog();
		},
		
		saveSurvey: function(selectedKeyCluster, selectedClusterCom, selectedClusterPurchOrg, selectedKeySurveyType){
			var oView = this.getView(),
				oModel = oView.getModel(),
				oDataModel = oView.getModel("oDataModel"),
				sPath = "/GetSurveyId",
				that = this,
				check = true;	
				
			if (!selectedKeySurveyType){
				this.getView().byId("surveyTypeSelect").addStyleClass("selectError");
				check=false;
			}	
			if (!selectedKeyCluster){
				this.getView().byId("clusterSelect").addStyleClass("selectError");
				check=false;
			}
			if (!selectedClusterPurchOrg){
				this.getView().byId("purchOrgSelect").addStyleClass("selectError");
				check=false;
			}
			if (!selectedClusterCom){
				this.getView().byId("surveyClusterComSelect").addStyleClass("selectError");
				check=false;
			}			
			if (!check){
				MessageToast.show(that.getTranslation("fieldError"));
				return;
			}
			
			oView.setBusy(true);
			oView.getModel().setProperty("/SurveyId", oView.getModel("utils").getProperty("/SurveyId"));
			oView.getModel().setProperty("/Type", selectedKeySurveyType);
			oView.getModel().setProperty("/ClusterId", selectedKeyCluster);
			oView.getModel().setProperty("/Bukrs", selectedClusterCom);
			oView.getModel().setProperty("/Ekorg", selectedClusterPurchOrg);
			oView.getModel().setProperty("/Status", "A");	

			// Reformat survey for POST and reorder questionId to match visual order
			var survey = JSON.parse(JSON.stringify(oModel.getProperty("/")));
			for (var i = 0; survey.GroupS[i]; i++){
				survey.GroupS[i].SurveyId = oView.getModel("utils").getProperty("/SurveyId");
				var orderGroup = this._realOrderByGroup[i];		
				for (var j = 0; survey.GroupS[i].QuestionS[j]; j++){

					if (!survey.GroupS[i].QuestionS[j].Constraints){
						survey.GroupS[i].QuestionS[j].Constraints = [];
					} 
					
					if (survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic){
						for (var t = 0; survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic[t]; t++){
							survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic[t] = JSON.stringify(survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic[t]);
						}
						//var formattedFlowConstraints = JSON.stringify(survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic).slice(1, -1);
						//survey.GroupS[i].QuestionS[j].Constraints = survey.GroupS[i].QuestionS[j].Constraints.concat(formattedFlowConstraints);
						try {
							survey.GroupS[i].QuestionS[j].Constraints = survey.GroupS[i].QuestionS[j].Constraints.concat(survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic);
						} catch (e) {
							
						}
						delete survey.GroupS[i].QuestionS[j].ConstraintsJumpLogic;						
					}
					
					if (survey.GroupS[i].QuestionS[j].Constraints.length === 0 || survey.GroupS[i].QuestionS[j].Constraints === "[]"){
						survey.GroupS[i].QuestionS[j].Constraints = "";
					}
					
					if (typeof survey.GroupS[i].QuestionS[j].Constraints !== "string"){
						survey.GroupS[i].QuestionS[j].Constraints = JSON.stringify(survey.GroupS[i].QuestionS[j].Constraints);						
					}
					
					if (!survey.GroupS[i].QuestionS[j].Mandatory || survey.GroupS[i].QuestionS[j].Mandatory === "false"){
						survey.GroupS[i].QuestionS[j].Mandatory = false;
					} else {
						survey.GroupS[i].QuestionS[j].Mandatory = true;
					}
					delete survey.GroupS[i].QuestionS[j].PageTitle;
					delete survey.GroupS[i].QuestionS[j].Height;
					delete survey.GroupS[i].QuestionS[j].Order;	
					delete survey.GroupS[i].QuestionS[j].CharLimit;	
					delete survey.GroupS[i].QuestionS[j].CharLimitValue;					
					delete survey.GroupS[i].QuestionS[j].DescriptionBool;	
					
					if (orderGroup){
						survey.GroupS[i].QuestionS[orderGroup[j]].QuestionId = j + 1;
					}
					survey.GroupS[i].QuestionS[j].Text = survey.GroupS[i].QuestionS[j].Text.results;
					survey.GroupS[i].QuestionS[j].Title = survey.GroupS[i].QuestionS[j].Text[0].Title;
					
					for (var y = 0; survey.GroupS[i].QuestionS[j].Text[y]; y++){
						survey.GroupS[i].QuestionS[j].Text[y].SurveyId = oView.getModel("utils").getProperty("/SurveyId");	
					}
					
					for (var x = 0; survey.GroupS[i].QuestionS[j].AnswerS[x]; x++){
						survey.GroupS[i].QuestionS[j].AnswerS[x].SurveyId = oView.getModel("utils").getProperty("/SurveyId");
						if (survey.GroupS[i].QuestionS[j].AnswerS[x].Text && survey.GroupS[i].QuestionS[j].AnswerS[x].Text.results){
							survey.GroupS[i].QuestionS[j].AnswerS[x].Text = survey.GroupS[i].QuestionS[j].AnswerS[x].Text.results;							
						}
						
						if (survey.GroupS[i].QuestionS[j].AnswerS[x].Text){
							for (var z = 0; survey.GroupS[i].QuestionS[j].AnswerS[x].Text[z]; z++){
								survey.GroupS[i].QuestionS[j].AnswerS[x].Text[z].SurveyId = oView.getModel("utils").getProperty("/SurveyId");	
							}							
						}
					}
				}    	
			}
			
			oDataModel.create("/SurveySet",survey,null,
				function(){
					oView.getModel("oDataModel").read(sPath, {  
						success: function(oData, response) {  
							var string = "00000000000";
							var surveyId = string.substr(0, 10 - oData.SurveyId.length) + oData.SurveyId;
		                	oView.getModel("utils").setProperty("/SurveyId", surveyId);
							oView.setBusy(false);
							MessageToast.show(that.getTranslation("surveySaved"));
						},  
						error: function(oData, response) {  
		                    oView.setBusy(false);  
		                    MessageToast.show(that.getTranslation("gatewayError"));
						} 
					});	  					
				},
				function(error){
					oView.setBusy(false);
					MessageToast.show(that.getTranslation("gatewayError"));
				}
			);						
		},
		
/*		addSurveyBatch: function(selectedKeyCluster, selectedClusterCom, selectedClusterPurchOrg, selectedKeySurveyType){
		    var oView = this.getView();
		    var oModel = oView.getModel();
		    var oDataModel = oView.getModel("oDataModel");
		    
		    oView.getModel().setProperty("/SurveyId", oView.getModel("utils").getProperty("/SurveyId"));
			oView.getModel().setProperty("/Type", selectedKeySurveyType);
			oView.getModel().setProperty("/ClusterId", selectedKeyCluster);
			oView.getModel().setProperty("/Bukrs", selectedClusterCom);
			oView.getModel().setProperty("/Ekorg", selectedClusterPurchOrg);
			oView.getModel().setProperty("/Status", "A");
			
			// Reformat survey for POST and reorder questionId to match visual order
			var survey = JSON.parse(JSON.stringify(oModel.getProperty("/")));
			for (var i = 0; survey.GroupS[i]; i++){
				survey.GroupS[i].SurveyId = oView.getModel("utils").getProperty("/SurveyId");
				var orderGroup = this._realOrderByGroup[i];		
				for (var j = 0; survey.GroupS[i].QuestionS[j]; j++){
					delete survey.GroupS[i].QuestionS[j].Height;
					delete survey.GroupS[i].QuestionS[j].Order;					
					if (orderGroup){
						survey.GroupS[i].QuestionS[orderGroup[j]].QuestionId = j + 1;
					}
					survey.GroupS[i].QuestionS[j].Text = survey.GroupS[i].QuestionS[j].Text.results;
					for (var y = 0; survey.GroupS[i].QuestionS[j].Text[y]; y++){
						survey.GroupS[i].QuestionS[j].Text[y].SurveyId = oView.getModel("utils").getProperty("/SurveyId");	
					}
					for (var x = 0; survey.GroupS[i].QuestionS[j].AnswerS[x]; x++){
						survey.GroupS[i].QuestionS[j].AnswerS[x].SurveyId = oView.getModel("utils").getProperty("/SurveyId");
						survey.GroupS[i].QuestionS[j].AnswerS[x].Text = survey.GroupS[i].QuestionS[j].AnswerS[x].Text.results;
						for (var z = 0; survey.GroupS[i].QuestionS[j].AnswerS[x].Text[z]; z++){
							survey.GroupS[i].QuestionS[j].AnswerS[x].Text[z].SurveyId = oView.getModel("utils").getProperty("/SurveyId");	
						}
					}
				}    	
			}
			
		    this._batchChanges.push( oDataModel.createBatchOperation("/SurveySet", "POST", survey) ); 
		},
		
		sendBatch: function(){
		    var oView = this.getView();
		    var oDataModel = oView.getModel("oDataModel");
		    var that = this;			
		    oDataModel.addBatchChangeOperations(this._batchChanges); 
		    oDataModel.submitBatch(function(data) {  
		    	oView.setBusy(false);		    	
		    }, function(err) {  
                oView.setBusy(false);
				MessageToast.show(that.getTranslation("gatewayError"));
		    }); 
		},*/
		
		closeDialog: function(){
			this._dialog.close();
			this._dialog.destroy();			
		},

/*		changeValueState: function(check, controlName){
			for (var i=0; i<controlName.length; i++){
				if (!check[i]){
					this.getView().byId(controlName[i]).setValueState("Error");
				} else {
					this.getView().byId(controlName[i]).setValueState("None");
				}	
			}
		},	*/
		
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