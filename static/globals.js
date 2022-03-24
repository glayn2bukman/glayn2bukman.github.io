var URLS = {
};

var DATA_REFRESH_RATE = 60; // time is in seconds

function clear(el)
{
    while (el.childNodes.length)
        el.removeChild(el.childNodes[0]);
}

// the show/hide_modal functions rely on jquerry
function show_modal(modal_id){$('#'+modal_id).modal('show');}
function hide_modal(modal_id){$('#'+modal_id).modal('hide');}

function flag_error(error)
{
    swal({
        title: "Error!",
        text: error,
        type: "error",
        confirmButtonText: "Ok"
    });
}

function show_info(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "info",
        confirmButtonText: "Ok"
    });
}

function show_success(msg)
{
    swal({
        title: "Info!",
        text:msg,
        type: "success",
        confirmButtonText: "Ok"
    });
}


function stop_loading()
{
    document.getElementById("loading").style.display = "none";
}

function start_loading()
{
    document.getElementById("loading").style.display = "block";
}

function scroll_to_bottom(div_id)
{
    var div = document.getElementById(div_id);
    div.scrollTop = div.scrollHeight;
}

function logout()
{
    swal({
          title: "Logout?",
          text: "are you sure?",
          type: "warning",
          showCancelButton: true,
          closeOnConfirm: true,
          animation: "slide-from-top",
          confirmButtonText:"Yes",
          cancelButtonText:"No",
        },
        
        function(msg){
            if (msg === false) {return false;} // clicked "cancel"

            // perform any validations you want here...
            window.location.href = "/";
        }
    );

}

function connection_failed(){
    stop_loading();
    show_info('failed to connect to server. are we online?');
}


function human_readable(value, dp)
{
    try{
        value/2.3;
        
        if (!isNaN(dp))
            value = value.toFixed(dp);
        else
            value = value.toString();
    }
    catch(e){
        // value already a string as we want it!
    }
    
    if (isNaN(parseFloat(value)))
    {
        return value;
    }

    dp_index = value.indexOf(".");
    dp_index = dp_index<0 ? value.length-1 : dp_index-1;
        
        // array to contain new human-readable value format...
    value_reverse = [];
    for (var i=value.length-1; i!=dp_index; --i)
        value_reverse.push(value[i]);
    
    for (var i=dp_index, counter=1; i>=0; --i)
    {
        value_reverse.push(value[i]);
        if (counter==3 && i)
        {
            value_reverse.push(",");
            counter = 0;
        }

        counter++;
    }

    value_reverse.reverse();

    if (!isNaN(dp) && !dp)
    {
        value = value_reverse.join("");
        if (value.indexOf(".")>=0)
            return value.slice(0, value.indexOf("."));
    }
    
    return value_reverse.join("");

    
}

function figure_in_words(n)
{
    var string = n.toString(), 
        units, 
        tens, 
        scales, 
        start, 
        end, 
        chunks, 
        chunksLen, 
        chunk, 
        ints, 
        i, 
        word, 
        words, 
        and = 'and';

    /* Is number zero? */
    if( parseInt( string ) === 0 ) {
        return 'zero';
    }

    /* Array of units as words */
    units = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ];

    /* Array of tens as words */
    tens = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ];

    /* Array of scales as words */
    scales = [ '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion' ];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while( start > 0 ) {
        end = start;
        chunks.push( string.slice( ( start = Math.max( 0, start - 3 ) ), end ) );
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if( chunksLen > scales.length ) {
        return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for( i = 0; i < chunksLen; i++ ) {

        chunk = parseInt( chunks[i] );

        if( chunk ) {

            /* Split chunk into array of individual integers */
            ints = chunks[i].split( '' ).reverse().map( parseFloat );

            /* If tens integer is 1, i.e. 10, then add 10 to units integer */
            if( ints[1] === 1 ) {
                ints[0] += 10;
            }

            /* Add scale word if chunk is not zero and array item exists */
            if( ( word = scales[i] ) ) {
                words.push( word );
            }

            /* Add unit word if array item exists */
            if( ( word = units[ ints[0] ] ) ) {
                words.push( word );
            }

            /* Add tens word if array item exists */
            if( ( word = tens[ ints[1] ] ) ) {
                words.push( word );
            }

            /* Add 'and' string after units or tens integer if: */
            if( ints[0] || ints[1] ) {

                /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                if( ints[2] || ! i && chunksLen ) {
                    words.push( and );
                }

            }

            /* Add hundreds word if array item exists */
            if( ( word = units[ ints[2] ] ) ) {
                words.push( word + ' hundred' );
            }

        }

    }

    return words.reverse().join( ' ' );
}

function notify(msg)
{
    var notification = document.getElementById("notification");
    notification.innerHTML = msg;
    notification.style.display="block";
    notification.style.opacity="1";
    setTimeout(function(){
        notification.style.opacity="0";
        setTimeout(function(){
            notification.style.display="none";        
        }, 2000)
    }, 1000);
}
