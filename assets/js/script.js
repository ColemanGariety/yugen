var socket = io.connect('http://localhost:8080'),
  inputField = document.getElementById('inputField')

socket.on('msg', display)

function display(msg) {
  document.getElementById('text').value = msg;
}

function sendMsg() {
  socket.emit('msg', inputField.value)
  display(inputField.value)
  inputField.value = ''
}

document.getElementById('form').onsubmit = function() {
  sendMsg();
  return false;
}