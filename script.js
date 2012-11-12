var DOODLE_ELEM = '.doodle';

var doodleElements = {};

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

    // assign it as an instance variable.
    this.domrep = $('.dd_elem[data-ddel-id="' + this.ddelId + '"]');

}

DDElem.prototype.setState = function (newState) {
    // set the state data attribute for the element
    $(this.domrep).attr('data-ddel-state', newState);
    // set
    this.state = newState;
}

DDElem.prototype.redraw = function () { $(this.domrep).css(this.css) }

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


$(document).ready(function () {

    $(DOODLE_ELEM).on({

        mousedown: function(event){

            // calculate the click position relative to the .doodle element
            var left = event.pageX - $(this).offset().left;
            var top  = event.pageY - $(this).offset().top;

            // create a new DDElem instance at those coordinates;
            var ddel = new DDElem(left, top, 0, 0);

            doodleElements[ddel.ddelId] = ddel;

        },

        mousemove: function(event){

            var curDDEl = DD_getCurrent();

            // if an element in a drawing state was found
            if (curDDEl.state == 'drawing') {

                // calculate the new width and height for the element based on the cursor's position relative
                // to the left and top css values
                curDDEl.css.width  = event.pageX - $(curDDEl.domrep).offset().left || 0;
                curDDEl.css.height = event.pageY - $(curDDEl.domrep).offset().top  || 0;

                // redraw
                curDDEl.redraw();
            }

        },

        mouseup: function(event){

            var curDDEl = DD_getCurrent();

            // if an element in a drawing state was found
            if (curDDEl.state == 'drawing') {
                curDDEl.setState('active');
                // redraw
                curDDEl.redraw();
            } else {
                DD_deactivateAll();
            }

        }

    })

});