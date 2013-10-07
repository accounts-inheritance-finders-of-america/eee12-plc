
PLCSpace.utilView = (function() {	

var openFile = function(){
	
		PLCSpace.currentProgramModel.paper.clear();
		/*for(var p in PLCSpace.currentProgramModel)
   			 if(PLCSpace.currentProgramModel.hasOwnProperty(p))
        		PLCSpace.currentProgramModel[p] = '';*/
		var paper = PLCSpace.currentProgramModel.paper;
		////console.log(PLCSpace.currentProgramModel._collection)
		PLCSpace.currentProgramModel._startingPoint[1]=50;
		PLCSpace.currentProgramModel.eleset = "";
		PLCSpace.currentProgramModel.eleset = paper.set();
        PLCSpace.currentProgramModel.eleset.push(paper.path("M 80 0 l 0 12000 z"), //left Border
        paper.path("M 1015 0 l 0 12000 z"), // right border
        paper.path("M 80 20 l 832 0"), paper.path("M 947 20 l 68 0")).attr({
            stroke: '#73bc1e',
            'stroke-width': 2
        })
        PLCSpace.currentProgramModel.eleset.push(paper.text(930, 19, "--END--")).attr({
            'font-siz': 22,
            stroke: '#73bc1e'
        });
		var json = PLCSpace.PLCJson;
		////console.log(json.length)
		var prog_cnt = json.length;
		var rung_cnt;
		for(var i=0 ;i<prog_cnt;i++)
		{
			rung_cnt = json[i].rungs.length;
			var program = json[i];
			var y = 50;
			for(var j=0 ;j<rung_cnt;j++)
			{
				
				y = PLCSpace.currentProgramModel._startingPoint[1] ;
				var rung = program.rungs[j];
				rungId = rung.id ;
				var currentRung = drawRung(rungId);
				var rungelement_cnt = rung.elements.length;
				var rungloop_cnt = rung.loops.length;
				
				for(var m=0 ;m<rungelement_cnt;m++)
				{
					
					var element = rung.elements[m];
					eleID = element.attr.id;
					type = eleID.substring(0, 3);
					status = element.attr.status;
					var position = eleID.charAt(eleID.length-1);
					var data = {
						  	id : currentRung._id,
						  	blockOnRung : position,
							 coordinate : {
								x : 95 + (position * 115),
								y : y
							},
							parentObject : currentRung,
							label : element.attr.label
					  	}
					  	if(type == "OPN"){
					  		instructionId = 'openContact';
					  		instructionObject[instructionId](data,status)
					  	}
					  	else if(type == "CLS"){
					  		instructionId = 'closeContact';
					  		instructionObject[instructionId](data,status)
					  	}
					  	else if(type == "OUT"){
					  		instructionId = 'addOutput';
					  		instructionObject[instructionId](data)
					  	}else{
					  		
					  		var fbType = element.attr.attr.type;
					  		var obj = element.attr.attr.functionBlock;
							instructionObject[type](data,obj)
				}
					
					
				}//end of  elements on rung
				for(var k = 0;k < rungloop_cnt ;k++)
				{
					var loop = rung.loops[k];
					
					var data = {
						coordinate : {
							x : 80 + (loop.attr.loopPointOnRung * 115),
							y : y
						},
						id : rungId,
						isLoopPlaced : false ,
						parentObject : currentRung,
						pointOnRung : loop.attr.loopPointOnRung,
						lastYCoordinate : y+50

					}
					
					getloop(data,loop,y,currentRung);
					
					
					
				}//end of loops on rung
				
			}
		}
		return rung_cnt;
	
		
	}
	var getloop = function(data,loop,y,parentObject)
	{
		
		var currentLoop = drawLoop(data);
		var endPositionOfLoop = loop.attr.loopPointOnRung;
		var loopelement_cnt = loop.elements.length;
		loopId = loop.id ;
		for(var l=0 ;l < loopelement_cnt;l++)
		{
						
			var element = loop.elements[l];
			eleID = element.attr.id;
			type = eleID.substring(0, 3);
			status = element.attr.status;
			var position = eleID.charAt(eleID.length-1);
			if(endPositionOfLoop - position < 1)
			{
				for(var n =0 ;n <= (position-endPositionOfLoop);n++){
					expandLoop(currentLoop,parentObject);
								
					}
				endPositionOfLoop += n;
			}
			var data = {
					id : loop.id,
					blockOnRung : position,
					coordinate : {
								x : 95 + (position * 115),
								y : y + 50
					},
							parentObject : currentLoop,
							label : element.attr.label
			}
					  	
			if(type == "OPN"){
					  instructionId = 'openContact';
					  instructionObject[instructionId](data,status)
				}
			else if(type == "CLS"){
					  	instructionId = 'closeContact';
					  	instructionObject[instructionId](data,status)
				}
			else if(type == "OUT"){
					  	instructionId = 'addOutput';
					  	instructionObject[instructionId](data)
				}
				
						
		}//end of elements on loop
		if(loop.loops.length > 0)
		{
			y = y+50;
			var childloop_cnt = loop.loops.length;
			for(var i = 0;i < childloop_cnt;i++)
			{
				var childloop = loop.loops[i];	
				var data = {
						coordinate : {
							x : 80 + (childloop.attr.loopPointOnRung * 115),
							y : y
						},
						id : loopId,
						isLoopPlaced : false ,
						parentObject : currentLoop,
						pointOnRung : childloop.attr.loopPointOnRung,
						lastYCoordinate :y+50
					}
					getloop(data,childloop,y,currentLoop);	
			}
				
		}
		
	
		
	} 

	var undo = function()
	{
		
		var obj = PLCSpace.currentProgramModel.undoStack.pop();
		if(obj == undefined){return 0}
		PLCSpace.currentProgramModel.redoStack.push(obj)
		if(obj.type == 'rung')
		{
			PLCSpace.currentProgramModel.globalEleSetObject.pop();
			obj.lastY = obj._eleSet[0].matrix.y(obj.coordinate.x,obj.coordinate.y);
			PLCSpace.currentProgramModel._startingPoint[1] -= 150;
			PLCSpace.currentProgramModel._rungid--;
			transformRung(0, (obj.lastY - 75), PLCSpace.currentProgramModel.eleset, 2);
			obj._eleSet.remove();
		}
		else if(obj.type == 'loop')
		{
			var id = obj._id.charAt(4)
			id = parseInt(id);
			PLCSpace.currentProgramModel.globalEleSetObject[id].uiEleArray.pop();
			obj._eleSet.remove();
			if(!!obj._parentObject.loopCount){obj._parentObject.loopCount--}
			obj._parentObject.loopPointArray[obj._loopPointOnRung].right = null;
		}
		else if(obj.type == 'contact')
		{
			obj._eleSet.remove();
			if(!!obj._parentObject.contactCount){obj._parentObject.contactCount--}
		}
		else if(obj.type == 'FBlock')
		{
			obj._eleSet.remove();
			
		}
	
	}
	var transformRung = function(x, y, list, index) {
		
		if (typeof index == 'undefined') {
			list.transform("t " + x + " " + y);
		} else {
			for ( var i = index; i < list.length; i++)
				list[i].transform("t " + x + " " + y);
		}
	
	}
var redo = function(){

		if(PLCSpace.currentProgramModel.redoStack.length ==0){return 0}
		var obj = PLCSpace.currentProgramModel.redoStack.pop();
		
		if(obj.type == 'rung')
		{
			PLCSpace.currentProgramModel._startingPoint[1] = obj.lastY;
			PLCSpace.currentProgramModel._rungid++;
			drawRung(obj._id);
		}
		else if(obj.type == 'loop')
		{
			 var data = {
                    id: obj._parentObject._id,
                    pointOnRung: obj._loopPointOnRung,
                    coordinate: {
                        x:	obj.coordinate.x,
                        y: 	obj.coordinate.y
                    },
                    parentObject: obj._parentObject,
                    isLoopPlaced : false,
                    lastYCoordinate: obj._parentObject.lastYCordinate
                }
			drawLoop(data)
		}
		else if(obj.type == 'contact')
		{
			type = obj._id.substring(0, 3);
			var data = { 
					id : obj._parentObject._id,
					blockOnRung : obj.position,
					coordinate : {
						x : obj.attr.x,
						y : obj.attr.y
					},
					parentObject : obj._parentObject,
					
				};
			if(type == "OPN"){
					instructionId = 'openContact';
					instructionObject[instructionId](data);
					obj._parentObject.contactCount++;
			}
			else if(type == "CLS"){
					instructionId = 'closeContact';
					instructionObject[instructionId](data);
					obj._parentObject.contactCount++;
			}
			else if(type == "OUT"){
					instructionId = 'addOutput';
					instructionObject[instructionId](data);
			}
			else{
				instructionObject[type](data);
			}
		}
		else if(obj.type == "FBlock"){
			type = obj._id.substring(0, 3);
			var data = { 
					id : obj._parentObject._id,
					blockOnRung : obj.position,
					coordinate : {
						x : obj._parentObject.coordinate.x+15,
						y : obj._parentObject.coordinate.y
					},
					parentObject : obj._parentObject,
					
				};
				if(instructionType(type)== 'OUTPUT'){data.coordinate.x += 805} 
				
				instructionObject[type](data,obj.f)
				
		}
		
	
	
}
	return{		
		undo : undo,
		openFile : openFile,
		redo : redo
	}
	})();