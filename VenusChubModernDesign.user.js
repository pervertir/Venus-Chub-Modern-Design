// ==UserScript==
// @name         Modern Design
// @namespace    VenusChub
// @version      v1.0
// @description  Moescape like UI for Venus Tavern.
// @author       Pervertir
// @homepageURL  https://github.com/pervertir/Venus-Chub-Modern-Design
// @supportURL   https://github.com/pervertir/Venus-Chub-Modern-Design/issues
// @downloadURL   https://github.com/pervertir/Venus-Chub-Modern-Design/raw/main/VenusChubModernDesign.user.js
// @updateURL    https://github.com/pervertir/Venus-Chub-Modern-Design/raw/main/VenusChubModernDesign.user.js
// @match        https://venus.chub.ai/*
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chub.ai
// @connect      *
// ==/UserScript==

(async function() {
    'use strict';

    GM_addStyle(`
        .ant-image {
            border-radius: 50% !important;  /* Make it a circle */
            overflow: hidden !important;     /* Hide overflow */
            object-fit: cover !important;
            position: top center;
        }

        .ant-list-item-meta {
            max-width:95% !important;
            text-align:left;

        }

        .ant-list-item {
            border-radius: 0.5rem !important;
            margin-top :0.8rem !important;

        }
    `); // Makes the character image circular


    const bgImageSelector = "#root > div > div > div.ant-layout.sc-dmXWDj.cBaqtx.chat-layout-bigbox.css-4aj7a5 > div:nth-child(1)";
    const inputHolderSelector = 'form>div.d-flex.align-center';
    const messageInputSelector = "textarea.ant-input";
    const chatAreaSelector = "div.no-scrollbar .ant-col-xs-24.ant-col-md-24.ant-col-lg-24";
    const blankSpaceSelector = "div.ant-col-lg-5";
    const expandedSpaceSelector = "#image-left";
    const headerSelector = "#root > div > div > div.ant-layout.sc-dmXWDj.cBaqtx.chat-layout-bigbox.css-4aj7a5 > div.ant-row.ant-row-center.css-4aj7a5 > div";
    const antLogo = "#root > div > div > div.ant-layout.sc-dmXWDj.cBaqtx.chat-layout-bigbox.css-4aj7a5 > div.ant-row.ant-row-center.css-4aj7a5 > div > span > div > span";

    async function urlToBase64(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                responseType: 'blob',
                onload: function (response) {
                    if (response.status === 200) {
                        const blob = response.response;
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result.split(',')[1]);
                        reader.readAsDataURL(blob);
                    } else {
                        reject(new Error(`HTTP error! Status: ${response.status}`));
                    }
                },
                onerror: function (error) {
                    console.error('Error fetching image:', error);
                    reject(error);
                }
            });
        });
    }


    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }


    // Wait for the element to be available
    function waitForElement(selector, callback) {
        console.log(`Finding Element:`, selector);
        const observer = new MutationObserver((mutations, observer) => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Element found:`, element);
                callback(element);

                observer.disconnect(); // Stop observing once found
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }


    // Function to modify the textarea
    function modifyMessageInput(textarea) {
        textarea.setAttribute('placeholder', 'Message...');

        textarea.style.fontSize = '0.9rem';

        textarea.style.width = '30vw';
        textarea.style.height = '32px';
        textarea.style.maxHeight = '128px';

        textarea.style.lineHeight = '1.4rem';
        textarea.style.margin = '0.05rem';

        textarea.style.borderRadius = '1.5rem';
        textarea.style.overflow = 'hidden';
        textarea.classList.add('align-center');

        textarea.addEventListener('input', function() {
            this.style.height = '32px'; // Reset height
            this.style.height = this.scrollHeight + 'px'; // Set height based on content
        });
    }

    function modifyChatArea(div) {
        div.classList.remove('ant-col-lg-24');
        div.classList.add('ant-col-lg-16');
        div.parentElement.style.marginTop = '10vh';
    }

    function expandLeft(div) {
        div.classList.remove('ant-col-lg-5');
        div.classList.add('ant-col-lg-10');
        div.id = "image-left";
    }

    function shrinkRight(div) {
        div.classList.remove('ant-col-lg-5');
        div.classList.add('ant-col-lg-2');
    }

    function spreadHeader(div){
        div.style.position = 'fixed'; // or 'absolute' based on your layout
        div.style.left = '50%'; // Position at the center
        div.style.transform = 'translateX(-50%)'; // Center the element
        div.style.right = '0';
        div.style.width = '80vw';
        div.style.zIndex = '9999'; // Adjust as necessary
    }

    function disableLogo(span){
        span.style.pointerEvents = 'none'; // Disable mouse events
        span.style.display = 'none';
        span.style.cursor = 'not-allowed'; // Change cursor to not-allowed
    }

    function centerInput(div){
        div.classList.add('justify-center');
    }



    async function addCharacterImage(div, imageUrl){
        const imageBase64 = await urlToBase64(imageUrl);
        div.style.backgroundImage = `url("data:image;base64,${imageBase64}")`;
        div.style.backgroundSize = "cover";
        div.style.backgroundRepeat = "no-repeat";
        div.style.backgroundPosition = "top center";
        div.style.width = "90vw";
        div.style.height = "90vh";
        div.style.top = "7vh";
        div.style.left = "5vw";
        div.style.zIndex = "9";
        div.style.overflow = "hidden";
        div.style.borderRadius = "50%";

    }

    async function getBgURL(div){

        const style = div.style.backgroundImage;
        const imageUrl = null;
        div.style.filter = 'blur(3px)'

        // Extract the URL using a regular expression
        const urlMatch = style.match(/url\(["']?([^"']+)["']?\)/);

        if (urlMatch) {
            const imageUrl = urlMatch[1];
            if (imageUrl === 'none'){
                div = waitForElement(bgImageSelector, getBgURL);
                getBgURL(div);
            } else {
                console.log(imageUrl); // Logs the image URL
                let expandedDiv = document.querySelector(expandedSpaceSelector);
                if (expandedDiv){
                    console.log(`Expanded space: `, expandedDiv);
                    addCharacterImage(expandedDiv, imageUrl);
                }

            }

        } else {
            console.log("No background image found.");
        }

        return imageUrl;

    }

    // Call the wait function for the textarea element
    waitForElement(headerSelector, spreadHeader);
    waitForElement(antLogo, disableLogo);

    waitForElement(messageInputSelector, modifyMessageInput);
    waitForElement(inputHolderSelector, centerInput);

    waitForElement(blankSpaceSelector, expandLeft);
    waitForElement(blankSpaceSelector, shrinkRight);

    waitForElement(chatAreaSelector, modifyChatArea);

    waitForElement(bgImageSelector, getBgURL);

})();