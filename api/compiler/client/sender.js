const { WebSocket } = require('ws')

const socket = new WebSocket('ws://localhost:5000/compiler')

socket.on('open', () => {
  socket.send(JSON.stringify({ type: 'file', name: 'file1.cpp', text: 'I2luY2x1ZGUgPGlvc3RyZWFtPgojaW5jbHVkZSAiZmlsZTIuaHBwIgoKdXNpbmcgbmFtZXNwYWNlIHN0ZDsKCmludCBtYWluKCl7CiAgICBoZWxsbygpOwogICAgcmV0dXJuIDA7Cn0K' }))
  socket.send(JSON.stringify({ type: 'file', name: 'file2.hpp', text: 'I2luY2x1ZGUgPGlvc3RyZWFtPgoKdm9pZCBwcmludGxvb3AoKTsKdm9pZCBoZWxsbygpOwo=' }))
  socket.send(JSON.stringify({ type: 'file', name: 'file3.cpp', text: 'I2luY2x1ZGUgImZpbGUyLmhwcCIKCnZvaWQgcHJpbnRsb29wKCl7CiAgaW50IGkgPSAxOwogIHdoaWxlKGkrKyk7Cn0KCnZvaWQgaGVsbG8oKXsKICBzdGQ6OmNvdXQgPDwgIkhlbGxvIFdvcmxkIVxuIjsKfQo=' }))
})

socket.on('message', (data) => {
  if (data == 'close') socket.close()
  else console.log('Message: %s', data)
})

socket.on('close', (data) => {
  console.log(data)
  socket.close()
})
// socket.onopen = open => {console.log(open)};

const main = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  socket.send(JSON.stringify({ type: 'start', language: 'cpp' }))
  await new Promise(resolve => setTimeout(resolve, 1000))
  // socket.send(JSON.stringify({ type: "stop", language: "cpp"}))
}

// Start script
main().catch(err => {
  console.error(err)
  process.exit(1) // Retry Job Task by exiting the process
})
