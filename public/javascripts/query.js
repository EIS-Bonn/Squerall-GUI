$(document).ready(function () {
	$('[data-toggle="tooltip"]').tooltip()
	auto_suggest_predicate("#predicate")
	auto_suggest_class("#clss")
	sessionStorage.clear();

	var i = 0
	var filtersAdd = false
	var prologMap = new Map()
	var predColorMap = new Map()
	var colors = ['FFC0CB', '98FB98', '66CDAA', 'F5DEB3', 'E0FFFF', 'E6E6FA', 'D3D3D3', 'FFF8DC']
	var distinct_added = false
	var varsFromSelect = []

	/* auto-suggest: predicates */
	function auto_suggest_predicate(selector) {
		if(selector == "#predicate") {
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
			})
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
			})
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

	/* auto-suggest: class */
	function auto_suggest_class() {
		var getClasses = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: '/getClasses?c=%c',
				wildcard: '%c',
				transform: function (results) {
					// Map the remote source JSON array to a JavaScript object array
					return $.map(results, function (res) {
						return {
							value: res
						}
					})
				}
			}
		})
		

		$("#clss").typeahead(null, {
			name: 'classes',
			display: 'value',
			source: getClasses,
			templates: {
				empty: [
				  '<div class="empty-message">',
					'unable to find any matching classes',
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

	$("#saveTriple").click(function () {
		var color = "" 
		var pred_obj = new Map()
		var addToQuery = ""
		var sub = $("#subject").val()
		var getClss = $("#clss").val().split(" (")
		var clss = getClss[0]		
		var clssBits = clss.split(":")
		var shortNamesapceClss = clssBits[0]
		var clssNs = getClss[1]
		var clssNamespace = clssNs.replace(")","")
		prologMap.set(shortNamesapceClss,clssNamespace)

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
		
		pred_obj.set(firstPredicate,firstObj)

		addToQuery += "<div style='background-color: #" + color + "'>?" + sub + " a " + clss + "</a> . </div>"
		var o = "<a href='#' class='predicatesGroup' data-pred='" + firstObj + "'>?" + firstObj
		addToQuery += "<div style='background-color: #" + color + "'>?" + sub + " " + firstPredicate + " " + o + "</a> . </div>"

		$(".predicate").not(".tt-hint").each(function () { // not .tt-hint avoid hidden duplicate input (from typeahead library)
			var pred = $(this).val().split(" (")
			var predicate = pred[0]
			var shortNamesapce1 = predicate.split(":")[0]			
			var obj = $(this).closest('td').next().find('.object').val()
			pred_obj.set(predicate,obj)
			valOrStar = obj.charAt(0)

			var namespace1 = pred[1].replace(")","")
			prologMap.set(shortNamesapce1,namespace1) 
			
			var o = "<a href='#' class='predicatesGroup' data-pred='" + obj + "'>?" + obj			
			addToQuery += "<div style='background-color: #" + color + "'>?" + sub + " " + predicate + " " + o + "</a> . </div>"
		})

		// Fill sessionSotorage with the i'th triple 
		var triple = {}
		triple.subject = sub
		triple.p_o = mapToJson(pred_obj)
		sessionStorage.setItem('triple_' + i, JSON.stringify(triple))

		// Check the content of the sessionstorage
		var po = jsonToMap(JSON.parse(sessionStorage.getItem('triple_' + i)).p_o)
		po.forEach(function (value, key, mapObj) {
			console.log(key.toString() + "=" + value.toString())
		});
		
		i = i + 1
		$("#select, #where").show()
		
		$("#prolog").html("")
		for (var [key, value] of prologMap) {		
			var imprt = key + ": <" + value + ">"
			$("#prolog").append("PREFIX " + imprt.replace(">","&gt;").replace("<","&lt;") + "<br />").show()
		}
		
		$("#triple-patterns").append(addToQuery)		
		$(".addedTriple").remove()
		$("#subject, #predicate, #object, #clss").val("")
		$("#predicatesGroupModal").modal('toggle')
		$("#addSelect").removeClass("disabled")
		$("#addFilters").removeClass("disabled")
		$("#addOrder").removeClass("disabled")
		$("#addAggregations").removeClass("disabled")
		$("#addTransform").removeClass("disabled")
		$("#addLimit").removeClass("disabled")
		$("#downloadQuery").removeClass("disabled")
		$("#deleteQuery").removeClass("disabled")		
	})

	$("#addSelect").click(function () {
		if (sessionStorage.length > 0) {
			var selectString = ""
			selectString += "<label><input type='checkbox' class='var' id='distinct' value='' /> DISTINCT </label></br>"
			for (var i=0; i < sessionStorage.length; i++) {
				var key = sessionStorage.key(i)
				var value = sessionStorage.getItem(key)
				var item_value = JSON.parse(value)
				var sub = item_value.subject
				var pred_obj = item_value.p_o
				var po = jsonToMap(pred_obj)				
				selectString += "<label><input type='checkbox' class='var' value='" + sub + "' /> ?" + sub + "</label></br>"
				po.forEach(function (value, key, mapObj) {
					var pred = key.toString()
					var obj = value.toString()
					selectString += "<label><input type='checkbox' class='var' value='" + obj + "' /> ?" + obj + "</label></br>"
				})			
			}

			$("#selectableVars").html(selectString)
			$("#selectModal").modal('toggle')
			$("#selected-vars").html("")
		}
	})

	$("#saveSelect").click(function () {
		var selectedVar = ""
		$('.var:checked').each(function() {
			var ths = $(this).val()
			selectedVar += "?" + ths + " "
			if (!varsFromSelect.includes(ths)) varsFromSelect.push(ths)
		})
		
		$("#selected-vars").html(selectedVar)
		
		if ($("#distinct").is(":checked") && !distinct_added) {
			$("#selected-vars").prepend("DISTINCT ")
			distinct_added = true
		}

		$("#selectModal").modal('toggle')
	})

	$("#addFilters").click(function () {
		if (sessionStorage.length > 0) {
			var filters = ""
			for (var i = 0; i < sessionStorage.length; i++) {
				var key = sessionStorage.key(i)
				var value = sessionStorage.getItem(key)
				var item_value = JSON.parse(value) // {"subject":"o","p_o":"[["http://purl.org/ontology/mo/producer","p"]]"}
				var pred_obj = item_value.p_o
				var po = jsonToMap(pred_obj)			

				po.forEach(function (value, key, mapObj) {				
					var obj = value.toString()
					var options = "<select id='" + obj + "' class='select_filter'> \
					<option>=</option>\
					<option>!=</option>\
					<option>&lt;</option>\
					<option>&gt;</option>\
					<option>&le;</option>\
					<option>&ge;</option>\
					<option>RegEx</select></br>"
					filters += "<span>?" + obj + " " + options + " <input type='text' class='form-control noborder filter-vals' id='" + obj + "-filterVar' /></span><br/>"
				})
			}

			$("#filters").html(filters)
			$("#filtersModal").modal('toggle')
		}
	})

	$("#saveFilters").click(function () {		
		var filters = ""
		$('.select_filter').each(function() {
			var selected_filter = $(this).find(":selected").text()
			var pred = $(this).attr("id")
			var filterVal = $("#" + pred + "-filterVar").val().trim()
			if (filterVal != "")
				filters += " && ?" + pred + " " + selected_filter + " " + filterVal
		})

		$("#filter").show()
		
		if (!filtersAdd) {
			$("#filter-conditions").append(filters.substring(3))
			filtersAdd = true		
		} else
			$("#filter-conditions").append(filters)
		$("#filtersModal").modal('toggle')
		
	})

	$("#addAggregations").click(function () {
		if (sessionStorage.length > 0) {
			var aggs = ""
			for (var i=0; i < sessionStorage.length; i++) {
				var key = sessionStorage.key(i)
				var value = sessionStorage.getItem(key)
				var item_value = JSON.parse(value) // {"subject":"o","p_o":"[["http://purl.org/ontology/mo/producer","p"]]"}
				var pred_obj = item_value.p_o
				var po = jsonToMap(pred_obj)
				
				po.forEach(function (value, key, mapObj) {
					var obj = value.toString()
					aggs += "<div style='border-bottom: solid 1px #d7dadd; padding: 5px;'>"
					aggs += "<input type='checkbox' class='var-agg' value='" + obj + "-tic' />"
					options = "<select id='" + obj + "-aggFnc'><option>MAX</option><option>MIN</option><option>SUM</option><option>COUNT</option><option>AVG</option></select>"
					aggs += "<span>" + options + " (?" + obj + ")</span><br/>"
					aggs += "GROUP BY "
					aggs += "<select id='" + obj + "-aggVar'>"
					po.forEach(function (value, key, mapObj) {			
						var obj = value.toString()
						aggs += "<option id='" + obj + "-aggVar'>?" + obj + "</option>"
					})
					aggs += "</select>"	
					aggs += "</div>"
				})			
			}

			$("#aggs").html(aggs)
			$("#aggregationsModal").modal('toggle')
			$("#agg-fnc").html("")
			$("#agg-vars").html("")
		}
	})

	$("#saveAggregations").click(function () {
		var varToAgg = "",  aggFnc = ""		
		$('.var-agg:checked').each(function() {
			var ths = $(this).val()
			var obj = ths.split("-")[0]
			
			var selectedAggFnc = $("select#" + obj + "-aggFnc option:selected").val()
			aggFnc += selectedAggFnc + "(?" + obj + ") "
			
			var selectedAggVar = $("select#" + obj + "-aggVar option:selected").val()
			if (!varToAgg.includes(selectedAggVar)) {
				varToAgg = varToAgg + " " + selectedAggVar + " "
				//if (!varsFromSelect.includes(selectedAggVar.substring(1))) 
				//	varsFromSelect.push(selectedAggVar.substring(1))
			}
		})

		$("#agg-fnc").html(" " + aggFnc)
		$("#agg-vars").html("GROUP BY " + varToAgg)
		//$("#selected-vars").html("?" + varsFromSelect.join(" ?"))
		$("#aggregationsModal").modal('toggle')
	})

	$("#addTransform").click(function () {
		if (sessionStorage.length > 0) {
			var transformations = ""
			for (var i=0; i < sessionStorage.length; i++){
				var key = sessionStorage.key(i)
				var value = sessionStorage.getItem(key)
				var item_value = JSON.parse(value)
				var sub = item_value.subject
				var pred_obj = item_value.p_o
				var po = jsonToMap(pred_obj)

				po.forEach(function (value, key, mapObj) {
					var pred = key.toString()
					var obj = value.toString()
					transformations += "<span>?" + sub + "?" + obj + " <input type='text' class='form-control noborder transf' data-join='?" + sub + "?" + obj + "' /></span><br/>"
				})
			}

			$("#transformations").html(transformations)
			$("#transformModal").modal('toggle')
		}
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

	$("#addOrder").click(function () {
		var preds = ""
		for (var i=0; i < sessionStorage.length; i++) {
			var key = sessionStorage.key(i)
			var value = sessionStorage.getItem(key)
			var item_value = JSON.parse(value) // {"subject":"o","p_o":"[["http://purl.org/ontology/mo/producer","p"]]"}
			var pred_obj = item_value.p_o
			var po = jsonToMap(pred_obj)			

			po.forEach(function (value, key, mapObj) {				
				var obj = value.toString()
				preds += `<input type='checkbox' class='order' value='${obj}'>${obj}</input>`
				preds += `<span><select id='order-${obj}'><option value='ASC'>Ascending order</option><option value='DESC'>Descending order</option></select></span><br/>`
			})
		}

		$("#orders").html(preds)
		$("#orderModal").modal('toggle')
	})
	
	$("#saveOrder").click(function () {
		var orderedVar = ""
		$('.order:checked').each(function() {
			var ths = $(this).val()
			var selectedOrder = $("#order-" + ths).children("option:selected").val()
			orderedVar += " " + selectedOrder + "(?" + ths + ")"
		})
		if (orderedVar != "")
			$("#order").html("ORDER BY" + orderedVar).show()
		$("#orderModal").modal('toggle')
	})

	$("#addLimit").click(function () {
		if (sessionStorage.length > 0) {
			$("#lmt").html("<label><input type='number' class='form-control noborder' id='resLimit' /></label>").show()
			$("#limitModal").modal('toggle')
		}		
	})

	$("#saveLimit").click(function () {
		var limit = $("#resLimit").val()

		$("#limit").html("LIMIT " + limit)
		$("#limitModal").modal('toggle')
	})

	$("#toggleSubject").change(function () {
		$(".subject").toggle()
		$("#subjectVar").toggle()
	})

	$("body").keyup(function(e) {
		if (e.keyCode == 13 && e.shiftKey) { // 2: shift & 13: enter
			var triple = '\
			<tr class="pred_obj_tr addedTriple">\
				<td style="width: 50%;">\
					<input type="text" data-take="true" class="form-control noborder predicate abs" placeholder="predicate" />\
				</td>' +
				'<td style="width: 50%;">\
					<input type="text" class="form-control noborder object" placeholder="object" />\
				</td>\
			</tr>'
			$("#triplesTable tr:last").after(triple)

			$("#predicatesGroupModal > modal-body > input").val("")
			auto_suggest_predicate(".predicate")
		}
	})

	$("#downloadQuery").click(function() {
		if (sessionStorage.length > 0) {
			var prolog = $("#prolog").text().trim().replace(/\>/g,">\n")
			var select = $("#select").text().trim()
			var filter = $("#filter").text().trim()
			var triples = $("#triple-patterns").text().replace(/\s.\s/g," .\n\t")
			var patterns = $("#patterns").text().trim()
			var aggregat = $("#agg-vars").text().trim()
			var orders = $("#order").text().trim()

			var query = prolog + "\n"
			query += select + "\n"
			query += "WHERE { \n"
			query += "\t " + triples + "\n"
			query += "\t " + filter + "\n"
			query += "} \n"
			query += aggregat + "\n"
			query += orders

			console.log(query)

			var fileName =  'query.sparql'; 
			downloadInnerHtml(fileName, query, 'text/html')
		}
	});

	$("#deleteQuery").click(function(){
		$("#prolog").html("")
		$("#select").hide("")
		$("#selected-vars").html("")
		$("#where").hide()
		$("#filter").hide()
		$("#filter-conditions").html("")
		$("#triple-patterns").html("")
		$("#transform").hide()
		$("#transforms").html("")
		$("#agg-vars").html("")
		$("#agg-fnc").html("")
		$("#order").html("")
		$("#limit").html("")
		sessionStorage.clear();

		$("#addSelect").addClass("disabled")
		$("#addFilters").addClass("disabled")
		$("#addOrder").addClass("disabled")
		$("#addAggregations").addClass("disabled")
		$("#addTransform").addClass("disabled")
		$("#addLimit").addClass("disabled")
		$("#downloadQuery").addClass("disabled")
		$("#deleteQuery").addClass("disabled")

		i = 0
		filtersAdd = false
		distinct_added = false
		varsFromSelect.length = 0; // clear it
	});

	function downloadInnerHtml(filename, element, mimeType) {
		var link = document.createElement('a');
		mimeType = mimeType || 'text/plain';
	
		link.setAttribute('download', filename);
		link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(element));
		link.click(); 
	}

	function mapToJson(map) {
		return JSON.stringify([...map])
	}
	
	function jsonToMap(jsonStr) {
		return new Map(JSON.parse(jsonStr))
	}
})