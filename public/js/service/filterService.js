'use strict';

app.factory('tempService', function() {
    return {
        appendhtml: function(elem, fileurl) {
            var retval = elem;
            retval += '<img src=\"' + fileurl + '\" style=\"width:50px; height:40px;\">\n';
            return retval;
        }
    };
});