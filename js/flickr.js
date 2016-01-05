
$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?", {
    tags: "indy,store",
    tagmode: "all",
    format: "json"
}, function(data) {
    $.each(data.items, function(i, item) {
        $("<img/>").attr("src", item.media.m).appendTo("#images");
        if (i === 3) {
            //return false;
        }
    })
}).error(function(e){
      $(".modal-header").text("Images  could not be loaded. Please try again later.");
  });
