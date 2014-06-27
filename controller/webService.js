function requestFromServer(url){
    var result;
    console.log(url);
    $.ajax({
       type: 'post',
       url: url,
       dataType: 'xml',
       success: function(xmlDoc) {
           
         result=$(xmlDoc).text();
     }
       });
    return result;
}