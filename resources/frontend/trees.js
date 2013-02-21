var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);
var heatmap = new google.maps.visualization.HeatmapLayer();
var map;

$.getJSON('/species')
	.success(function(list) {

		map = new google.maps.Map(document.getElementById('map-canvas'), {
			center: sanFrancisco,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.SATELLITE
		});

		var adjustHeight = function() {
			$('.trees-list').css('height', $('body').height() - 50);
		};
		adjustHeight();
		$(window).resize(adjustHeight);

		$('.trees-list').html('');
		list.forEach(function(nameAndCount) {
			$('.trees-list').append(
				$([
					'<a href="javascript:;" class="tree-option">',
						'<span class="count">' + nameAndCount[1] + '</span>',
						'<span class="name">' + nameAndCount[0] + '</span>',
					'</a>'
				].join(''))
			);
		});

		$('.trees-list .tree-option').first().click();

	});

markers = [];

$('.trees-list').delegate('.tree-option', 'click', function(e) {
  var $clicked = $(e.currentTarget);
	$clicked.toggleClass('active');

  if($clicked.hasClass('active') && !$clicked.find('.image').length) {
    var treeName = $clicked.children('.name').text();

    /*
    var nameParts = treeName.split(' :: ');
    var name = (nameParts.length === 1 || nameParts[1].trim() === '') ? nameParts[0] : nameParts[1];
    */
    var name = treeName;

    var $loading = $('<div class="image">...</div>').appendTo($clicked);

    $.get('/image', {'species': name})
      .success(function(url) {
        var $img = $('<img class="image" src="' + url + '">').appendTo($clicked).hide();
        $img.load(function() {
          $loading.remove();
          $img.show();
        })
      });
  }

  var selected = $('.trees-list .active')
    .map(function(_, el) { return $(el).children('.name').text(); })
    .toArray()
    .join(',');

	$.getJSON('/trees', {'species': selected})
		.success(function(data) {
			/*
			var heatmapData = data.map(function(latlng) {
				return new google.maps.LatLng(latlng[0], latlng[1]);
			});

			heatmap.setMap(null);

			heatmap = new google.maps.visualization.HeatmapLayer({
				data: heatmapData
			});

			heatmap.setMap(map);
			*/

			markers.forEach(function(marker) { marker.setMap(null); });

			markers = data.map(function(latlng) {
				return new google.maps.Marker({
					position: new google.maps.LatLng(latlng[0], latlng[1]),
					title: "Hello World!"
				});
			});

			markers.forEach(function(marker) { marker.setMap(map); });
		});
});
