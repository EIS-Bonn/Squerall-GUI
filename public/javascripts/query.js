$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip()
	auto_suggest_predicate("#predicate")
	sessionStorage.clear();

	var i = 0
	var filtersAdd = false
	var prologMap = new Map()
	var predColorMap = new Map()
	var colors = ['FFC0CB', '98FB98', '66CDAA', 'F5DEB3', 'E0FFFF', 'E6E6FA', 'D3D3D3', 'FFF8DC	']


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
			var hasPredicate = ""		
			var getPredicates = new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				remote: {
					url: '/getPredicates',
					prepare: function (query, settings) {
						hasPredicate = '&has=' + encodeURIComponent($("#predicate").val());
						$(".predicate[placeholder]").not(this).each(function() { // the input copy the autosuggest plugin creates does not have this attribute, so we can filter with it (to avoid selecting the copy)
							if($(this).val() != query) 
								hasPredicate += '&has=' + encodeURIComponent($(this).val()) // don't send the values of the current .predicate input, it's just string, it doesn't exis in the mappings
						});
						settings.url += '?p=' + query;
						settings.url += hasPredicate;
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
						 '<td style="width: 50%;"><input type="text" class="form-control noborder object" placeholder="object" /></td></tr>'
			$("#triplesTable tr:last").after(triple)

			$("#predicatesGroupModal > modal-body > input").val("")
			auto_suggest_predicate(".predicate")
		}
	})

	$("#saveTriple").click(function () {
		var color = "" 
		var pred_obj = new Map()
		var addToQuery = ""
		var sub = $("#subject").val()
		var firstPred = $("#predicate").val().split(" (")
		var firstPredicate = firstPred[0]
		var predicateBits = firstPredicate.split(":")
		var shortNamesapce = predicateBits[0]
		var ns = firstPred[1]
		var namespace = ns.replace(")","")
		prologMap.set(shortNamesapce,namespace)
		var firstObj = $("#object").val()

		if (predColorMap.has(sub))
			color = predColorMap.get(sub)
		else {
			color = colors[Math.floor(Math.random() * colors.length)]
			predColorMap.set(sub,color)
		}
		
		pred_obj.set(firstPred,firstObj)

		var o = "<a href='#' class='predicatesGroup' data-pred='" + firstObj + "'>?" + firstObj
		addToQuery += "<div style='background-color: #" + color + "'>?" + sub + " " + firstPredicate + " " + o + "</a> .</div>"

		$(".predicate").not(".tt-hint").each(function () { // not .tt-hint avoid hidden duplicate input (from typeahead library)
			var pred = $(this).val().split(" (")
			var predicate = pred[0]
			var shortNamesapce1 = predicate.split(":")[0]
			var namespace1 = pred[1].replace(")","")
			var obj = $(this).closest('td').next().find('.object').val()
			pred_obj.set(pred,obj)
			valOrStar = obj.charAt(0)
			prologMap.set(shortNamesapce1,namespace1)
			
			var o = "<a href='#' class='predicatesGroup' data-pred='" + obj + "'>?" + obj
			addToQuery += "<div style='background-color: #" + color + "'>?" + sub + " " + predicate + " " + o + "</a> .</div>"
		})

		// Fill sessionSotorage with the i'th triple 
		var triple = {}
		triple.subject = sub
		triple.p_o = mapToJson(pred_obj)
		sessionStorage.setItem('triple_' + i, JSON.stringify(triple))

		// Check the content of the sessionstorage
		var po = jsonToMap(JSON.parse(sessionStorage.getItem('triple_' + i)).p_o)
		console.log(po)
		po.forEach(function (value, key, mapObj) {
			console.log(key.toString() + "=" + value.toString());  
		});
		
		i = i + 1
		$("#select, #where").show()
		
		$("#prolog").html("")
		for (var [key, value] of prologMap) {		
			var imprt = key + ": <" + value + ">"
			$("#prolog").append(imprt.replace(">","&gt;").replace("<","&lt;") + "<br />").show()
		}
		
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
