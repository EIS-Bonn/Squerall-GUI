$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip()
	auto_suggest_class()
	auto_suggest_predicate()

	$(".attr").each(function() {
		var ths = $(this)
		var attr = ths.attr("id")
		$.ajax({
			method: "GET",
			url: "http://lov.okfn.org/dataset/lov/api/v2/term/search",
			data: { q: attr },
			dataType: "json",
		}).done(function(data) {
			var pn = data.results[0].prefixedName.toString()
			var uri = data.results[0].uri.toString()
			var ns = pn.split(":")[0]
			var pred = pn.split(":")[1]
			ths.val(uri)
			$("#ns-" + attr).html("<strong>" + ns + "</strong>: " + uri.replace(pred, ""))
			$("#shortns-" + attr).val(ns)
		})
	})

	/* auto-suggest: predicates */
	function auto_suggest_predicate() {
		var getPredicates = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: 'http://lov.okfn.org/dataset/lov/api/v2/term/search?q=%q&type=property',
				wildcard: '%q',
				transform: function (results) {
					// Map the remote source JSON array to a JavaScript object array
					return $.map(results.results, function (res) {
						return {
							value: res.prefixedName,
							uri: res.uri
						};
					});
				}
			}
		});

		$('.attr').typeahead(null, {
			name: 'predicates',
			display: 'uri',
			source: getPredicates,
			templates: {
				header: '<h4 class="results from LOV">Suggestions from LOV</h4>',
				empty: [
				  '<div class="empty-message">',
					'unable to find any matching predicates',
				  '</div>'
				].join('\n'),
				suggestion: function(data) {
					return '<p><strong>' + data.value + '</strong> (' + data.uri + ')</p>';
				}
			}
		});
	
		/* auto-suggest predicate suggestion selected */
		$('.attr').bind('typeahead:select', function(ev, suggestion) {
			var ths = $(this)
			var attr = ths.attr("id")
			var pred = (suggestion.value).toString() // eg: foaf:firstName
			var prefix = pred.split(":")[0] // eg: foaf
			var url = suggestion.uri.toString() // eg: http://xmlns.com/foaf/0.1/firstName
			var ns = url.replace(pred.split(":")[1],"")

			$("#ns-" + attr).html("<strong>" + prefix + "</strong>: " + ':' + ns)
			$("#shortns-" + attr).val(prefix)
			console.log('Selection: ' + suggestion.uri);
		});
	}
	
	/* auto-suggest: class */
	function auto_suggest_class() { 		
		var getClass = new Bloodhound({
		 	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		  	queryTokenizer: Bloodhound.tokenizers.whitespace,
		  	remote: {
				url: 'http://lov.okfn.org/dataset/lov/api/v2/term/search?q=%q&type=class',
				wildcard: '%q',
				transform: function (results) {
					// Map the remote source JSON array to a JavaScript object array
					return $.map(results.results, function (res) {
						return {
							value: res.prefixedName,
							uri: res.uri
						};
					});
				}
		  	}
		});	
	
		$('#clss').typeahead(null, {
			name: 'class',
			display: 'uri',
			source: getClass,
			templates: {
				header: '<h4 class="results from LOV">Suggestions from LOV</h4>',
				empty: [
				  '<div class="empty-message">',
					'unable to find any matching class',
				  '</div>'
				].join('\n'),
				suggestion: function(data) {
					return '<p><strong>' + data.value + '</strong> (' + data.uri + ')</p>';
				}
			}
		});

		$('#clss').bind('typeahead:select', function(ev, suggestion) {
			var ths = $(this)
			var attr = ths.attr("id")
			var clss = (suggestion.value).toString() // eg: schema:author
			var prefix = clss.split(":")[0] // eg: schema
			var url = suggestion.uri.toString() // eg: http://schema.org/author
			var ns = url.replace(clss.split(":")[1],"")

			$("#ns-" + attr).html("<strong>" + prefix + "</strong>: " + ':' + ns)
			$("#shortns_clss").val(prefix)
			$("#ns_clss").val(ns)
			console.log('Selection: ' + suggestion.uri);
		});
	}

	$('input[name=pk]').change(function() {
		var radio = $(this).val()
		
		$("#" + radio).val("")
		$("#ns-" + radio).html("")
		$("#shortns-" + radio).html("")
	})

	/* save mappings to disk */
	$("#addMappings").click(function() {

		var map = new Map();

		$(".attr[id]").each(function() {
			var pred = $(this).attr("id")
			var short_ns = ""
			var mapping = $(this).val()			
			if (mapping.includes(">")) { // abc>http://example.com/publishdata => personalized URI
				var bits = mapping.split(">")
				short_ns = bits[0]
				mapping = bits[1]
			} else {
				short_ns = $("#shortns-" + pred).val() 
			}			

			map.set(pred, short_ns + "___" + mapping)			
		})
		var pk = $('input[name=pk]:checked').val()
		var dtype = $("#dtype").val()
		var shortns_clss = $("#shortns_clss").val()
		var ns_clss = $("#ns_clss").val()
		var clss = $("#clss").val()
		var src = $("#src").val()
		var entity = $("#entity").val()

		$.ajax({
			method: "POST",
			url: "/newMappings",
			data: { mappings: mapToJson(map), pk: pk, dtype: dtype, clss: clss, ns_clss: ns_clss, shortns_clss: shortns_clss, src: src, entity: entity},
	 		dataType: "json",
		}).done(function(data) {

		})
	})

	$("#addField").click(function() {
		$("#newFieldModal").modal('toggle')
	})

	$("#saveField").click(function() {
		var newField = $("#newField")
		var newFieldVal = newField.val()
		if (newFieldVal != "") {
			$("#fieldsTable tr:last").after("<tr><td>" + newFieldVal + "<td><input type='radio' name='pk' id='" + newFieldVal + "'></td><td><input type='text' class='form-control attr' id='" + newFieldVal + "'></td></tr>")
			newField.val("")
			$("#fieldAdded").css("color","blue").html("Field: " + newFieldVal + " added! you can add more")
			auto_suggest_predicate()
		} else
			$("#fieldAdded").css("color","red").html("Field name empty!")
	})
})

function mapToJson(map) {
    return JSON.stringify([...map]);
}
