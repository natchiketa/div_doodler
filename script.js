var DOODLE_ELEM = '.doodle';

var doodleElements = {};

function DDElem(leftPos, topPos, width, height) {
    var ts = new Date().getTime();
    this.ddelId = 'ddelid-' + ts;
    this.css = {
        left:leftPos,
        top:topPos,
        width:width,
        height:height
    }

    this.state = 'drawing';

    $("<div/>", {
        class:'dd_elem'

    })
        .attr('data-ddel-id', this.ddelId)
        .attr('data-ddel-state', this.state)
        .css(this.css)
        .appendTo(DOODLE_ELEM);

    this.domrep = $('.dd_elem[data-ddel-id="' + this.ddelId + '"]')

}

DDElem.prototype.setState = function (newState) {
    // set the state data attribute for the element
    $(this.domrep).attr('data-ddel-state', newState);
    // set
    this.state = newState;
}

DDElem.prototype.redraw = function () { $(this.domrep).css(this.css) }

function getCurDDEl(){

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

            var curDDEl = getCurDDEl();

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

            var curDDEl = getCurDDEl();

            // if an element in a drawing state was found
            if (curDDEl) {
                curDDEl.setState('active');
                // redraw
                curDDEl.redraw();
            }

        }

    })

});