// MARKERS or HEATMAP
var mode = 'MARKERS';

var map;
var markers = [];
var heatmap = new google.maps.visualization.HeatmapLayer();

function getTrees() {
  var selected = $('.trees-list .active')
    .map(function(_, el) { return $(el).children('.name').text(); })
    .toArray()
    .join('&');

	$.getJSON('/trees/' + selected)
    .always(clearTrees)
		.success(addTrees);
}

function clearTrees() {
  if(mode === 'MARKERS') {
    markers.forEach(function(marker) { marker.setMap(null); });
  } else {
    heatmap.setMap(null);
  }
}

function addTrees(data) {
  if(mode === 'MARKERS') {

    markers = data.map(function(latlng) {
      return new google.maps.Marker({
        position: new google.maps.LatLng(latlng[0], latlng[1])
      });
    });

    markers.forEach(function(marker) { marker.setMap(map); });

  } else {

    var heatmapData = data.map(function(latlng) {
      return new google.maps.LatLng(latlng[0], latlng[1]);
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData
    });

    heatmap.setMap(map);

  }
}

$('.mode-options a').click(function(e) {
  var $clicked = $(e.currentTarget);

  $('.mode-options a').removeClass('active');
  $clicked.addClass('active');

  var newMode = $clicked.data('mode');
  if(mode !== newMode) {
    clearTrees();
    mode = newMode;
    getTrees();
  }
});

$('.trees-list').delegate('.tree-option', 'click', function(e) {
  var $clicked = $(e.currentTarget);
	$clicked.toggleClass('active');

  if($clicked.hasClass('active') && !$clicked.find('.image').length) {
    var treeName = $clicked.children('.name').text();

    //var species = treeName.split(' :: ')[0];
    var species = treeName;

    var $loading = $('<div class="image">...</div>').appendTo($clicked);

    var getImg = function() {
      $.ajax({
        url: '/image',
        data: {'species': species},
        dataType: 'text',
        success: function(url) {
          var $img = $('<img class="image">').appendTo($clicked).hide();
          $img.load(function() {
            $loading.remove();
            $img.show();
          });
          // if image 404s, try again for another random image.
          $img.error(getImg);
          $img.attr('src', url);
        }
      });
    };
    getImg();
  }

  getTrees();
});

$.getJSON('/species')
  .success(function(list) {

    var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);

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

    // choose a random species with a reasonable number of trees to show
    var candidates = $('.tree-option').filter(function(_, el) {
      var count = parseInt($(el).children('.count').text(), 10);
      return count <= 200 && count >= 100;
    });
    var $chosen = $(candidates[Math.floor(Math.random() * candidates.length)]);
    $chosen.click();
    // and scroll so that it's in view
    $('.trees-container').scrollTop($chosen.offset().top - 100);

  });
