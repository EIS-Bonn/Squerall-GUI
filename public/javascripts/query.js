$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip()
	auto_suggest_predicate("#predicate")
	sessionStorage.clear();

	var i = 0
	var filtersAdd = false

	/* auto-suggest: predicates */
	function auto_suggest_predicate(selector) {		
		if(selector == "#predicate") {
			//alert("#pred")
			var getPredicates = new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				remote: {
					url: '/getPredicates?p=%p',
					wildcard: '%p',
					transform: function (results) {
						// Map the remote source JSON array to a JavaScript object array
						return $.map(results, function (res) {
							return {
								value: res
							}
						})
					}
				}
			});
		} else if(selector == ".predicate") {			
			var previousPredicate = $("#predicate").val()
			//alert(".pred " + previousPredicate)
			console.log("previousPredicate " + previousPredicate)
			var getPredicates = new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				remote: {
					url: '/getPredicates',
					//wildcard: '%p',
					prepare: function (query, settings) {
						//settings.type = "POST";
						//settings.contentType = "application/json; charset=UTF-8";
						settings.url += '?p=' + query;
						settings.url += '&has=' + encodeURIComponent($("#predicate").val());
						return settings;
					},
					transform: function (results) {
						// Map the remote source JSON array to a JavaScript object array
						return $.map(results, function (res) {
							return {
								value: res
							};
						});
					}
				}				
			});
		}

		$(selector).typeahead(null, {
			name: 'predicates',
			display: 'value',
			source: getPredicates,
			templates: {
				empty: [
				  '<div class="empty-message">',
					'unable to find any matching predicates',
				  '</div>'
				].join('\n'),
				suggestion: function (data) {
					return '<p><strong>' + data.value + '</strong></p>'
				}
			},
			limit: 10
		})

		/*$('#predicate').bind('typeahead:select', function(ev, suggestion) {
			$(this).val("ddd")
		});*/
	}

	$(document).on("click", ".predicatesGroup", function () {
		$("#predicatesGroupModal").modal('toggle')
		var predVar = $(this).data("pred")
		if(predVar != "") {
			$("#subject").val(predVar)	
		}
	})

	$("#addSelect").click(function () {
		var selectString = ""
		$.each(sessionStorage, function(key, value) {
			var item_value = JSON.parse(value)
		  	var sub = item_value.subject
			var pred_obj = item_value.p_o
			var po = jsonToMap(pred_obj)
			
			selectString += "<label><input type='checkbox' class='var' value='?" + sub + "' /> ?" + sub + "</label></br>"
			po.forEach(function (value, key, mapObj) {
				var pred = key.toString()
				var obj = value.toString()
				//if(obj.charAt(0) == "?")
					selectString += "<label><input type='checkbox' class='var' value='" + obj + "' /> ?" + obj + "</label></br>"
			})
		})

		$("#selectableVars").html(selectString)
		$("#selectModal").modal('toggle')
	})

	$("#addFilters").click(function () {
		var filters = ""
		$.each(sessionStorage, function(key, value) {
			var item_value = JSON.parse(value) // {"subject":"o","p_o":"[[\"http://purl.org/ontology/mo/producer\",\"p\"]]"}
		  	var sub = item_value.subject
			var pred_obj = item_value.p_o
			var po = jsonToMap(pred_obj)			

			//filters += "<span>?" + sub + " " + options + " <input type='text' class='form-control noborder' /></span><br/>" TODO: develop filtering on subjects
			po.forEach(function (value, key, mapObj) {				
				var pred = key.toString()
				var obj = value.toString()
				var options = "<select id='" + obj + "' class='select_filter'><option>=</option><option>!=</option><option>&lt;</option><option>&gt;</option><option>&le;</option><option>&ge;</option><option>RegEx</select></br>"
				//if(obj.charAt(0) == "?")
					filters += "<span>?" + obj + " " + options + " <input type='text' class='form-control noborder filter-vals' id='" + obj + "-filterVar' /></span><br/>"
			})
		})

		$("#filters").html(filters)
		$("#filtersModal").modal('toggle')
	})

	$("#addTransform").click(function () {
		var transformations = ""
		$.each(sessionStorage, function(key, value) {
			var item_value = JSON.parse(value)
		  	var sub = item_value.subject
			var pred_obj = item_value.p_o
			var po = jsonToMap(pred_obj)

			po.forEach(function (value, key, mapObj) {
				var pred = key.toString()
				var obj = value.toString()
				//if(obj.charAt(0) == "?")
					transformations += "<span>?" + sub + "?" + obj + " <input type='text' class='form-control noborder transf' data-join='?" + sub + "?" + obj + "' /></span><br/>"
			})
		})

		$("#transformations").html(transformations)
		$("#transformModal").modal('toggle')
	})

	$("#toggleSubject").change(function () {
		$(".subject").toggle()
		$("#subjectVar").toggle()
	})

	$("#saveSelect").click(function () {
		var selectedVar = ""
		$('.var:checked').each(function() {
			selectedVar += "?" + $(this).val() + " "
		})
		
		$("#selected-vars").html(selectedVar.substring(1))
		$("#selectModal").modal('toggle')
	})

	$("#saveFilters").click(function () {
		var filters = ""
		$('.select_filter').each(function() {
			var selected_filter = $(this).find(":selected").text()
			var id = $(this).attr("id")
			var filterVal = $("#" + id + "-filterVar").val()
			if(filterVal != "")
				filters += " . ?" + id + " " + selected_filter + " " + filterVal
		})

		$("#filter").show()
		
		if(!filtersAdd) {
			$("#filter-conditions").append(filters.substring(3))
			filtersAdd = true		
		} else
			$("#filter-conditions").append(filters)
		$("#filtersModal").modal('toggle')
	})

	$("#saveTransform").click(function () {
		var transformations = ""
		$('.transf').each(function() {
			var join = $(this).data("join")
			transformations += " . " + join + $(this).val()
		})

		$("#transform").show()
		$("#transforms").html(transformations.substring(3))
		$("#transformModal").modal('toggle')
	})

	$("body").keyup(function(e) {
		//var code = e.keyCode || e.which;
		if (e.keyCode == 13 && e.shiftKey) { // 2 shift & 13 enter 
			var triple = '<tr class="pred_obj_tr addedTriple"><td style="width: 50%;"><input type="text" data-take="true" class="form-control noborder predicate" placeholder="predicate" /></td>' +
						 '<td style="width: 50%;"><input type="text" class="form-control noborder object" placeholder="object (Literal or Join variable)" /></td></tr>'
			$("#triplesTable tr:last").after(triple)

			$("#predicatesGroupModal > modal-body > input").val("")
			auto_suggest_predicate(".predicate")
		}
	})

	$("#saveTriple").click(function () {
		
		var pred_obj = new Map()
		var addToQuery = ""
		
		var sub = $("#subject").val()		
	
		var firstPred = $("#predicate").val()
		var firstObj = $("#object").val()
		pred_obj.set(firstPred,firstObj)

		//var valOrStar = firstObj.charAt(0)
		//if(valOrStar != "?") 
		//	var o = firstObj 
		//else 
			var o = "<a href='#' class='predicatesGroup' data-pred='" + firstObj + "'>?" + firstObj
		addToQuery += "<br>?" + sub + " " + firstPred + " " + o + "</a> ."

		$(".predicate").not(".tt-hint").each(function () { // not .tt-hint avoid hidden duplicate input (from typeahead library)
			var pred = $(this).val()
			var obj = $(this).closest('td').next().find('.object').val()
			pred_obj.set(pred,obj)
			valOrStar = obj.charAt(0)
			//if(valOrStar == "\"") 
			//	var o = obj 
			//else 
				var o = "<a href='#' class='predicatesGroup' data-pred='" + obj + "'>?" + obj
			addToQuery += "<br>?" + sub + " " + pred + " " + o + "</a> ."
		})

		// Fill sessionSotorage with the i'th triple 
		var triple = {}
		triple.subject = sub
		triple.p_o = mapToJson(pred_obj)
		sessionStorage.setItem('triple_' + i, JSON.stringify(triple))

		// Ceck the content of the sessionstorage
		var po = jsonToMap(JSON.parse(sessionStorage.getItem('triple_' + i)).p_o)
		console.log(po)
		po.forEach(function (value, key, mapObj) {  
			console.log(key.toString() + "=" + value.toString());  
		});
		
		i = i + 1
		$("#select, #where").show()
		$("#triple-patterns").append(addToQuery)		
		$(".addedTriple").remove()
		$("#subject, #predicate, #object").val("")
		$("#predicatesGroupModal").modal('toggle')
	})

	function mapToJson(map) {
		return JSON.stringify([...map])
	}
	
	function jsonToMap(jsonStr) {
		return new Map(JSON.parse(jsonStr))
	}
})
