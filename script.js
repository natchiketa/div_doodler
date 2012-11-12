var DOODLE_ELEM = '.doodle';

var doodleElements = {};

var doodleSession = {

}

/* KEYMAP CODES*/
TOGGLE_MODE_KEY     =  192;
MOVE_CANVAS_KEY     =   32;

DELETE_KEY          =   46;

function DDElem(leftPos, topPos, width, height) {

    DD_deactivateAll();

    // generate a reasonably unique id
    // TODO: replace this with something more robust
    var ts = new Date().getTime();
    this.ddelId = 'ddelid-' + ts;

    // populate the css object with the arguments (which are all required)
    this.css = {
        left:leftPos,
        top:topPos,
        width:width,
        height:height
    }

    // the initial state should always be drawing for now
    // TODO: this will need to be smarter when copy/paste and/or duplicate features are added
    this.state = 'drawing';

    // Create a DOM node for the element
    $("<div/>", {
        class:'dd_elem active'
    })
        .attr('data-ddel-id', this.ddelId)
        .attr('data-ddel-state', this.state)
        .css(this.css)
        .appendTo(DOODLE_ELEM);

    // initialize any per-ddelem events
    initDDElemEvents(this.ddelId);

    // assign it as an instance variable.
    this.domrep = $('.dd_elem[data-ddel-id="' + this.ddelId + '"]');


}

DDElem.prototype.setState = function (newState) {
    // set the state data attribute for the element
    $(this.domrep).attr('data-ddel-state', newState);
    // set
    this.state = newState;
}

DDElem.prototype.redraw = function () {
    $(this.domrep).css(this.css)
}

DDElem.prototype.delete = function () {
    $(this.domrep).remove();
    delete doodleElements[this.ddelId];
}

function DD_activateDDEl(ddelid){
    doodleElements[ddelid].setState('active');
    $(doodleElements[ddelid].domrep).addClass('active');
}


function DD_deactivateAll(){

    // If another shape was set to active, it should not be, anymore.
    var activeDDElems = $('.dd_elem.active, .dd_elem[data-ddel-id="active"]');
    $(activeDDElems).removeClass('active');

}

function DD_getCurrent(){

    var curDDEl = {
        domrep: $('.dd_elem[data-ddel-state="drawing"]').first(),
        obj: doodleElements[$('.dd_elem[data-ddel-state="drawing"]').first().data('ddel-id')]
    }

    return ( $(curDDEl.domrep).length > 0 ) ? curDDEl.obj : false;

}

function DD_setDDElAtCursor(ddelem){
    /* All .dd_elem elements have a hover event which triggers when the cursor is above them, enabling
     * us to track which one is under the cursor and on the top of the 'stack'
     * */

     // extract the id
    var ddelemid = $(ddelem).attr('data-ddel-id');

    // set a data attribute in the doodle for this
    $(DOODLE_ELEM).attr('data-ddel-at-cursor', ddelemid);

    // and in the doodleSession object, point to the ddel object
    doodleSession.ddelAtCursor = doodleElements[ddelemid];

}

function initDDElemEvents(ddelemid) {

    $('.dd_elem[data-ddel-id="' + ddelemid + '"]').hover(

        function(){
            DD_setDDElAtCursor($(this))
        },

        function(){
            if ( $(DOODLE_ELEM).attr('data-ddel-at-cursor') == ddelemid ) {
                $(DOODLE_ELEM).attr('data-ddel-at-cursor', '');
                doodleSession.ddelAtCursor = null;
            }
        }

    );

}


$(document).ready(function () {

    $(DOODLE_ELEM).on({

        mousedown: function(event){

            if ($(DOODLE_ELEM).hasClass('dd_mode-draw')) {
                // calculate the click position relative to the .doodle element
                var left = event.pageX - $(this).offset().left;
                var top = event.pageY - $(this).offset().top;

                // create a new DDElem instance at those coordinates;
                var ddel = new DDElem(left, top, 0, 0);

                doodleElements[ddel.ddelId] = ddel;
            } else {



            }

        },

        mousemove: function(event){

            var curDDEl = DD_getCurrent();

            // if an element in a drawing state was found
            if (curDDEl && curDDEl.state == 'drawing') {

                // calculate the new width and height for the element based on the cursor's position relative
                // to the left and top css values
                curDDEl.css.width  = event.pageX - $(curDDEl.domrep).offset().left || 0;
                curDDEl.css.height = event.pageY - $(curDDEl.domrep).offset().top  || 0;

                // redraw
                curDDEl.redraw();
            }

        },

        mouseup: function(event){

            if ($(DOODLE_ELEM).hasClass('.dd_mode-draw')) {
                var curDDEl = DD_getCurrent();

                // if an element in a drawing state was found
                if (curDDEl.state == 'drawing') {
                    curDDEl.setState('active');
                    // redraw
                    curDDEl.redraw();

                    // if the element has no width and/or no height, remove it
                    if (curDDEl.css.width == 0 || curDDEl.css.width == 0) { curDDEl.delete(); }

                }

            } else {

                // Activate the element under the cursor, or deactivate all if there's no
                // elements under the cursor.
                if ($(DOODLE_ELEM).attr('data-ddel-at-cursor') == '') {
                    DD_deactivateAll();
                } else {
                    DD_activateDDEl($(DOODLE_ELEM).attr('data-ddel-at-cursor'));
                }

            }

        }

    });

    $(document).on({

        keyup: function(event) {
            var code = event.keyCode || event.which;

            if (code == TOGGLE_MODE_KEY) {
                event.preventDefault();
                $('.dd_editing').toggleClass('dd_mode-draw dd_mode-edit');
            }

            if (code == DELETE_KEY) {

                $('.dd_elem.active').each(function(){
                    doodleElements[$(this).data('ddel-id')].delete();
                });

            }

        },

        keydown: function(event){
            var code = event.keyCode || event.which;
            if (code == MOVE_CANVAS_KEY) {
                event.preventDefault();

            }
        }



    })

});