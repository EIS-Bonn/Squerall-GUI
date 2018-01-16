$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip()

  	$('.addSrc').on('click', function (e) {
		$("#sourceModal").modal('toggle')
		var type = $(this).data("type")

		$.ajax({
			method: "POST",
			url: "/getEmptyOptions",
			data: { dataType: type },
	 		dataType: "json",
		}).done(function(data) {
			var options = $("#options")
			options.html('');

			options.append("<span>Entity </span>")
			options.append("<span class='badge badge-pill badge-info' data-toggle='tooltip' data-placement='top' title='Enter a name of the entity you are about to add'> i</span>:")
			options.append("<input id='opt-entity' value='' class='form-control inpts' />")

			// Iterate through the options
			jQuery.each(data, function(index, value) {
				var indexBits = index.split("_")
				var option = indexBits[indexBits.length-1]			
		
				var descr = value[value.length - 1]
				options.append("<span>" + option + " </span>")
				options.append("<span class='badge badge-pill badge-info' data-toggle='tooltip' data-placement='top' title='" + descr + "'> i</span>:")
	
				if (value.length > 2) { // Multi-option dropbox
					options.append("<select id='opt-" + index + "' class='form-control inpts'>")
					for (var i = 0; i < value.length - 1; i++) {
						$("#opt-" + index).append("<option value='" + value[i] + "'> " + value[i] + "</option>")
					}
				} else if (index == "path") { // select file
					options.append("<div class='btn-group' data-toggle='buttons'>"+ 
									"<label class='btn btn-secondary active'>" +
									"<input type='radio' name='pathWay' id='showLocalPathInput' autocomplete='off' checked>Local</label>" +
  									"<label class='btn btn-secondary'><input type='radio' name='pathWay' id='showHDFSPathInput' autocomplete='off'>HDFS</label>" +
								   "</div>")

					options.append("<div id='pathSelector' style='width: 100%;'>"+ // class='custom-file'
					//"<input type='file' class='custom-file-input' id='opt-" + index + "-local' />" +
					"<input type='input' id='opt-" + index + "-local' class='form-control inpts' style='width: 100%;'/>" +
					"<span></span>" + //class='custom-file-control'
					"</div>")
					options.append("</select>")

					pathSwitch(index)
				} else // input
					options.append("<input id='opt-" + index + "' value='' class='form-control inpts' />")
				
			})
			$("#slctdSrc").val(type)
		})
  	})

	$('#saveSrc').on('click', function (e) {
		var slctdSrc = $("#slctdSrc").val()
		$("#sourceModal").modal('toggle')

		var optMap = new Map();
		var array = [];
		$('#options > option:selected').each(function() {
			alert($(this).text())
		    optMap.set($(this).parent().attr("id").split("-")[1], $(this).text());
		});

		// The text fields
		$('.inpts').each(function() {
		    optMap.set($(this).attr("id").split("-")[1], $(this).val()); // Eliminate 'opt'
		});
			
		console.log(mapToJson(optMap))

		$.ajax({
			method: "POST",
			url: "/setOptions",
			data: { options: mapToJson(optMap), srcType: slctdSrc },
	 		dataType: "json",
		}).done(function(data) {
			$("#options").html('');	
		})	
  	})
})

function mapToJson(map) {
    return JSON.stringify([...map]);
}

function pathSwitch(index) {
	$('input:radio[name="pathWay"]').change(function(){
		if($(this).attr("id") == 'showHDFSPathInput') {
			$("#pathSelector").html("<input id='opt-" + index + "-hdfs' type='input' value='hdfs://' class='form-control inpts' />")
		} else if($(this).attr("id") == 'showLocalPathInput') {
			$("#pathSelector").html("<input id='opt-" + index + "-local' type='input' value='' class='form-control inpts' />")
			/*$("#pathSelector").html("<div id='pathSelector'><label class='custom-file'>"+
			"<input type='file' class='custom-file-input' id='opt-" + index + "-local' />" +
			"<span class='custom-file-control'></span>" +
			"</label></div>")*/
		}
	});
}
