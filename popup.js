function inputOnChange(){
  document.getElementById('status').textContent = 'hello world';
}

init();
function init(){
  // document.getElementById('status').textContent = localStorage.apiKey;

  setElementValue('apiKey', localStorage.apiKey);
  setElementValue('destinationAddress', localStorage.destinationAddress);
}

function getVar(varName){
  chrome.storage.local.set({'words': words});
}

function setVar(varName){
  chrome.storage.local.set({'words': words});
}

function setElementValue(element, value){
  if(value != undefined){
    document.getElementById(element).value = value;
  }
}

function getElementValue(element){
  return document.getElementById(element).value;
}


document.addEventListener('DOMContentLoaded', function(){
  var inputElement = document.getElementById('apiKey');

  inputElement.addEventListener('change',function(){
    localStorage.apiKey = getElementValue('apiKey');
    // document.getElementById('status').textContent = localStorage.apiKey;
  });
});