import { lchmod } from "fs";

// get articles as jason
$.getJSON("/articles", function (data){
    for (var i = 0; i < data.length; i++){
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br>" + data[i].link + "</p>");
    }
});


$(document).on("click", "p", function(){
    $("#notes").empty();
    var id = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/articles/" + id
    }).done(function(data){
        console.log(data);
        // making the new note form
        $("#notes").append("<h2>" + data.title + "</h2>");
        $("#notes").append("<input id='titleinput' name='title'>");
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea");
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save This Here Note Eh</button>");

        // if note already exists, show it
        if (data.note) {
            $("#titleinput").val(data.note.title);
            $("#bodyinput").val(data.note.body);
        }
    });
});

$(document).on("click", "#savenote", function(){
    var id = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + id,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    }).done(function(data){
        console.log(data);
        $("#notes").empty();
    });
    // clean it up
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

