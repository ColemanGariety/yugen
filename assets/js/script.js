(function(){
  var token = window.location.href.substr(window.location.href.lastIndexOf('/') + 1),
    socket = io.connect('http://littlebig.co:8080'),
    edited = false,
    textField = document.getElementById('text'),
    placeholder = document.getElementById('placeholder'),
    storedContent = textField.innerHTML,
    yugen = document.getElementById('yugen'),

    saveSelection = function(containerEl) {
        var charIndex = 0, start = 0, end = 0, foundStart = false, stop = {};
        var sel = rangy.getSelection(), range;

        function traverseTextNodes(node, range) {
            if (node.nodeType == 3) {
                if (!foundStart && node == range.startContainer) {
                    start = charIndex + range.startOffset;
                    foundStart = true;
                }
                if (foundStart && node == range.endContainer) {
                    end = charIndex + range.endOffset;
                    throw stop;
                }
                charIndex += node.length;
            } else {
                for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                    traverseTextNodes(node.childNodes[i], range);
                }
            }
        }

        if (sel.rangeCount) {
            try {
                traverseTextNodes(containerEl, sel.getRangeAt(0));
            } catch (ex) {
                if (ex != stop) {
                    throw ex;
                }
            }
        }

        return {
            start: start,
            end: end
        };
    }

    restoreSelection = function(containerEl, savedSel) {
        var charIndex = 0, range = rangy.createRange(), foundStart = false, stop = {};
        range.collapseToPoint(containerEl, 0);

        function traverseTextNodes(node) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }

                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                    range.setEnd(node, savedSel.end - charIndex);
                    throw stop;
                }
                charIndex = nextCharIndex;
            } else {
                for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                    traverseTextNodes(node.childNodes[i]);
                }
            }
        }

        try {
            traverseTextNodes(containerEl);
        } catch (ex) {
            if (ex == stop) {
                rangy.getSelection().setSingleRange(range);
            } else {
                throw ex;
            }
        }
    }

    // Update the text area
    display = function(msg) {
      var savedSel = saveSelection(textField)

      var length = textField.innerHTML.length;

      textField.innerHTML = msg[0];

      if (msg[1].end < savedSel.end) {
        diff = textField.innerHTML.length - length;
        savedSel.start += diff;
        savedSel.end += diff;
      }

      restoreSelection(textField, savedSel);

      placeholderController();
    },

    // Set caret at end of #text
    setCaretAtEnd = function() {
      var range, selection;
      if(document.createRange) { //Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange();
        range.selectNodeContents(textField);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      } else if(document.selection ) { //IE 8 and lower
        range = document.body.createTextRange();
        range.moveToElementText(textField);
        range.collapse(false);
        range.select();
      }
    },

    // Send the text to the socket
    sendMsg = function() {
      setTimeout(function(){
        if (textField.innerHTML != storedContent) {
          var savedSel = saveSelection(textField)

          placeholderController();
          storedContent = textField.innerHTML;
          socket.emit('msg', [storedContent, savedSel]);
        }
      }, 4)
    },

    // Placeholder & title controller
    placeholderController = function() {
      if (["", "<br>"].indexOf(textField.innerHTML) == -1) {
        placeholder.removeClass('active')
        title = textField.innerText.split('\n')[0];

        if (title.split('. ')[0] != title) {
          title = title.split('. ')[0] + ".";
        }

        document.title = title
      } else {
        placeholder.addClass('active')
        document.title = "Yugen ⋅ A text editing experience to share.";
      }
    };

  // Extend HTML DOM class interaction
  HTMLElement.prototype.removeClass = function(cls) {
    var newClassName = "";
    var i;
    var classes = this.className.split(" ");
    for(i = 0; i < classes.length; i++) {
      if(classes[i] !== cls) {
        newClassName += classes[i] + " ";
      }
    }
    this.className = newClassName;
    return this;
  }

  HTMLElement.prototype.addClass = function(cls) {
    this.className += (" " + cls);
    return this;
  }

  // Bind events
  if (textField.addEventListener) {
    textField.addEventListener('change', sendMsg, false);
    textField.addEventListener('keydown', sendMsg, false);
    yugen.addEventListener('click', function() { $.jStorage.set('create', true) }, false);
  } else if(textField.attachEvent) {
    textField.attachEvent('onchange', sendMsg);
    textField.attachEvent('onkeydown', sendMsg);
    yugen.attachEvent('onclick', function() { $.jStorage.set('create', true) });
  } else {
    textField.onchange = sendMsg;
    textField.onkeydown = sendMsg;
    yugen.onclick = function() { $.jStorage.set('create', true) };
  };

  // Focus #text
  textField.focus();

  // Join the room
  socket.on('connect', function(){
    socket.emit('join', token);
  });

  // Begin socket connection
  socket.on('msg', display);

  // Set caret on page load
  setCaretAtEnd();

  // Strip HTML from title
  var tmp = document.createElement("DIV");
  tmp.innerHTML = document.title;
  document.title = tmp.innerText;

  // "Created!" tooltip
  if ($.jStorage.get('create')) {
    tooltip = document.getElementById('tooltip');

    tooltip.addClass('active').innerHTML = "Created!";
    tooltip.addClass('created');

    $.jStorage.set('create', false);
    setTimeout(function(){
      tooltip.removeClass('active');
      setTimeout(function(){
        tooltip.innerHTML = "New Yugen&hellip;";
        tooltip.removeClass('created')
      }, 500)
    }, 1000)
  }
})()