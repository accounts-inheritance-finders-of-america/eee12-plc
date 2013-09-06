/**
 * Author : Sushil Medhe
 * executes functionblock and stores the result in scanCycle.outputImageTable
 */
window.PLCSpace.functionBlocks = (function(){
	
	var outputImgTable;
	var prevAcc = 0;
	var flag= false;
	var flagAdd = 0;
		flagSub = 0;
		flagDiv = 0;
		flagMul = 0;
	var cnt =-1;
	var inputImageTableOfSR = null ; 
	var outputImageTableOfSR = null ;
	var instructionTableOfSR = null ;
	var execute = function(fb,result , type , rungid){
		outputImgTable = PLCSpace.scanCycle.outputImageTable;
		switch(type){
		case "add" : evaluateAdd(fb,result , rungid);
					break;
		case "sub" : evaluateSub(fb,result , rungid);
					break;
		case "mul" : evaluateMul(fb,result , rungid);
					break;
		case "div" : evaluateDiv(fb,result , rungid);
		   			break;
		case "countup" : evaluateCounter(fb,result , 1);
						break;
		case "countdown" : evaluateDownCounter(fb,result);
						break;
		case "reset" : evaluateCounterReset(fb,result);
						break;
		case "timeron" : evaluateTimerOn(fb,result);
						break;
		case "timeroff" : evaluateTimerOff(fb,result);
						break;	
		case "retentivetimeron" : evaluateRTO(fb,result);
						break;
		case "latch" : evaluateLatch(fb,result , rungid);
						break;
		case "unlatch" : evaluateUnLatch(fb,result , rungid);
						break;	
		case "pid" : evaluatePID(fb,result);
                        break;
        case "equ" : evaluateEQU(fb);
                        break;
        case "neq" : evaluateNEQ(fb);
                        break;
        case "grt" : evaluateGRT(fb);
                        break;
        case "les" : evaluateLES(fb);
                        break;
        case "geq" : evaluateGEQ(fb);
                        break; 
        case "leq" : evaluateLEQ(fb);
                        break;  
        case "compare" : evaluateCMP(fb);
                        break;
        case "lim" : evaluateLIM(fb);
                        break; 
        case "move" : evaluateMOV(fb,result);
                        break; 
       	case "compute" : evaluateCPT(fb,result);
                        break;                 
       	case "jump" : evaluateJMP(fb,result);
                        break;  
        case "jsr" : evaluateJSR(fb,result);
        				break                                                                                                
		}
		//console.log(PLCSpace.objectHolder.functionalStorage);
	}
	//change the text with referenced value 
	var updateValue = function(id,status){
		for(var i = 0; i<PLCSpace.currentProgramModel._collection.length;i++){
			t = PLCSpace.currentProgramModel._collection[i].functionBlockObject;
			for(var key in t){
				if(key == id){
									
									t[key].attr.valueA.attr("text" , status);
							}
						}
		}
					
	};
		var updateValueB = function(id,status){
		for(var i = 0; i<PLCSpace.currentProgramModel._collection.length;i++){
			t = PLCSpace.currentProgramModel._collection[i].functionBlockObject;
			for(var key in t){
				if(key == id){
									
									t[key].attr.valueB.attr("text" , status);
							}
						}
		}
					
	};
	var calculateStatus = function(tag){
		outputImgTable = PLCSpace.scanCycle.outputImageTable;
		inputImgTable = PLCSpace.scanCycle.inputImageTable;
		if(tag != "" && outputImgTable[tag] != undefined){
			return outputImgTable[tag].status;
		}
		else if(tag != "" && outputImgTable[tag+"-OUT"] != undefined){
			return outputImgTable[tag+"-OUT"].status;
		}
		else if(tag != "" && inputImgTable[tag+"-OPN"] != undefined){
			return inputImgTable[tag+"-OPN"].status;
		}
		else if(tag != "" && inputImgTable[tag+"-CLS"] != undefined){
			return inputImgTable[tag+"-CLS"].status;
		}
		else {
			return 0;
		}
	}
	var evaluateExpression = function(expression){
		//TODO : evalation of expression
		if(expression === "")
			throw new Exception._("Error : Circuit cannot be Resolved ");
		
		var inputimagetable = inputImageTableOfSR;
		var keys = _.keys(inputimagetable);
		for(var i =0;i<keys.length; i++){
			expBuilder.withVariable(inputimagetable[i].tagName , inputimagetable[i].status);
		};
		var equation = expBuilder.build(expression);
		var output = eval(equation)//expBuilder.calculate(equation);
		return output;
	}
	var SetOutputOfExperssion = function(resultOfExpression , outputAddress){
		for(var key in outputImageTableOfSR){
			if(outputImageTableOfSR[key].tagName == outputAddress){
				outputImageTableOfSR[key].status = resultOfExpression ; 
				break;
			}
		}	
		
	}
	var updateInputimagetable = function(label , status){
		var inputimagetable = inputImageTableOfSR;
		var keys = _.keys(inputimagetable);
		for(var i =0;i<keys.length; i++){
			if(inputimagetable[i].tagName.split("-")[0] == label)
				inputimagetable[i].status = status;
		};
	}
	var evaluateFunctionalBlock  = function(eq , resultOfExpression){		
		var functionblocktype = eq.functionObject.functionType;
		var functionblock = eq.functionObject.functionBlock[functionblocktype];
		PLCSpace.functionBlocks.execute(functionblock , resultOfExpression,functionblocktype , eq.rungId);	
	}	
	var evaluateJSR = function(obj,result){
		// 3 tables from first/main tab
		var inputImageTableOfMain = PLCSpace.InstructionTable.instructionTable[0].input ; 
		var outputImageTableOfMain = PLCSpace.InstructionTable.instructionTable[0].output ; 
		var InstructionTableOfMain = PLCSpace.InstructionTable.instructionTable[0].equation ;
		var outputImageTable = [];
		
		var inputparam = obj.inputParam.split(",");
		var returnparam = obj.output.split(",");
		if(!!result){
			for(var programCounter = 0; programCounter < PLCSpace.PLCEditorModel._collection.length; programCounter++ ){
				// 3 tables from current tab
				inputImageTableOfSR = PLCSpace.InstructionTable.instructionTable[programCounter].input ;
				outputImageTableOfSR = PLCSpace.InstructionTable.instructionTable[programCounter].output ; 
				instructionTableOfSR = PLCSpace.InstructionTable.instructionTable[programCounter].equation ;
				
				
				for(var i = 0;i < instructionTableOfSR.length ; i++){
					if(instructionTableOfSR[i].functionObject.functionType == "sbr"){
						
						var sbrFound = instructionTableOfSR[i].functionObject.functionBlock ;
						if(sbrFound["sbr"].tagName == obj.srname){
							//set/put the  output contact in outputimagetable
							for(var k =0;k<outputImageTableOfSR.length; k++){
								PLCSpace.scanCycle.outputImageTable[outputImageTableOfSR[k].tagName] = outputImageTableOfSR[k];
							}
							//set the  output value present in function block in outputimagetable
							for(var k =1;k<instructionTableOfSR.length; k++){//k=1 to ignore 1st rung containing sbr blk 
								if(_.isEmpty(instructionTableOfSR[k].functionObject) == false){
									var type = instructionTableOfSR[k].functionObject.functionType ; 
									var obj1 = instructionTableOfSR[k].functionObject.functionBlock[type];
									var len = _.keys(obj1).length;
									for(var i=0;i < len;i++){
										if(_.isObject(_.values(obj1)[i])){
											var outputContact = (_.values(obj1)[i]);
											if(!_.isEmpty(outputContact) && outputContact!= undefined)
													if(outputContact.type != "unlatch" )
													{
														//if(outputContact.status != -1)
														PLCSpace.scanCycle.outputImageTable[outputContact.tagName] = outputContact;
													}
														
													else{
														latchOjb = PLCSpace.scanCycle.outputImageTable[outputContact.tagName]; 		//set the unlatchstatus
														PLCSpace.scanCycle.outputImageTable[outputContact.tagName] = outputContact;
														if(latchOjb == "" || latchOjb == undefined){
													
														}else{
															latchOjb.unLatchstatus = outputContact.status;
														}
													};
										}				
									}
								}
								
								
							}
							//set the values of inputparams coming from main program to sbr program
							var inputparamOfSr = sbrFound.sbr.inputParam.split(","); 
							for(var l = 0 ; l < inputparamOfSr.length ; l++){
								if(PLCSpace.scanCycle.outputImageTable[inputparam[l]] != undefined){
									var val = PLCSpace.scanCycle.outputImageTable[inputparam[l]].status ; 
									if(PLCSpace.scanCycle.outputImageTable[inputparamOfSr[l]] != undefined){
										PLCSpace.scanCycle.outputImageTable[inputparamOfSr[l]].status = val;
									}
								}else if(PLCSpace.scanCycle.inputImageTable[inputparam[l]+"-OPN"] != undefined || 
								PLCSpace.scanCycle.inputImageTable[inputparam[l]+"-CLS"] != undefined ||
								PLCSpace.scanCycle.outputImageTable[inputparam[l]+"-OUT"]){
									
									if(PLCSpace.scanCycle.inputImageTable[inputparam[l]+"-OPN"] != undefined){
										var val = PLCSpace.scanCycle.inputImageTable[inputparam[l]+"-OPN"].status ;
										var type = "OPN" ; 
									}else if(PLCSpace.scanCycle.inputImageTable[inputparam[l]+"-CLS"] != undefined){
										var val = PLCSpace.scanCycle.inputImageTable[inputparam[l]+"-CLS"].status ;
										var type = "CLS" ;
									}else if(PLCSpace.scanCycle.outputImageTable[inputparam[l]+"-OUT"] != undefined){
										var val = PLCSpace.scanCycle.outputImageTable[inputparam[l]+"-OUT"].status ;
										
									}
									
									 var lbl = inputparamOfSr[l];
									 var lblObj = PLCSpace.currentProgramModel.labels ; 
									 for(var key in lblObj){
									 	if(lblObj[key].label == lbl){
									 		collection1 =  PLCSpace.currentProgramModel._collection;
											for(var k = 0 ; k < collection1.length ; k++){
												var elem1 = collection1[k].functionBlockObject[key];
												if(elem1 != undefined && elem1._id == key ){
													if(val == 0.0 ){
														if(key.split("-")[0] == "OPN"){
															if(type == "CLS"){
																collection1[k].functionBlockObject[key]._eleSet[0][0].href.baseVal  =  "assert/img/open_toggle.png";
																updateInputimagetable(lbl,1.0);
															}
																
															else{
																collection1[k].functionBlockObject[key]._eleSet[0][0].href.baseVal  =  "assert/img/open_normal.png";
																updateInputimagetable(lbl,0.0);
															}
																
														}
															
														else if(key.split("-")[0] == "CLS"){
															collection1[k].functionBlockObject[key]._eleSet[0][0].href.baseVal  =  "assert/img/close_normal.png";
															updateInputimagetable(lbl,0.0);
														}
															
													}else if(val == 1.0){
														if(key.split("-")[0] == "OPN"){
															if(type == "CLS"){
																collection1[k].functionBlockObject[key]._eleSet[0][0].href.baseVal  =  "assert/img/open_normal.png";
																updateInputimagetable(lbl,0.0);
															}
																
															else{
																collection1[k].functionBlockObject[key]._eleSet[0][0].href.baseVal  =  "assert/img/open_toggle.png";
																updateInputimagetable(lbl,1.0);
															}
																
														}
															
														else if(key.split("-")[0] == "CLS"){
															collection1[k].functionBlockObject[key]._eleSet[0][0].href.baseVal  =  "assert/img/close_toggle.png";
															updateInputimagetable(lbl,1.0);
														}
															
													}
												}
											}
									 	}
									 }
								}
								
							}
							//search for RET block
							var retObj = null ;
							var eq = instructionTableOfSR[instructionTableOfSR.length - 1];
							if(eq.functionObject.functionType == "ret"){
								retObj = eq.functionObject.functionBlock;
								returnParamOfSr = retObj["ret"].output.split(",");
								
								//set the values of returnparams coming from sbr program to main program
								for(var l = 0 ; l < returnParamOfSr.length ; l++){
									if(PLCSpace.scanCycle.outputImageTable[returnParamOfSr[l]] != undefined){
										//var val = PLCSpace.scanCycle.outputImageTable[returnParamOfSr[l]].status ; 
										var ob = PLCSpace.scanCycle.outputImageTable[returnParamOfSr[l]];
										ob.tagName = returnparam[l];
										PLCSpace.scanCycle.outputImageTable[returnparam[l]] = ob;
										
									}
									else if(PLCSpace.scanCycle.inputImageTable[returnParamOfSr[l]] != undefined){
										var ob = PLCSpace.scanCycle.inputImageTable[returnParamOfSr[l]];
										ob.tagName = returnparam[l];
										PLCSpace.scanCycle.inputImageTable[returnparam[l]] = ob;
									}
									
								}
							}//search for RET ends
							
							//execution in current tab copied from scanCycle.js
							for(var j = 1; j < instructionTableOfSR.length ; j++){
								eq = instructionTableOfSR[j];
								var resultOfExpression = eq.equation == "" ? true : evaluateExpression(eq.equation);
								_.isEmpty(eq.functionObject) ?
									SetOutputOfExperssion(resultOfExpression , eq.output) : evaluateFunctionalBlock(eq, resultOfExpression);
									
								if(eq.output != "" && !!_.isEmpty(eq.functionObject)){
									var obj = {};
									var address = eq.output ; 
									address = address.split("-")[0];
									obj[address] =  resultOfExpression ;
									PLCSpace.PLCEditorSpace.showdata(obj);	
								}
							}
						}
					}
					
				}
			}//main forloop ends
			
		}//result ends
	}//evaluateJSR() ends
	var evaluateJMP = function(fb,result){
		var rungid = 0;
		if(!!result){
			//console.log(PLCSpace.scanCycle.outputImageTable)
			obj = PLCSpace.currentProgramModel.labels;
			for(var key in obj){
				if(key.split("-")[0] == "LBL" && obj[key].label == fb.labelName){
					rungid = key.split("-")[1];
					PLCSpace.scanCycle.RungPointer = parseInt(rungid);
				}
			}
		}
	}
	var evaluateCPT = function(obj,result){
		if(result !=0){
			var a= obj.expression;
			//var b = a.match(/[a-z]/g);
			var a1 = "(".concat(a)
			var b = a1.split(/[*\/()\.+=-][0-9]*/);
			if(b != null){
				for(var i=0;i<b.length;i++){
					
					var c = calculateStatus(b[i]);
					if(c != undefined)
					a = a.replace(b[i],c);
				}
			}
			a = eval(a);
			if(a == Infinity){
				a=0;
			}
			PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = a;
			PLCSpace.scanCycle.showData(obj.tagName , a);
		
		}
		else{
			PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
			PLCSpace.scanCycle.showData(obj.tagName , 0)
		}
	}
	var evaluateMOV = function(obj,result){
		if(result != 0 ){
			if(obj.source.status == -1){
				obj.source.status = calculateStatus(obj.source.tagName);
			}
			PLCSpace.scanCycle.outputImageTable[obj.dest.tagName].status = obj.source.status;
			PLCSpace.scanCycle.showData(obj.dest.tagName , PLCSpace.scanCycle.outputImageTable[obj.dest.tagName].status)
		}
		
	}
	var evaluateLIM = function(obj){
		var a= parseFloat(obj.lowValue);
		var c= parseFloat(obj.highValue);
		var b= parseFloat(obj.testValue);
		if(a == -1){
			a = parseFloat(calculateStatus(obj.lowLabel));
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.testLabel));
		}
		if(c == -1){
			b = parseFloat(calculateStatus(obj.highLabel));
		}
		if(b >= a && b<=c)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	var evaluateCMP = function(obj){
		//var expression = obj.expression;
		var type =  obj.operation;
		type = type.toLowerCase();
		var a = parseFloat(obj.op1);
		var b = parseFloat(obj.op2);
		
		if(isNaN(a)){
			a = parseFloat(calculateStatus(obj.op1));
		}
		if(isNaN(b)){
			b = parseFloat(calculateStatus(obj.op2));
		}
		
		
		switch(type){
			case "grt":
				if(a > b)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			break;
			case "equ":
				if(a == b)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			break;
			case "neq":
				if(a != b)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			break;
			case "les":
				if(a < b)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			break;
			case "geq":
				if(a >= b)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			break;
			case "leq":
				if(a <= b)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			break;
			case "and":
				PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = a&b;
			break;
			case "or":
				PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = a|b;
			break;
			case "xor":
				PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = a^b;
			break;
			case "not":
				if(a==0)
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status =1.0;
				else
					PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status =0.0;
			break;
		}	
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	var evaluateEQU = function(obj){
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
		}
		if(a==b)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	
	var evaluateNEQ = function(obj){
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(a == -1){
			a = calculateStatus(obj.sourceA.tagName);
			a = parseFloat(a);
		}
		if(b == -1){
			b = calculateStatus(obj.sourceB.tagName);
			b = parseFloat(b);
		}
		if(a != b)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	
	var evaluateGRT = function(obj){
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
		}
		if(a > b)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	var evaluateLES = function(obj){
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
		}
		if(a < b)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	var evaluateGEQ = function(obj){
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
		}
		if(a >= b)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	var evaluateLEQ = function(obj){
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
		}
		if(a <= b)
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 1.0
		else
			PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status = 0.0
			
		PLCSpace.scanCycle.showData(obj.outputAddress , PLCSpace.scanCycle.outputImageTable[obj.outputAddress+"-OUT"].status)
	}
	var evaluateAdd = function(obj,result,rungid){
		var paper = PLCSpace.currentProgramModel.paper;
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(result == 1){
		
		if(a == -1){
			var t;
				a = parseFloat(calculateStatus(obj.sourceA.tagName));
				updateValue("ADD-"+rungid+"-7-0",a);
			
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
			updateValueB("ADD-"+rungid+"-7-0",b);
		}
		}
		var c= a + b;
		
			if(result == 0 && flagAdd == 0)
					{
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
					}
			 else
			 {
			 	if(PLCSpace.PLCEditorSpace.flagRun == 1){
					 PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
				  }				
			   	  else {
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = c.toFixed(2);
						flagAdd = 1;	 	
					 }
			}
		PLCSpace.scanCycle.showData(obj.destination.tagName , PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status)
	}
	var evaluateSub = function(obj,result,rungid){
		var paper = PLCSpace.currentProgramModel.paper;
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(result == 1){
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
			//paper.text(obj.x,obj.y,a);
			updateValue("SUB-"+rungid+"-7-0",a);
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
			updateValueB("SUB-"+rungid+"-7-0",b);
		}
		}
		var c= parseFloat(a) - parseFloat(b);
		if(result == 0 && flagSub == 0)
					{
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
					}
			 else
			 {
			 	if(PLCSpace.PLCEditorSpace.flagRun == 1){
					 PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
				  }				
			   	  else {
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = c.toFixed(2);
						flagSub = 1;	 	
					 }
			}
		
			PLCSpace.scanCycle.showData(obj.destination.tagName , PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status)
	}
	var evaluateMul = function(obj,result,rungid){
		var paper = PLCSpace.currentProgramModel.paper;
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(result == 1){
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
			updateValue("MUL-"+rungid+"-7-0",a);
		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
			updateValueB("MUL-"+rungid+"-7-0",b);
		}
		}
		var c= a * b;
		if(result == 0 && flagMul == 0)
					{
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
					}
			 else
			 {
			 	if(PLCSpace.PLCEditorSpace.flagRun == 1){
					 PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
				  }				
			   	  else {
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = c.toFixed(2);
						flagMul = 1;	 	
					 }
			}
			
		PLCSpace.scanCycle.showData(obj.destination.tagName , PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status)
	}
	var evaluateDiv = function(obj,result,rungid){
		var paper = PLCSpace.currentProgramModel.paper;
		var a= parseFloat(obj.sourceA.status);
		var b= parseFloat(obj.sourceB.status);
		if(result == 1){
		if(a == -1){
			a = parseFloat(calculateStatus(obj.sourceA.tagName));
				updateValue("DIV-"+rungid+"-7-0",a);

		}
		if(b == -1){
			b = parseFloat(calculateStatus(obj.sourceB.tagName));
				updateValueB("DIV-"+rungid+"-7-0",b);

		}
		}
		var c= a / b;
		if(result == 0 && flagDiv == 0)
					{
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
					}
			 else
			 {
			 	if(PLCSpace.PLCEditorSpace.flagRun == 1){
					 PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = 0;
				  }				
			   	  else {
						PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status = c.toFixed(2);
						flagDiv = 1;	 	
					 }
			}
	
		PLCSpace.scanCycle.showData(obj.destination.tagName , PLCSpace.scanCycle.outputImageTable[obj.destination.tagName].status)
	}
	var evaluateCounter = function(obj,result){
		var acc = obj.acc;
		//prevAcc = acc;
		var preset = obj.preset;
		if(!!result){
			if(obj.prevStatus == 0){
			acc = acc+1;
			prevAcc = acc;
			console.log("accc "+prevAcc ) ;
			obj.acc= acc;
			if(acc<preset)
				outputImgTable[obj.dn.tagName].status = 0.0;				
			else if(acc == preset)
				outputImgTable[obj.dn.tagName].status = 1.0;		
			
			obj.prevStatus = 1;
			outputImgTable[obj.cu.tagName].status = 1.0;
			}
		}else{
			outputImgTable[obj.cu.tagName].status = 0.0;
			outputImgTable[obj.dn.tagName].status = 0.0;		
			obj.prevStatus=0;
		}		
		PLCSpace.scanCycle.showData(obj.cu.tagName , outputImgTable[obj.cu.tagName].status);
		PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
		if(PLCSpace.PLCEditorSpace.flagRun == 1){
			prevAcc = 0;
					PLCSpace.scanCycle.showData(obj.tagName+"_acc" , prevAcc);
		}
		else{
				PLCSpace.scanCycle.showData(obj.tagName+"_acc" , prevAcc);			
		}
		
		
	
	}
	var evaluateDownCounter = function(obj,result){
		var acc = obj.acc;
		var preset = obj.preset;
		if(result){
			if(obj.prevStatus == 1){
			acc = acc-1;;
			//console.log("accc "+acc ) ;
			obj.acc= acc;
			if(acc <= preset && acc !=0)
				outputImgTable[obj.dn.tagName].status = 1.0;				
			else if(acc == 0)
				outputImgTable[obj.dn.tagName].status = 0.0;		
			
			obj.prevStatus = 0;
			outputImgTable[obj.cu.tagName].status = 1.0;
			}
		}else{
			outputImgTable[obj.cu.tagName].status = 0.0;
			outputImgTable[obj.dn.tagName].status = 1.0;		
			obj.prevStatus=1;
		}		
		PLCSpace.scanCycle.showData(obj.cu.tagName , outputImgTable[obj.cu.tagName].status);
		PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
		PLCSpace.scanCycle.showData(obj.tagName+"_acc" , acc);
	}
	var evaluateCounterReset = function(obj,result){
		var tg = obj.output.tagName;
		
		if(result){
			var functionObj = PLCSpace.objectHolder.getExistingObject("CTU" , tg);
			if(functionObj != null || functionObj != undefined){
				switch(functionObj.type){
					case "CTU":
						PLCSpace.scanCycle.outputImageTable[functionObj.dn.tagName].status = 0.0;
						functionObj.acc = 0.0;
						PLCSpace.scanCycle.showData(functionObj.tagName+"_acc" , 0);
					break;
					case "CTD":
						PLCSpace.scanCycle.outputImageTable[functionObj.dn.tagName].status = 1.0;
						functionObj.acc = functionObj.preset;
						PLCSpace.scanCycle.showData(functionObj.tagName+"_acc" , functionObj.preset);
					break;
					case "RTO":
						PLCSpace.scanCycle.outputImageTable[functionObj.dn.tagName].status = 0.0;
						functionObj.acc = 0.0;
						PLCSpace.scanCycle.showData(functionObj.tagName+"_acc" , 0);
					break;
				
				}
								
			}
			
			PLCSpace.scanCycle.showData(functionObj.dn.tagName , outputImgTable[functionObj.dn.tagName].status);
			
			PLCSpace.scanCycle.outputImageTable[tg] = 1.0;
			PLCSpace.scanCycle.showData(tg , 1);
		}
		else{
			PLCSpace.scanCycle.showData(tg, 0);
		}
	}
	var evaluateTimerOn = function(obj,result){
		var acc = 0;
		var preset = parseInt(obj.preset);
		var timect = 0;
		var interval = 100;
		var setTimeoutvariable ;
		if(!!result && !PLCSpace.scanCycle.stop ) {
			if(obj.prevStatus == 0){
			PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status = 1.0; 
			PLCSpace.scanCycle.showData(obj.en.tagName , outputImgTable[obj.en.tagName].status);
			obj.prevStatus = 1;
			var autorefresh = function ()
				{
					if(timect < preset && 	PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status && !PLCSpace.scanCycle.stop) {
						timect = parseInt(timect)+ parseInt(interval);
						PLCSpace.scanCycle.outputImageTable[obj.acc]= timect;
						PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 1.0;
						PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
						PLCSpace.scanCycle.showData(obj.tagName+"_acc" , timect);
					} else {
						clearInterval(setTimeoutvariable);
						PLCSpace.scanCycle.outputImageTable[obj.acc]= timect;
						PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 0.0;
						PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = 1.0;
						PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
						PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
						PLCSpace.scanCycle.showData(obj.tagName+"_acc" , timect);
					}
					
				};
				
				setTimeoutvariable = setInterval(autorefresh, 100) ;
			}
		}else{
			clearInterval(setTimeoutvariable);
			obj.prevStatus = 0;
			PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 0.0;
			PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = 0.0;
			PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status = 0.0;
			PLCSpace.scanCycle.outputImageTable[obj.acc]= 0;
			PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
			PLCSpace.scanCycle.showData(obj.en.tagName , outputImgTable[obj.en.tagName].status);
			PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
			PLCSpace.scanCycle.showData(obj.tagName+"_acc" , 0);
		}		
	}
	
	var evaluateTimerOff = function(obj,result){
		var acc = 0;
		var preset = parseInt(obj.preset);
		var timect = 0;
		var interval = 100;
		var setTimeoutvariable ;
		if(!result && !PLCSpace.scanCycle.stop){
			if(obj.prevStatus == 1){
			PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status = 0.0; 
			PLCSpace.scanCycle.showData(obj.en.tagName , outputImgTable[obj.en.tagName].status);
			
			obj.prevStatus =0 ;
			var autorefresh = function ()
				{
					if(timect < preset && 	!PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status && !PLCSpace.scanCycle.stop) {
						timect = parseInt(timect)+ parseInt(interval);
						PLCSpace.scanCycle.outputImageTable[obj.acc]= timect;
						PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 1.0;
						PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = 1.0;
						PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
						PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
						PLCSpace.scanCycle.showData(obj.tagName+"_acc" , timect);
					} else {
						clearInterval(setTimeoutvariable);
						PLCSpace.scanCycle.outputImageTable[obj.acc]= timect;
						PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 0.0;
						PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = 0.0;
						PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
						PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
						PLCSpace.scanCycle.showData(obj.tagName+"_acc" , timect);
					}
					
				};
				
				setTimeoutvariable = setInterval(autorefresh, 100) ;
			}
		}
		else{
			clearInterval(setTimeoutvariable);
			obj.prevStatus = 1;
			PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 0.0;
			PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = 1.0;
			PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status = 1.0;
			PLCSpace.scanCycle.outputImageTable[obj.acc]= 0;
			PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
			PLCSpace.scanCycle.showData(obj.en.tagName , outputImgTable[obj.en.tagName].status);
			PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
			PLCSpace.scanCycle.showData(obj.tagName+"_acc" , 0);
		}		
		
	}
	var evaluateRTO = function(obj,result){
		 var acc = obj.acc;
		  var preset = parseInt(obj.preset);
		  var timect = obj.acc;
		  var interval = 100;
		  var setTimeoutvariable ;
		  if(!!result && !PLCSpace.scanCycle.stop ) {
		   if(obj.prevStatus == 0){
		   PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status = 1.0; 
		   PLCSpace.scanCycle.showData(obj.en.tagName , outputImgTable[obj.en.tagName].status);
		   obj.prevStatus = 1;
		   var autorefresh = function ()
		    {
		     if(timect < preset && !!PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status && !PLCSpace.scanCycle.stop) {
		      timect = parseInt(timect)+ parseInt(interval);
		      PLCSpace.scanCycle.outputImageTable["acc"]= timect;
		      PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 1.0;
		      PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
		      PLCSpace.scanCycle.showData(obj.tagName+"_acc" , timect);
		     } else {
		      clearInterval(setTimeoutvariable);
		      PLCSpace.scanCycle.outputImageTable["acc"]= (timect == preset)  ? 0 :  timect;
		      PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 0.0;
		      PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = (timect == preset) ?   1.0 : 0.0;
		      PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
		      PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
		      PLCSpace.scanCycle.showData(obj.tagName+"_acc" , timect);
		     }
		     
		    };
		    
		    setTimeoutvariable = setInterval(autorefresh, 100) ;
		    
		   }
		  }else{
		   clearInterval(setTimeoutvariable);
		   obj.prevStatus = 0;
		   PLCSpace.scanCycle.outputImageTable[obj.tt.tagName].status = 0.0;
		   PLCSpace.scanCycle.outputImageTable[obj.dn.tagName].status = 0.0;
		   PLCSpace.scanCycle.outputImageTable[obj.en.tagName].status = 0.0;
		   //PLCSpace.scanCycle.outputImageTable["acc"]= timect;
		  
		   if(PLCSpace.scanCycle.outputImageTable["acc"] != undefined){
		    obj.acc = PLCSpace.scanCycle.outputImageTable["acc"];
		   }
		   
		   
		   PLCSpace.scanCycle.showData(obj.tt.tagName , outputImgTable[obj.tt.tagName].status);
		   PLCSpace.scanCycle.showData(obj.en.tagName , outputImgTable[obj.en.tagName].status);
		   PLCSpace.scanCycle.showData(obj.dn.tagName , outputImgTable[obj.dn.tagName].status);
		   if(timect ==0 )
		    PLCSpace.scanCycle.showData(obj.tagName+"_acc" , 0);
		 
		  }
		
	}
	var evaluateLatch = function(obj,result,rungid){
		var tg = obj.output.tagName;
		 var unlatchObj = PLCSpace.objectHolder.getExistingObject("unlatch" , tg);
		 var latch = PLCSpace.scanCycle.outputImageTable[tg];
		 latch.preOutput = PLCSpace.scanCycle.outputImageTable[latch.tagName].status;
		if(result){			
			 latch.status = result?1.0:0.0;
			 obj.output.status = latch.status;
			 PLCSpace.scanCycle.outputImageTable[tg].status = latch.status;
			 obj.unlatchOutput =  PLCSpace.scanCycle.outputImageTable[tg].status;
			 (unlatchObj != undefined)?
			 unlatchObj.status =  latch.status : "";
		}		
		PLCSpace.scanCycle.showData(tg ,latch.status);
	}
	
	var evaluateUnLatch = function(obj,result){
		var tg = obj.output.tagName;
		var latchObj =  PLCSpace.objectHolder.getExistingObject("latch" , tg);
		if(result){
				 obj.output.status = 1.0;
				 latchObj.unlatchOutput = 0.0;
				 latchObj.output.status = 0.0;
				 PLCSpace.scanCycle.outputImageTable[latchObj.output.tagName].status = 0.0;
				 latchObj.preOutput = 0.0;
				 //console.log("unLatch : "+ latchObj.unlatchOutput);
			}
			PLCSpace.scanCycle.showData(tg ,  obj.output.status);
	}
	var evaluatePID = function(pidobj,result){
	   var output = 0;
	   var objk;
	   objk=PLCSpace.sarvaGlobal[pidobj.label];
	   // objk=pidobj;
        if(result) {
            var control = pidobj.control;
            var mode = pidobj.mode;
            if(mode == "auto"){
                
                
                objk=evaluatePIDnew(objk);
                output=objk.outVal;
            }
            else {
               output =(objk.Input);
            }
        }
        objk.output =  output;
        PLCSpace.sarvaGlobal[pidobj.label]=objk;
        PLCSpace.scanCycle.showData(objk.outputLbl , output);
        //outputImgTable['pid'].status = output;
	}
	//Excution for PID type
	var PIDtypeImplementation = function(pidobj) {
        var type = pidobj.type;

        var action = pidobj.action;
        var ep = ((pidobj.Input - pidobj.setPiont) / (pidobj.maxInput - pidobj.minInput)) ;
        var output ;
        pidobj.Ep = ep;
        if(type == "non-interacting") {//non interacting
            if(action == "direct") 
                output = ep * pidobj.kp + pidobj.ki * ep *(1/60)  + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;                
             else 
                output = (-ep) * pidobj.kp + pidobj.ki * ep *(1/60)  + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
               
            PIDTypeExecuteinloop(output, ep , type);
            return output.toFixed(2);
        } else {//interacting
            if(action == "direct") 
              output = ep * pidobj.kp + pidobj.ki * ep *(1/60)  + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
            else 
                output = (-ep) * pidobj.kp + pidobj.ki * ep *(1/60)  + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
                
            PIDTypeExecuteinloop(output, ep,  type);
            return output.toFixed(2)
        }
        //console.log(output)
    };
    var PIDTypeExecuteinloop = function(output, ep , type) {
        var Ep = ep;
        var t;
        if(output < 100){
            $("#pidoutput").val(output.toFixed(2));}
        if(output >= 100){
            $("#pidoutput").val(100);
            clearTimeout(t);}
        t = setTimeout(function() {
            Ep = Ep + pidobj.Time / 60;
            if(type = "non-interacting")
            output = Ep * pidobj.kp + pidobj.ki * Ep * 1/60 + pidobj.kd * Ep + pidobj.P0;
            else
             output = Ep * pidobj.kp + pidobj.kp + pidobj.ki * Ep  * 1/60 + pidobj.kp + pidobj.kd * Ep + pidobj.P0;
           
            output= parseFloat(output.toFixed(2));
            PIDTypeExecuteinloop(output, Ep , type);
        }, 1000);
    };
    
    //Excution for PD type
    var PDtypeImplementation = function(pidobj) {
        var type = pidobj.Type;
        var action = pidobj.Action;
        var ep = ((pidobj.Input - pidobj.setPiont) / (pidobj.maxInput - pidobj.minInput)) ;
        pidobj.Ep = ep;

        if(type == "non-interacting") {//non interacting
            
            if(action == "direct") 
                var output = ep * pidobj.kp + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
             else 
                var output = (-ep) * pidobj.kp + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
               
            PDTypeExecuteinloop(output, ep);
            return output;
        } else {//interacting
            
            if(action == "direct") 
                var output = ep * pidobj.kp + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
             else 
                var output = (-ep) * pidobj.kp + pidobj.kd * (ep + pidobj.Time/60) + pidobj.P0;
            PDTypeExecuteinloop(output, ep);
            return output;    
        }
    };
    var PDTypeExecuteinloop = function(output, ep , type) {
        var Ep = ep;
        var t;
        if(output < 100){
            $("#pidoutput").val(output.toFixed(2));}
        if(output >= 100){
            $("#pidoutput").val(100);
            clearTimeout(t);}
        t = setTimeout(function() {
            Ep = Ep + pidobj.Time / 60;
            if(type == "interacting")
                output = Ep * pidobj.kp + pidobj.kd * Ep * pidobj.kp + pidobj.P0;
            else
              output = Ep * pidobj.kp + pidobj.kd * Ep + pidobj.P0;
            output= parseFloat(output.toFixed(2));
            PDTypeExecuteinloop(output, Ep  ,type);
        }, 1000);
    };
    
	//Excution for PI type
	var PItypeImplementation = function(pidobj) {
        var type = pidobj.type;
        var action = pidobj.action;
        var ep = ((pidobj.Input - pidobj.setPiont) / (pidobj.maxInput - pidobj.minInput)) ;
        pidobj.Ep = ep;
        if(type == "non-interacting") {
            if(action == "direct") 
                var output = ep * pidobj.kp + pidobj.ki * ep * (1/60) + pidobj.P0;
              else 
                var output = (-ep) * pidobj.kp + pidobj.ki * ep * (1/60) + pidobj.P0;
            
            PITypeExecuteinloop(output, ep);
            return output.toFixed(2);
        } else {            
            if(action == "direct") 
                var output = ep * pidobj.kp + pidobj.kp * pidobj.ki * ep * (1/60) + pidobj.P0;
            else 
                var output = (-ep) * pidobj.kp + pidobj.kp * pidobj.ki * ep * (1/60) + pidobj.P0;
            PITypeExecuteinloop(output, ep);
            return output.toFixed(2);
        }
    };
    var PITypeExecuteinloop = function(output, ep) {
        var Ep = ep;
        var t;
        if(output < 100){
            $("#pidoutput").val(output.toFixed(2));}
        if(output >= 100){
            $("#pidoutput").val(100);
            clearTimeout(t);
            }
        t = setTimeout(function() {
            Ep = Ep + pidobj.Time / 60;
            if(type == "non-interacting")
                output = Ep * pidobj.kp + pidobj.ki * Ep * (1/60) + pidobj.P0;
            else
                output = Ep * pidobj.kp  + pidobj.kp * pidobj.ki  * Ep * (1/60) + pidobj.P0;
            
            output= parseFloat(output.toFixed(2));
            PITypeExecuteinloop(output, Ep);
        }, 1000);
    };

    //Excution for P type
    var pTypeImplementation = function(pidobj) {
        var action = pidobj.action;
        var ep = ((pidobj.Input - pidobj.setPiont) / (pidobj.maxInput - pidobj.minInput));
        pidobj.Ep = ep;
        var output;
        if(action == "direct") 
             output = ep * pidobj.kp + pidobj.P0;
         else 
             output = (-ep) * pidobj.kp + pidobj.P0;
        
        return output;
    };
    
   //////////////////////new pid
   
   var evaluatePIDnew = function(obj) {
	var ip = obj.Input;
	var sp = obj.setPiont;
	var ep = sp - ip;
	var outVal = 0;
	if(obj.mode == "auto") {//auto
		switch(obj.control) {
			case "p" :
				if(obj.action == "direct") {
					outVal = ep * parseFloat(obj.kp) + parseFloat(obj.P0);
				} else if(obj.action == "reverse") {
					outVal = (-ep) * parseFloat(obj.kp) + parseFloat(obj.P0);
				}
				break;
			//p ends
			case "pi" :
				if(obj.type == "parallel") {
					if(obj.action == "direct") {
						outVal = (ep * obj.kp) + (obj.ki * (obj.preE + ep)) + obj.intialControlOp + parseFloat(obj.P0);
						if(outVal < obj.minInput) {
							outVal = obj.minInput;
						} else if(outVal >= obj.maxInput) {
							outVal = obj.maxInput;
						}
						obj.intialControlOp = (obj.ki * (obj.preE + ep)) + obj.intialControlOp;

					} else if(obj.action == "reverse") {
						outVal = ((-ep) * obj.kp) - (obj.ki * (obj.preE + ep)) + obj.intialControlOp + parseFloat(obj.P0);
						if(outVal < obj.minInput) {
							outVal = obj.minInput;
						} else if(outVal >= obj.maxInput) {
							outVal = obj.maxInput;
						}
						obj.intialControlOp = obj.intialControlOp - (obj.ki * (obj.preE + ep));
					}
				}//parallel ends
				else if(obj.type == "non-intreracting") {
					if(obj.action == "direct") {
						outVal = (ep * obj.kp) + (obj.kp * obj.ki * (obj.preE + ep)) + obj.intialControlOp + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = ((obj.kp * obj.ki * (obj.preE + ep)) + obj.intialControlOp);
					} else if(obj.action == "reverse") {
						outVal = (-ep) * obj.kp - (obj.kp * obj.ki * (obj.preE + ep)) + obj.intialControlOp + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = (obj.intialControlOp - (obj.kp * obj.ki * (obj.preE + ep)));
					}

					//non-intreracting ends
				}
				break;
			//pi ends

			case "pd":
				// ///pd type
				if(obj.type == "parallel") {
					if(obj.action == "direct") {
						outVal = obj.kp * ep + (obj.kd / obj.Time) * (ep - obj.preE) + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = (outVal);
					} else {
						outVal = obj.kp * (-ep) - ((obj.kd / obj.Time) * ((ep) - obj.preE)) + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = (outVal);
					}
				}// pd parallel end

				else {// pd non interacting

					if(obj.action == "direct") {
						outVal = obj.kp * ep + (obj.kd / obj.Time) * obj.kp * (ep - obj.preE) + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = (outVal);
					} else {
						outVal = obj.kp * (-ep) - ((obj.kd / obj.Time) * obj.kp * ((ep) - obj.preE)) + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = (outVal);
					}

				}// //pd non interacting end
				break;
			//pd ends

			case "pid":

				// pid type
				if(obj.type == "parallel") {
					if(obj.action == "direct") {
						outVal = (ep * obj.kp) + (obj.ki * (obj.preE + ep)) + ((obj.kd / obj.Time) * (ep - obj.preE)) + obj.intialControlOp + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = ((obj.ki * (obj.preE + ep)) + obj.intialControlOp);
					} else {
						outVal = (-ep) * obj.kp - (obj.ki * (obj.preE + ep)) - ((obj.kd / obj.Time) * (ep - obj.preE)) + obj.intialControlOp + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = (obj.intialControlOp - (obj.ki * (obj.preE + ep)));
					}
				}// pid - parallel end

				else {// pid-Non interacting start

					if(obj.action = "direct") {
						outVal = (ep * obj.kp) + (obj.kp * obj.ki * (obj.preE + ep)) + ((obj.kd / obj.Time) * obj.kp * (ep - obj.preE)) + obj.intialControlOp + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
						obj.intialControlOp = ((obj.kp * obj.ki * (obj.preE + ep)) + obj.intialControlOp);
					} else {
						outVal = (-ep) * obj.kp - (obj.kp * obj.ki * (obj.preE + ep)) - ((obj.kd / obj.Time) * obj.kp * (ep - obj.preE)) + obj.intialControlOp + parseFloat(obj.P0);

						if(outVal < obj.minInput)
							outVal = obj.minInput;
						else if(outVal >= obj.maxInput)
							outVal = obj.maxInput;
							obj.intialControlOp = (obj.intialControlOp - (obj.kp * obj.ki * (obj.preE + ep)));
					}

				}// pid-Non interacting end

				// pid type end

				break;
			//pid ends

		}

	}//auto ends
	obj.outVal=outVal;
	obj.preE=ep;
	return obj;
}
 /////////////////////new pid end
	
	return {
		execute :execute
	}
})()