$(document).ready(function(){
  var mp = ""
	$("#generateMappings").click(function() {
		$.ajax({
			method: "POST",
			url: "/generateMappings",
			success: function(data) {
				mp = data
				$("#mappings-box").show()
				$("#exportMappings").show()
				$("#mappings-box").html(data.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br/>").replace(/\s/g, '&nbsp;&nbsp;&nbsp;'))
				$("#exportMappings").html("<br/><button type='button' class='btn btn-primary' id='saveMappings' style='margin-bottom: 10px;'>Export mappings</button>")
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('An error occurred... open console for more information!');
				$('#result').html('<p>status code: '+jqXHR.status+'</p><p>errorThrown: ' + errorThrown + '</p><p>jqXHR.responseText:</p><div>'+jqXHR.responseText + '</div>');
				console.log('jqXHR:');
				console.log(jqXHR);
				console.log('textStatus:');
				console.log(textStatus);
				console.log('errorThrown:');
				console.log(errorThrown);
			}
		})
	})

	$("#mappings").on("click", "button#saveMappings", function() {
		var fileName =  'mappings.ttl'; 
		downloadInnerHtml(fileName, mp, 'text/html')
	});

	$("#downloadQuery").click(function() {
			var prolog = $("#prolog").text()
			var select = $("#select").text()
			var where = $("#where").text()
			var transform = $("#transform").text()
	});

	function downloadInnerHtml(filename, element, mimeType) {
    var link = document.createElement('a');
    mimeType = mimeType || 'text/plain';

    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(element));
    link.click(); 
	}
})
