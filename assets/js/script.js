var token = window.location.href.substr(window.location.href.lastIndexOf('/') + 1),
  socket = io.connect('http://localhost:8080'),
  edited = false,
  textField = document.getElementById('text'),
  placeholder = document.getElementById('placeholder'),
  storedContent = textField.innerHTML,
  yugen = document.getElementById('yugen'),

  // Update the text area
  display = function(msg) {
    textField.innerHTML = msg;

    placeholderController();
  },

  // Send the text to the socket
  sendMsg = function() {
    setTimeout(function(){
      if (textField.innerHTML != storedContent) {
        placeholderController();
        socket.emit('msg', textField.innerHTML);
        storedContent = textField.innerHTML;
      }
    }, 4)
  },

  // Placeholder controller
  placeholderController = function() {
    if (["", "<br>"].indexOf(textField.innerHTML) == -1) {
      placeholder.removeClass('active')
    } else {
      placeholder.addClass('active')
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

// Set caret at end of #text
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

// "Created!" tooltip
if ($.jStorage.get('create')) {
  tooltip = document.getElementById('tooltip');

  tooltip.addClass('active').innerHTML = "Created!"
  tooltip.style.right = '26px';

  $.jStorage.set('create', false)
  setTimeout(function(){
    tooltip.removeClass('active')
    setTimeout(function(){
      tooltip.innerHTML = "New Yugen&hellip;"
      tooltip.style.right = '19px';
    }, 500)
  }, 1000)
}