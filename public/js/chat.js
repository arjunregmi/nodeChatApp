const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $formLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages")

//Templates
const userMessageTemplate = document.querySelector("#user-message-template").innerHTML
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML


//OPtions
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = ()=>{
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of new message
  const newMessageStyles =getComputedStyle($newMessage)
  const newMesssageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMesssageMargin

  //Visible Height
  const visibleHeight = $messages.offsetHeight

  //Height of messages Container
  const containerHeight = $messages.scrollHeight

  //How far i have scrolled?
const scrollOffset = $messages.scrollTop + visibleHeight

if(containerHeight - newMessageHeight <= scrollOffset){
  $messages.scrollTop = $messages.scrollHeight
}
}

socket.on("message", (message) => {
  //console.log(message);
  const html = Mustache.render(messageTemplate,{
    username:message.username,
      message:message.text,
      createdAt:moment(message.createdAt).format('hh:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)

  autoscroll()
});

socket.on("usermessage", (message) => {
  //console.log(message);
  const html = Mustache.render(userMessageTemplate,{
    username:message.username,
      message:message.text,
      createdAt:moment(message.createdAt).format('hh:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)

  autoscroll()
});

socket.on("locationMessage", (message)=>{
    
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('hh:mm a')
    }) 
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
   const html = Mustache.render(sidebarTemplate, {
     room,
     users
   })

   document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered");
  });
});

$formLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $formLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $formLocationButton.removeAttribute("disabled");

        console.log("Shared location");
      }
    );
  });
});

socket.emit('join', {username, room}, (error)=>{
 
  if(error){
    alert(error)
    location.href ='/'
  }
})