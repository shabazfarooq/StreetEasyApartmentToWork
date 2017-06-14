// To do:
// - callbacks coming back in random order, order results
// - get better icons
// - build popup thing and have it save 

// Constants
const google_ApiUrl = 'https://maps.googleapis.com/maps/api/directions/json';
const currentUrlPath = window.location.pathname;

// User editable (build popup.html to allow user to set these)
let destinationAddress = '11 east 26th street ny ny';
let google_ApiKey = '';

let modesObject = {
  driving:{
    isActive: true,
    apiName: 'driving',
    imageUrl: chrome.extension.getURL('driving.png'),
    htmlColorCode: '#df7edf'
  },
  walking:{
    isActive: true,
    apiName: 'walking',
    imageUrl: chrome.extension.getURL('walking.png'),
    htmlColorCode: '#4444bf'
  },
  bicycling:{
    isActive: true,
    apiName: 'bicycling',
    imageUrl: chrome.extension.getURL('bicycling.png'),
    htmlColorCode: '#5fc55f'
  },
  transit:{
    isActive: true,
    apiName: 'transit',
    imageUrl: chrome.extension.getURL('transit.png'),
    htmlColorCode: '#ffad17'
  }
};

init();

function init(){
  if(currentUrlPath.startsWith('/for-sale') || currentUrlPath.startsWith('/for-rent')){
    try{
      // Get apartment listings array
      let apartmentListingDomElements = getApartmentListingsDomElements();
      // alert(apartmentListingDomElements.length);

      for(let i=0; i<apartmentListingDomElements.length; i++){
        let currentApartmentDomElement = apartmentListingDomElements[i];
        let apartmentAddress = getApartmentAddressFromDomElement(currentApartmentDomElement);


        Object.keys(modesObject).forEach(function(modeKey){
          let modeObject = modesObject[modeKey];

          if(modeObject.isActive){
            executeGoogleCallout(
              google_ApiUrl,
              google_ApiKey,
              apartmentAddress,
              destinationAddress,
              modeObject,
              currentApartmentDomElement
            );
          }
        });
      }
    }
    catch(errorMessage){
      handleError(errorMessage);
    }
  }
}

function getApartmentListingsDomElements(){
  let apartmentListingsOnDom;
  let hasError = false;

  try{
    apartmentListingsOnDom = document.getElementsByClassName('left-two-thirds items item-rows listings')[0].getElementsByClassName('item');
  }
  catch(error){
    hasError = true;
  }

  if(hasError || !apartmentListingsOnDom.length){
    throw 'Unable to locate apartment listings on current page';
  }

  return apartmentListingsOnDom;
}

function getApartmentAddressFromDomElement(apartmentListingDomElement){
  let apartmentAddress;

  try{
    let detailsRow   = apartmentListingDomElement.getElementsByClassName('details row')[0];
    let dirtyAddress = detailsRow.getElementsByClassName('details-title')[0].getElementsByTagName('a')[0].innerText;
    let dirtyCity    = detailsRow.getElementsByClassName('details_info')[1].innerText;

    apartmentAddress = cleanAddress(dirtyAddress) + cleanCity(dirtyCity);
  }
  catch(errorMessage){
    throw 'Unable to extract addresses from apartment listings';
  }

  // Remove words beginning with hashtag
  function cleanAddress(dirtyAddress){
    return dirtyAddress.replace(/#\w+/g, '');
  }

  // Extract words after "in"
  function cleanCity(dirtyCity){
    return dirtyCity.replace(/[^]*(in )/g, '');
  }

  return apartmentAddress;
}

function executeGoogleCallout(baseUrl, apiKey, origin, destination, modeObject, domElementToUpdate){
  let apiUrl = buildApiUrl(baseUrl, apiKey, origin, destination, modeObject.apiName);
  executeCallout(apiUrl, modeObject, domElementToUpdate);

  function buildApiUrl(baseUrl, apiKey, origin, destination, mode){
    origin = replaceSpaces(origin);
    destination = replaceSpaces(destination);

    return `${baseUrl}?origin=${origin}&destination=${destination}&mode=${mode}&&key=${apiKey}`;

    function replaceSpaces(str){
      return str.split(' ').join('+');
    }
  }

  function executeCallout(apiUrl, modeObject, apartmentAddressDomElement){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        // Google response on address not found
        // JSON.parse(this.responseText).status == NOT_FOUND
        
        let time;
        try{
          time = JSON.parse(this.responseText).routes[0].legs[0].duration.text;
        }
        catch(error){
          time = ':(';
        }

        updateDomElementWithGoogleResponse(apartmentAddressDomElement, modeObject, time);
      }
    };
    
    xhttp.open('GET', apiUrl, true);
    xhttp.send();
  }
}

function updateDomElementWithGoogleResponse(addressListingDomElement, modeObject, transitTime){
  // Build primary div
  let newDiv = document.createElement('div');
  newDiv.className = 'details_info';

  // Build image
  let newImage = document.createElement('img');
  newImage.src = modeObject.imageUrl;
  newImage.style.cssText = 'width: 38px; margin-top: 10px; padding-right:10px;';

  // Time text
  let newSpan = document.createElement('span');
  newSpan.style.cssText = 'color: '+ modeObject.htmlColorCode +'; font-weight: bold; font-size: 16px; line-height: 43px; vertical-align: top;';
  newSpan.textContent = transitTime;

  // Build element
  newDiv.appendChild(newImage);
  newDiv.appendChild(newSpan);

  // Append new element
  addressListingDomElement.getElementsByClassName('details row')[0].appendChild(newDiv);
}

function buildDomElement(transitType, transitTime){
  return `<div class="details_info">${transitType} - ${transitTime}</div>`;
}

function handleError(errorMessage){
  alert('StreetEasyPlugin: ' + errorMessage);
  // exit?
}