
/**
 * Ensphere Container
 */
$.fn.ensphere = new function() {

    /**
     *
     * @type {embargo}
     */
    this.embargo = new function() {

        var removePageLoader = function()
        {
            var loader = $('#loader');
            if( loader.length ) {
                loader.fadeOut( 200, function(){
                    $(this).remove();
                });
            }
        };

        var distributeApiRequests = function()
        {
            var methods = [];
            $('[data-api]').each( function(){
                methods.push({
                    method : $(this).attr( 'data-api' ),
                    callback : $(this).attr( 'data-api-callback' )
                });
            });
            $.get( '/api/render', { actions : methods }, function( responses ) {
                for( var i in responses ) {
                    if( typeof window[responses[i].callback] !== 'undefined' ) {
                        window[responses[i].callback](responses[i].response);
                    } else {
                        console.log( '[API Renderer] ' + responses[i].callback + ' is not a valid api callback' );
                    }
                }
            });
        };

        var onDocumentReady = function()
        {
            distributeApiRequests();
        };

        var onWindowLoad = function()
        {
            removePageLoader();
        };

        $(document).ready( onDocumentReady );
        $(window).load( onWindowLoad );

    };
};
