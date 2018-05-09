// JavaScript for Phone Application Demo Program
// Jim Skon, Kenyon College, 2017
var operation;	// operation
var selectid;
var recIndex

var rows;
// Get results back from the server
$(document).ready(function () {
        operation = "Last";
	$('.editdata').hide();
	$("#search-btn").click(getMatches);
	$("#add-btn").click(addEntry);

	$("#clear").click(clearResults);

	$(".dropdown-menu li a").click(function(){
		$(this).parents(".btn-group").find('.selection').text($(this).text());
		operation=$(this).text().split(" ").pop();  // Get last word (Last, First, Type, New)
		//console.log("pick!"+operation);
		changeOperation(operation);
	});
});

function processReply(message) {
    //message = JSON.parse(message);
    if (message.operation == 'rows') {
	processResults(message.rows);
    }
    if (message.operation == 'Add') {
  	$('#modalMessage').text($('#addfirst').val()+" "+$('#addlast').val()+ ": "+message.Status);
  	$('#modalTitle').text("Record Add");
  	$('#addchangemodal').modal('show');
  	$('#addfirst').val("");
  	$('#addlast').val("");
  	$('#addphone').val("");
  	$('#addtype').val("");
    }
    if (message.operation == 'update') {
  	$('#modalMessage').text($('#editfirst').val()+" "+$('#editlast').val()+ ": "+message.Status);
  	$('#modalTitle').text("Record Change");
  	$('#addchangemodal').modal('show');
    }
    if (message.operation == 'delete') {
  	$('#searchresults').text("Deleted: "+rows[recIndex].First+" "+rows[recIndex].Last);
    }
}


changeOperation(operation);

function changeOperation(operation){
	if(operation=="New"){
	$('#addmessage').val("");
	$('.inputdata').show();
	$('.searchbox').hide();
	$('.results').hide();
	$('.editdata').hide();}
	else{
	$('.editdata').hide();
	$('.inputdata').hide();
	$('.results').show();
	$('.searchbox').show();
	}	 
}

// Build output table from comma delimited list
function buildTable(rows) {
	if (rows.length < 1) {
		return "<h3>Nothing Found</h3>";
	} else {
	var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>First</th><th>Last</th><th>Phone</th><th>Type</th><th>Action</th><tr>';

	for (var i=0;i<rows.length;i++) {
		console.log("row:"+JSON.stringify(rows[i]));
		result += "<tr><td class='first'>"+rows[i].First+"</td><td class='last'>"+rows[i].Last+"</td><td class='phone'>"+rows[i].Phone+"</td><td class='type'>"+rows[i].Type+"</td>";
		result += "<td><button type='button' ID='"+rows[i].RecNum+"' class='btn btn-primary btn-sm edit'>Edit</button> ";
		result += "<button type='button' ID='"+rows[i].RecNum+"' Index='"+i+"' class='btn btn-primary btn-sm delete'>Delete</button></td></tr>";
	}
	result += "</table>";
	
	return result;
	}
}

function processEdit(){
	$('#searchresults').empty();
	$('.editdata').show();
	$("#edit-btn").click(updateEntry);
	//console.log("Edit Record: " + $(this).attr('ID'));
	var row=$(this).parents("tr");
	//console.log("First name of record: "+ $(row).find('.first').text());
	selectid=$(this).attr('ID');

	$('#editfirst').val( $(row).find('.first').text());
	$('#editlast').val( $(row).find('.last').text());
	$('#editphone').val( $(row).find('.phone').text());
	$('#edittype').val( $(row).find('.type').text());
}

function updateEntry(){
	//console.log("Edit: Firstname:" + $('#editfirst').val() + "ID:" + selectid);
	$('#searchresults').empty();
    $.ajax({
	type: "get",
	url: "/message",
	data: {
    	    operation: "Update",
    	    First: $('#editfirst').val(),
    	    Last: $('#editlast').val(),
    	    Phone: $('#editphone').val(),
    	    Type: $('#edittype').val(),
    	    RecNum: selectid
  	},
	success: processReply,
	error: function(jqXHR, textStatus, err) {
	    alert('text status '+textStatus+', err '+err)
	}
    });	
}

function DeleteConfirm() {
	selectid=$(this).attr('ID');
	recIndex=$(this).attr('index');
	$('#deleteMessage').text("Delete: "+rows[recIndex].First+" "+rows[recIndex].Last+"?");
	$('#deleteconfirm').modal('show');
	$('.completeDelete').click(processDelete);
}

function processDelete(){
	var id=$(this).attr('ID');
    $.ajax({
	type: "get",
	url: "/message",
	data: {
    	    operation: "Delete",
    	    RecNum: selectid
  	},
	success: processReply,
	error: function(jqXHR, textStatus, err) {
	    alert('text status '+textStatus+', err '+err)
	}
    });	
}

function processResults(results) {
	$('#editmessage').empty();
	$('#addmessage').empty();
	//console.log("Results:"+results);
	$('#searchresults').empty();
	$('#searchresults').append(buildTable(results));
	rows=results;  // Save everything for delete
	$(".edit").click(processEdit);
	$(".delete").click(DeleteConfirm);
	
}

function clearResults() {
	$('#searchresults').empty();
}

function getMatches(){
    console.log("Search!");
    $('.editdata').hide();
	var search = $('#search').val();
	$('#searchresults').empty();
    $.ajax({
	type: "get",
	url: "/message",
	data: {
    	    operation: operation,
    	    searchText: search
  	},
	success: processReply,
	error: function(jqXHR, textStatus, err) {
	    alert('text status '+textStatus+', err '+err)
	}
    });	
}

function addEntry(){
	$('#searchresults').empty();
	//console.log("Add:"+$('#addlast').val());
    $.ajax({
	type: "get",
	url: "/message",
	data: {
    	    operation: "New",
    	    First: $('#addfirst').val(),
    	    Last: $('#addlast').val(),
    	    Phone: $('#addphone').val(),
    	    Type: $('#addtype').val()
  	},
	success: processReply,
	error: function(jqXHR, textStatus, err) {
	    alert('text status '+textStatus+', err '+err)
	}
    });	
}
	

	
