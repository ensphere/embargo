
/**
 * Ensphere Container
 */
$.fn.ensphere = new function() {

    /**
     *
     * @type {embargo}
     */
    this.embargo = new function() {

        /**
         * GUID
         * @returns {string}
         */
        var guid = function()
        {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }

        /**
         * S4
         * @returns {string}
         */
        var s4 = function()
        {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        /**
         * Remove Page Loader
         */
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
                var _guid = guid();
                $(this).attr( 'data-guid', _guid );
                methods.push({
                    method : $(this).attr( 'data-api' ),
                    callback : $(this).attr( 'data-api-callback' ),
                    modelId : parseInt( $(this).attr( 'data-model-id' ) ),
                    guid : _guid
                });
            });
            $.get( '/api/render', { actions : methods }, function( responses ) {
                for( var i in responses ) {
                    if( typeof window[responses[i].callback] !== 'undefined' ) {
                        window[responses[i].callback](responses[i].response, $('[data-guid="' + responses[i].guid + '"]') );
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
