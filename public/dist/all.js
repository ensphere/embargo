
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

        var onDocumentReady = function()
        {

        };

        var onWindowLoad = function()
        {
            removePageLoader();
        };

        $(document).ready( onDocumentReady );
        $(window).load( onWindowLoad );

    };
};

//# sourceMappingURL=all.js.map
