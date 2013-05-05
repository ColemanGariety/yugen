var socket = io.connect('http://localhost:8080'),

  textField = document.getElementById('text')

  display = function(msg) {
    textField.value = msg
  },

  sendMsg = function() {
    setTimeout(function(){
      socket.emit('msg', textField.value)
    }, 0)
  };

if (textField.addEventListener) {
  textField.addEventListener("keydown", sendMsg, false);
  textField.addEventListener("paste", sendMsg, false);
  textField.addEventListener("cut", sendMsg, false);
} else if(textField.attachEvent) {
  textField.addEventListener("onkeydown", sendMsg);
  textField.addEventListener("onpaste", sendMsg);
  textField.addEventListener("oncut", sendMsg);
} else {
  textField.onkeydown = sendMsg;
  textField.onpaste = sendMsg;
  textField.oncut = sendMsg;
};

textField.focus();

socket.on('msg', display);